import React from 'react'
import { INITIALIZED } from './connector'
import { FieldData, FieldProps } from './type'

function F(props: FieldProps) {
  const {
    connector,
    name,
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

  const onValueChange = async (value: FieldData['value']) => {
    const item: FieldData = connector.store.getStore(name)
    const { error, ...rest } = item
    const next = { ...rest, value }
    connector.store.emit({ [name]: next }, true)
  }

  return (
    <Render
      {...field}
      onChange={onValueChange}
    />
  )
}

F.displayName = 'VARIOUS_FIELD'

export default F
