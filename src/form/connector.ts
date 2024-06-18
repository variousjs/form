import Nycticorax from 'nycticorax'
import type N from 'nycticorax'
import {
  Field,
  Fields,
  State,
  Renderers,
  Validators,
  FieldValue,
} from './type'

export const INITIALIZED = Symbol('INITIALIZED')

export default class {
  public store: N<State>
  public renderers: Renderers
  public validators: Validators

  constructor(
    fields: Fields,
    config: { components: Renderers, validators: Validators },
  ) {
    this.store = new Nycticorax<State>()
    this.renderers = config.components || {}
    this.validators = config.validators || {}
    this.init(fields)
  }

  private init(fields: Fields) {
    this.store.createStore({ ...fields, [INITIALIZED]: true })
  }

  public getField(name: string) {
    const field = this.store.getStore(name)
    if (!field) {
      throw new Error('field not exist')
    }
    return field
  }

  public getFields() {
    return this.store.getStore()
  }

  public setField(name: string, data: Omit<Field, 'name'>) {
    const current = this.getField(name)
    this.store.emit({ [name]: { ...current, ...data } }, true)

    if ('value' in data) {
      this.check(name).catch(() => { /* ignore */ })
    }
  }

  public addField(name: string, data: Field) {
    if (this.store.getStore(name)) {
      throw new Error('duplicate field')
    }
    this.store.emit({ [name]: data })
  }

  public validateField(name: string) {
    return this.check(name)
  }

  public submit() {
    return this.check()
  }

  private async check(key?: string) {
    const state = this.store.getStore()
    const result: FieldValue[] = []
    const keys = key ? [key] : Object.keys(state)
    const needChecks: { field: Field, key: string }[] = []

    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i]
      const item: Field = state[key]
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

      const next: Field = { ...field, validating: false }
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
