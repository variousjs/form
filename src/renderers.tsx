import React from 'react'
import { Renderer, FieldProps, LayoutProps } from './form'

export const Input: Renderer = (props) => {
  return (
    <input
      placeholder={props.placeholder as string}
      className={`nes-input ${props.error ? 'is-error' : ''}`}
      value={props.value || ''}
      onInput={(e) => {
        props.onChange(e.currentTarget.value)
        props.onValidate(e.currentTarget.value)
      }}
    />
  )
}

export const Radio: Renderer = (props) => {
  return (
    <div {...props.extraProps}>
      {
        props.options?.map((item) => (
          <label key={item.value}>
            <input
              onChange={(e) => {
                props.onChange(e.target.value)
                props.onValidate(e.target.value)
              }}
              type="radio"
              className="nes-radio is-dark"
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
      <select
        onChange={(e) => {
          props.onChange(e.target.value)
          props.onValidate(e.target.value)
        }}
        defaultValue=""
      >
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

export const TitleNode = (props: FieldProps) => {
  return (
    <p className="title">
      {props.title}
      {props.validating ? ' ...' : ' *'}
    </p>
  )
}

export const LayoutNode = (props: LayoutProps) => {
  const titleNode = props.title || (<p className="title">{props.config.title}</p>)
  const errorNode = props.error || (<p className="note nes-text is-error">{props.config.error}</p>)

  return (
    <div
      style={{ marginBottom: 10 }}
      className="nes-container with-title"
    >
      {titleNode}
      {props.renderer}
      {errorNode}
    </div>
  )
}
