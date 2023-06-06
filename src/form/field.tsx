import React, { memo } from 'react'
import { INITIALIZED } from './connector'
import { Field, FieldProps, ObjectAny } from './type'

function F<T>(props: FieldProps<T>) {
  const {
    connector,
    fid,
    extraProps = {},
    onChange = () => null,
  } = props

  if (!connector) {
    return null
  }

  const store = connector.state.useStore(fid, INITIALIZED)
  const field: Field = store[fid]

  if (!store[INITIALIZED] || !field || !field.type) {
    return null
  }

  const Render = connector.renderers[field.type]

  if (!Render) {
    return null
  }

  const onValueChange = async (value: Field['value']) => {
    const item: Field = connector.state.getStore()[fid]
    if (item.loading || item.validating) {
      return
    }
    const next = { ...item, value }
    delete next.error
    connector.state.emit({ [fid]: next }, true)
    onChange(value)
  }

  const onFieldValidate = async (value: Field['value']) => {
    const item = connector.state.getStore()[fid]
    const { required, validator: validatorName } = item

    if (required && validatorName) {
      const validator = connector.validators[validatorName]

      if (!validator) {
        return
      }

      connector.state.emit({ [fid]: { ...item, loading: true } }, true)

      const error = await validator(value)
      const next = { ...connector.state.getStore()[fid], loading: false }

      if (error) {
        next.error = error
      }

      connector.state.emit({ [fid]: next }, true)
    }
  }

  if (field.disabled) {
    return null
  }

  return (
    <Render
      {...field}
      extraProps={extraProps as ObjectAny}
      onChange={onValueChange}
      onValidate={onFieldValidate}
    />
  )
}

F.displayName = 'VARIOUS_FIELD'

export default F
