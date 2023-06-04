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
    <>
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
    </>
  )
}

export const Select: Renderer = (props) => {
  if (props.loading) {
    return (
      <div className="nes-badge">
        <span className="is-primary">Loading</span>
      </div>
    )
  }

  return (
    <div className="nes-select">
      <select defaultValue="">
        <option value="" disabled hidden>{props.placeholder}</option>
        {
          props.options?.map((item) => (
            <option
              key={item.value}
              value={item.value}
            >
              {item.label}
            </option>
          ))
        }
      </select>
    </div>
  )
}
