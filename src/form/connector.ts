import Nycticorax from 'nycticorax'
import eq from 'fast-deep-equal'
import type N from 'nycticorax'
import {
  FieldData,
  FieldDatas,
  State,
  FieldComponents,
  Validators,
  FieldValue,
  UnionString,
  FieldChageCallback,
  FieldChageProperty,
  ComponentPropsChageCallback,
  ObjectAny,
} from './type'

export const INITIALIZED = Symbol('INITIALIZED')

export default class<T extends FieldDatas = {}> {
  private fieldChangeSubscribers: Record<string, FieldChageCallback[]>
  private componentPropsChangeSubscribers: Record<string, ComponentPropsChageCallback<any>[]>

  public store: N<State>
  public renderers: FieldComponents
  public validators: Validators

  constructor(
    fields: T,
    config: { components: FieldComponents, validators: Validators },
  ) {
    this.fieldChangeSubscribers = {}
    this.componentPropsChangeSubscribers = {}
    this.store = new Nycticorax<State>()
    this.renderers = config.components || {}
    this.validators = config.validators || {}
    this.init(fields)
  }

  private init(fields: FieldDatas) {
    this.store.createStore({ ...fields, [INITIALIZED]: true })
  }

  private onFieldComponentChangeActual<P extends object = ObjectAny>(
    name: UnionString<keyof T>,
    properties: UnionString<'*' | keyof P>[],
    callback: ComponentPropsChageCallback<P>,
    once?: boolean,
  ) {
    if (once) {
      callback.__once = true
    }
    const actualProperties: string[] = properties.includes('*') ? ['*'] : properties

    callback.__properties = actualProperties

    this.componentPropsChangeSubscribers[name] = [
      ...this.componentPropsChangeSubscribers[name] || [],
      callback,
    ]
  }

  private onFieldChangeActual(
    name: UnionString<keyof T>,
    properties: FieldChageProperty[],
    callback: FieldChageCallback,
    once?: boolean,
  ) {
    if (once) {
      callback.__once = true
    }
    const actualProperties: FieldChageProperty[] = properties.includes('*') ? ['*'] : properties

    callback.__properties = actualProperties

    this.fieldChangeSubscribers[name] = [
      ...this.fieldChangeSubscribers[name] || [],
      callback,
    ]
  }

  public onFieldChange = this.onFieldChangeActual

  public onFieldComponentChange = this.onFieldComponentChangeActual

  public onceFieldChange(
    name: UnionString<keyof T>,
    properties: FieldChageProperty[],
    callback: FieldChageCallback,
  ) {
    this.onFieldChangeActual(name, properties, callback, true)
  }

  public onceFieldComponentChange<P extends object = ObjectAny>(
    name: UnionString<keyof T>,
    properties: UnionString<'*' | keyof P>[],
    callback: ComponentPropsChageCallback<P>,
  ) {
    this.onFieldComponentChangeActual<P>(name, properties, callback, true)
  }

  public getField(name: UnionString<keyof T>) {
    const field = this.store.getStore(name)
    if (!field) {
      throw new Error('field not exist')
    }
    return field
  }

  public getFields() {
    const state = this.store.getStore()
    return Object.keys(state).reduce((pre, cur) => ({
      ...pre,
      [cur]: state[cur],
    }), {} as FieldDatas)
  }

  public triggerSubscribers(
    name: UnionString<keyof T>,
    activeProperties: string[],
    next: ReturnType<typeof this.getField>,
    current: ReturnType<typeof this.getField>,
  ) {
    this.fieldChangeSubscribers[name]?.forEach((callback) => {
      const { __once, __properties, __triggered } = callback
      if (__once && __triggered) {
        return
      }
      if (__properties?.[0] === '*' || __properties?.find((p) => activeProperties.includes(p))) {
        callback(next, current, activeProperties as any)
        callback.__triggered = true
      }
    })
  }

  public setField(name: UnionString<keyof T>, data: Omit<FieldData, 'componentProps'>) {
    const current = this.getField(name)
    // @ts-ignore
    const { componentProps, ...rest } = data
    const next = { ...current, ...rest }

    if (eq(next, current)) {
      console.warn('triggering same properties')
      return
    }

    this.store.emit({ [name]: next }, true)

    const activeProperties = Object.keys(data)
    this.triggerSubscribers(name, activeProperties, next, current)

    if ('value' in data) {
      this.check(name).catch(() => null)
    }
  }

  public setFieldComponentProps<P extends object = ObjectAny>(
    name: UnionString<keyof T>,
    data: Partial<FieldData<P>['componentProps']>,
    replace?: boolean,
  ) {
    const current = this.getField(name)
    const currentProps = current.componentProps
    const nextProps: ObjectAny | undefined = replace ? data : { ...currentProps, ...data }

    if (eq(nextProps, currentProps)) {
      console.warn('triggering same properties')
      return
    }

    this.store.emit({
      [name]: {
        ...current,
        componentProps: nextProps,
      },
    })

    const activeProperties = Object.keys(data || {})

    this.componentPropsChangeSubscribers[name]?.forEach((callback) => {
      const { __once, __properties, __triggered } = callback
      if (__once && __triggered) {
        return
      }
      if (__properties?.[0] === '*' || __properties?.find((p) => activeProperties.includes(p))) {
        callback(nextProps, currentProps, activeProperties)
        callback.__triggered = true
      }
    })
  }

  public addField(name: string, data: FieldData) {
    if (this.store.getStore(name)) {
      throw new Error('duplicate field')
    }
    this.store.emit({ [name]: data })
  }

  public validateField(name: UnionString<keyof T>) {
    return this.check(name)
  }

  public validateFields() {
    return this.check()
  }

  private async check(name?: UnionString<keyof T>) {
    const state = this.store.getStore()
    const result: FieldValue<UnionString<keyof T>>[] = []
    const keys = name ? [name] : Object.keys(state) as UnionString<keyof T>[]
    const needChecks: { name: string }[] = []

    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i]
      const item: FieldData = state[key]

      if (item.disabled) {
        continue
      }

      result.push({ name: key, value: item.value, field: item })

      if (!item.validator || !this.validators[item.validator]) {
        if (!item.required) {
          continue
        }
      }

      needChecks.push({ name: key })

      this.store.emit({
        [key]: {
          ...item,
          validating: true
        },
      })

      this.triggerSubscribers(
        key,
        ['validating'],
        { ...item, validating: true },
        item,
      )
    }

    const checkResults = await Promise.all(needChecks.map(async (item) => {
      const { name } = item
      const field = state[name]

      let error: FieldData['error']

      if (field.loading) {
        error = 'field loading'
      } else {
        const validator = field.validator
          ? this.validators[field.validator]
          : () => field.value === undefined ? 'field required' : undefined

        error = await validator(field.value, field)
      }

      return { name, error, field }
    }))

    checkResults.forEach((item) => {
      const current = { ...state[item.name] }
      const next = { ...current, validating: false, error: item.error }

      this.store.emit({ [item.name]: next })

      this.triggerSubscribers(
        item.name,
        ['validating', current.error === next.error ? '' : 'error'].filter(Boolean),
        next,
        current,
      )
    })

    const errors = checkResults.filter((item) => item.error)

    if (errors.length) {
      throw errors
    }

    return result
  }
}
