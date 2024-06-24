import Nycticorax from 'nycticorax'
import type N from 'nycticorax'
import {
  FieldData,
  FieldDatas,
  State,
  FieldComponents,
  Validators,
  FieldValue,
  UnionString,
  CheckField,
} from './type'

export const INITIALIZED = Symbol('INITIALIZED')

export default class<T extends FieldDatas = {}> {
  public store: N<State>
  public renderers: FieldComponents
  public validators: Validators

  constructor(
    fields: T,
    config: { components: FieldComponents, validators: Validators },
  ) {
    this.store = new Nycticorax<State>()
    this.renderers = config.components || {}
    this.validators = config.validators || {}
    this.init(fields)
  }

  private init(fields: FieldDatas) {
    this.store.createStore({ ...fields, [INITIALIZED]: true })
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

  public setField(name: UnionString<keyof T>, data: Omit<FieldData, 'componentProps'>) {
    const current = this.getField(name)
    this.store.emit({ [name]: { ...current, ...data } }, true)

    if ('value' in data) {
      this.check(name).catch(() => { /* ignore */ })
    }
  }

  public setFieldComponentProps<P extends object = {}>(
    name: UnionString<keyof T>,
    data: FieldData<P>['componentProps'],
    replace?: boolean,
  ) {
    const current = this.getField(name)
    this.store.emit({
      [name]: {
        ...current,
        componentProps: replace ? data : { ...current.componentProps, ...data },
      },
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
    const needChecks: CheckField[] = []

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

      needChecks.push({ name: key, field: item })

      this.store.emit({ [key]: { ...item, validating: true } })
    }

    const checkResults = await Promise.all(needChecks.map(async (item) => {
      const { name, field } = item
      const next: FieldData = { ...field, validating: false }

      let error: FieldData['error']

      if (field.loading) {
        error = 'field loading'
        next.error = error
      } else {
        const validator = field.validator
          ? this.validators[field.validator]
          : () => field.value === undefined ? 'field required' : undefined

        error = await validator(field.value, field)

        if (error) {
          next.error = error
        }
      }

      this.store.emit({ [name]: next }, true)
      return { name, error, field }
    }))

    const errors = checkResults.filter((item) => item.error)

    if (errors.length) {
      throw errors
    }

    return result
  }
}
