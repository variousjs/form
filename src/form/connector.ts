import Nycticorax from 'nycticorax'
import type N from 'nycticorax'
import {
  Field, Fields, State, Renderers, Validators, FieldChange, FieldChangeParams
} from './type'

export const INITIALIZED = Symbol('INITIALIZED')

export default class {
  private store: N<State>
  public renderers: Renderers
  public validators: Validators
  private fieldChange: FieldChange

  constructor(
    fields: Fields,
    config: { renderers: Renderers, validators: Validators },
  ) {
    this.store = new Nycticorax<State>()
    this.renderers = config.renderers || {}
    this.validators = config.validators || {}
    this.fieldChange = () => null
    this.init(fields)
  }

  public get state() {
    return this.store
  }

  public getField(key: string) {
    return this.store.getStore()[key]
  }

  public set onChange(fn: FieldChange) {
    this.fieldChange = fn
  }

  public setField(key: string, data: Partial<Field>) {
    const current = this.store.getStore()[key]
    this.store.emit({ [key]: { ...current, ...data } }, true)

    if ('value' in data) {
      this.check(key).catch(() => { /* ignore */ })
    }
  }

  public submit() {
    return this.check()
  }

  private async check(key?: string) {
    const state = this.store.getStore()
    const result: FieldChangeParams[] = []
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

      this.store.emit({ [key]: { ...item, validating: true } }, true)
    }

    const checkResults = await Promise.all(needChecks.map(async (item) => {
      const { key, field } = item
      const error = await this.validators[field.validator!](field.value)

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

  public getFieldValue(key: string) {
    const store = this.store.getStore()
    return store[key].value
  }

  public getFieldsValue() {
    const store = this.store.getStore()
    const res = {} as Record<string, any>
    Object.keys(store).forEach((key) => {
      res[key] = store[key].value
    })
    return res
  }

  public validateField(key: string) {
    return this.check(key)
  }

  public addField(key: string, data: Field) {
    const store = this.store.getStore()
    if (store[key]) {
      window.console.error('Duplicate field key')
      return
    }
    this.store.emit({ [key]: data })
  }

  private init(fields: Fields) {
    this.store.createStore({ ...fields, [INITIALIZED]: true })

    this.store.onChange = (changes) => {
      const next = [] as FieldChangeParams[]

      Object.keys(changes).forEach((key) => {
        const [n, o] = changes[key] as [Field, Field]
        if (n.value !== o?.value) {
          next.push({ key, value: n.value })
        }
      })

      if (next.length) {
        this.fieldChange(next)
      }
    }
  }
}
