import React, { useMemo } from 'react'
import { INITIALIZED } from './connector'
import { Field, FieldProps, ObjectAny } from './type'

const debounce = <F extends (...args: Parameters<F>) => ReturnType<F>>(
  func: F,
  waitFor: number,
) => {
  let timeout: number

  const debounced = (...args: Parameters<F>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), waitFor)
  }

  return debounced
}

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
    const next = { ...item, value }

    delete next.error

    connector.state.emit({ [fid]: next }, true)
    onChange(value)
  }

  const onFieldValidate = async (value: Field['value']) => {
    const item = connector.state.getStore()[fid]
    const { validator: validatorName } = item

    if (validatorName) {
      const validator = connector.validators[validatorName]

      if (!validator) {
        return
      }

      connector.state.emit({ [fid]: {
        ...item,
        validating: true,
        error: undefined,
      }}, true)

      const error = await validator(value)
      const next = {
        ...connector.state.getStore()[fid],
        validating: false,
        error,
      }

      connector.state.emit({ [fid]: next }, true)
    }
  }

  if (field.hidden) {
    return null
  }

  const onValidate = useMemo(() => debounce(onFieldValidate, field.validateInterval || 300), [])

  return (
    <Render
      {...field}
      extraProps={extraProps as ObjectAny}
      onChange={onValueChange}
      onValidate={onValidate}
    />
  )
}

F.displayName = 'VARIOUS_FIELD'

export default F
