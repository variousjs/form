import Nycticorax from 'nycticorax'
import type N from 'nycticorax'
import {
  Field, Fields, Renders, Validators, FieldChange, FieldChangeFn
} from './type'

export default class {
  private store: N<Fields>
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
    this.store = new Nycticorax<Fields>()
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

  public init(fields: Fields) {
    if (this.initialized) {
      window.console.warn('Form can not be reinitialized.')
      return
    }

    this.initialized = true
    this.initialFields = fields
    this.store.createStore({ ...fields, __INITIALIZED: {} })

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
