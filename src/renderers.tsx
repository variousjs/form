import React from 'react'
import { Renderer } from './form'

export const Input: Renderer = (props) => {
  return (
    <input
      value={props.value || ''}
      onInput={(e) => props.onChange(e.currentTarget.value)}
    />
  )
}
