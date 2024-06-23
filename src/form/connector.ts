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
    const result: FieldValue[] = []
    const keys = (name ? [name] : Object.keys(state))
    const needChecks: { field: FieldData, key: string }[] = []

    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i]
      const item: FieldData = state[key]
      if (item.disabled) {
        continue
      }

      result.push({ key, value: item.value })

      if (!item.validator || !this.validators[item.validator]) {
        continue
      }

      needChecks.push({ key, field: item })

      this.store.emit({ [key]: { ...item, validating: true } })
    }

    const checkResults = await Promise.all(needChecks.map(async (item) => {
      const { key, field } = item
      const error = await this.validators[field.validator!](field.value, field)

      const next: FieldData = { ...field, validating: false }
      if (error) {
        next.error = error
      }

      this.store.emit({ [key]: next }, true)
      return { key, error }
    }))

    const errors = checkResults.filter((item) => item.error)

    if (errors.length) {
      throw errors
    }

    return result
  }
}
