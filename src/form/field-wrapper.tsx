import React from 'react'
import { FieldWrapper } from './type'

const Wrapper: FieldWrapper =  (props) => {
  const {
    fieldProps,
    connector,
    componentNode,
    layoutNode: L,
  } = props
  const { name } = fieldProps
  const store = connector.store.useStore(name)
  const field = store[name]

  if (!field) {
    return null
  }

  return (
    <L
      componentNode={componentNode}
      field={field}
      titleNode={fieldProps.title?.(field)}
      errorNode={fieldProps.error?.(field)}
    />
  )
}

export default Wrapper
