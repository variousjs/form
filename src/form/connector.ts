import Nycticorax from 'nycticorax'
import type N from 'nycticorax'
import {
  Field, Fields, State, Renders, Validators, FieldChange, FieldChangeFn
} from './type'

export const INITIALIZED = Symbol('INITIALIZED')

export default class {
  private store: N<State>
  private initialized: boolean
  private initialFields: Fields
  private renderComponents: Renders
  private validatorFns: Validators
  private fieldChange: FieldChangeFn

  constructor() {
    this.initialized = false
    this.initialFields = {}
    this.renderComponents = {}
    this.validatorFns = {}
    this.fieldChange = () => null
    this.store = new Nycticorax<State>()
  }

  public get state() {
    return this.store
  }

  public set renders(renders: Renders) {
    if (!this.initialized) {
      this.renderComponents = renders
    }
  }

  public get renders() {
    return this.renderComponents
  }

  public set validators(validators: Validators) {
    if (!this.initialized) {
      this.validatorFns = validators
    }
  }

  public get validators() {
    return this.validatorFns
  }

  public getField(key: string) {
    return this.store.getStore()[key]
  }

  public resetField() {
    this.store.emit({ ...this.initialFields }, true)
  }

  public set onChange(fn: FieldChangeFn) {
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
    const result: FieldChange[] = []
    const keys = key ? [key] : Object.keys(state)
    const needChecks: { field: Field, key: string }[] = []

    for (let i = 0; i < keys.length; i += 1) {
      const key = keys[i]
      const item: Field = state[key]
      if (item.disabled) {
        continue
      }

      result.push({ key, value: item.value })

      if (!item.required || !item.validator || !this.validators[item.validator]) {
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
    return store[key]
  }

  public getFieldValues() {
    const store = this.store.getStore()
    const res = {} as Record<string, any>
    Object.keys(store).forEach((key) => {
      if (store[key].value !== undefined) {
        res[key] = store[key].value
      }
    })
    return res
  }

  public init(fields: Fields) {
    if (this.initialized) {
      window.console.warn('Form can not be reinitialized.')
      return
    }

    this.initialized = true
    this.initialFields = fields
    this.store.createStore({ ...fields, [INITIALIZED]: true })

    this.store.onChange = (changes) => {
      const next = [] as FieldChange[]

      Object.keys(changes).forEach((key) => {
        const [n, o] = changes[key] as [Field, Field]
        if (n.value !== o.value) {
          next.push({ key, value: n.value })
        }
      })

      if (next.length) {
        this.fieldChange(next)
      }
    }
  }
}
