import Nycticorax from 'nycticorax'
import eq from 'fast-deep-equal'
import type N from 'nycticorax'
import getHooks from './hooks'
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
  ConnectorChange,
} from './type'

export const INITIALIZED = Symbol('INITIALIZED')

export default class<T extends FieldDatas = any> {
  private fieldChangeSubscribers: Record<string, FieldChageCallback[]>
  private componentPropsChangeSubscribers: Record<string, ComponentPropsChageCallback<any>[]>
  private onStateChange: ConnectorChange<T>

  public store: N<State>
  public renderers: FieldComponents
  public validators: Validators
  public useFields: ReturnType<typeof getHooks<T>>['useFields']
  public useField: ReturnType<typeof getHooks<T>>['useField']

  constructor(
    fields: T,
    config: { components: FieldComponents, validators?: Validators },
  ) {
    this.fieldChangeSubscribers = {}
    this.componentPropsChangeSubscribers = {}
    this.onStateChange = () => null
    this.store = new Nycticorax<State>()
    this.renderers = config.components || {}
    this.validators = config.validators || {}
    this.useFields = () => null as any
    this.useField = () => null as any
    this.init(fields)
  }

  private init(fields: FieldDatas) {
    this.store.createStore({ ...fields, [INITIALIZED]: true })
    this.store.onChange = (v) => this.onStateChange(v as any)

    const hooks = getHooks<T>(this)
    this.useFields = hooks.useFields
    this.useField = hooks.useField
  }

  public set onChange(fn: ConnectorChange<T>) {
    this.onStateChange = fn
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

  public getFields<
    K extends keyof FieldData | undefined = undefined,
  >(key?: K): K extends keyof FieldData ? Record<UnionString<keyof T>, FieldData[keyof FieldData]> : FieldDatas<UnionString<keyof T>> {
    const state = this.store.getStore()
    return Object.keys(state).reduce((pre, cur) => ({
      ...pre,
      [cur]: key ? state[cur][key] : state[cur],
    }), {} as any)
  }

  public getFieldValues() {
    return this.getFields('value')
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

    const next = { ...current,  componentProps: nextProps }
    this.store.emit({ [name]: next }, true)

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

  public addField<P extends object = ObjectAny>(name: string, data: FieldData<P>) {
    if (this.store.getStore(name)) {
      throw new Error('duplicate field')
    }
    this.store.emit({ [name]: data })
  }

  public validateField(name: UnionString<keyof T>, catchError?: boolean) {
    if (catchError) {
      this.check(name).catch(() => null)
      return
    }
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

        if ((field.value === undefined || field.value === '') && field.required) {
          error = 'field required'
        } else {
          error = await validator(field.value, field)
        }
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
