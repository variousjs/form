import React, { useMemo } from 'react'
import { INITIALIZED } from './connector'
import { debounce } from './helper'
import { FieldData, FieldProps, ObjectAny } from './type'

function F<K extends Record<string, FieldData> = ObjectAny>(props: FieldProps<K>) {
  const {
    connector,
    name,
    disabled,
    readOnly,
  } = props

  if (!connector) {
    return null
  }

  const store = connector.store.useStore(name, INITIALIZED)
  const field: FieldData = store[name]

  if (!store[INITIALIZED] || !field || !field.component) {
    return null
  }

  const Render = connector.renderers[field.component]

  if (field.hidden || !Render) {
    return null
  }

  const onValidate = useMemo(() => debounce(
    connector.validateField.bind(connector),
    field.validateInterval || 0),
  [])

  const onValueChange = async (value: FieldData['value']) => {
    const item: FieldData = connector.store.getStore(name)
    const { error, ...rest } = item
    const next: FieldData = { ...rest, value, touched: true }

    if (!item.readOnly && !item.disabled) {
      connector.store.emit({ [name]: next }, true)
      connector.triggerSubscribers(
        name,
        ['value', error ? 'error' : '', rest.touched ? '' : 'touched'].filter(Boolean),
        next,
        item,
      )
      onValidate(name)
    }
  }

  return (
    <Render
      readOnly={readOnly}
      disabled={disabled}
      {...field}
      onChange={onValueChange}
    />
  )
}

F.displayName = 'VARIOUS_FIELD'

export default F
