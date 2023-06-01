import React from 'react'
import { Renderer } from './form'

export const Input: Renderer = (props) => {
  return (
    <input
      {...props.extraProps}
      placeholder={props.placeholder as string}
      className="nes-input"
      value={props.value || ''}
      onInput={(e) => props.onChange(e.currentTarget.value)}
    />
  )
}

export const Radio: Renderer = (props) => {
  return (
    <div className="nes-container with-title">
      <h3 className="title">{props.title}</h3>
      {
        props.options?.map((item) => (
          <label key={item.value}>
            <input
              onChange={(e) => props.onChange(e.target.value)}
              type="radio"
              className="nes-radio"
              value={item.value}
              checked={props.value === item.value}
            />
            <span>{item.label}</span>
          </label>
        ))
      }
    </div>
  )
}
