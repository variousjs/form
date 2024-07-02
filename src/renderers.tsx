import React, { ReactNode } from 'react'
import { FieldComponent, LayoutComponent, TitleComponent } from './form'

export const Input: FieldComponent<{ placeholder: string }> = (props) => {
  return (
    <input
      placeholder={props.componentProps?.placeholder}
      className={props.error ? 'is-error' : ''}
      value={props.value as string || ''}
      onInput={(e) => {
        props.onChange(e.currentTarget.value)
      }}
    />
  )
}

export const Radio: FieldComponent<{ options: { label: string, value: string }[] }> = (props) => {
  return (
    <div>
      {
        props.componentProps?.options?.map((item) => (
          <label key={item.value}>
            <input
              onChange={(e) => {
                props.onChange(e.target.value)
              }}
              type="radio"
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

export const Select: FieldComponent<{
  options: { label: string, value: string }[],
  extra?: ReactNode,
}> = (props) => {
  if (props.loading) {
    return (
      <div className="nes-badge">
        <span className="is-primary">Loading</span>
      </div>
    )
  }

  return (
    <div>
      <div>{props.componentProps?.extra}</div>
      <select
        onChange={(e) => {
          props.onChange(e.target.value)
        }}
        defaultValue=""
      >
        <option value="" disabled hidden>请选择</option>
        {
          props.componentProps?.options?.map((item) => (
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

export const Title: TitleComponent = (props) => {
  return (
    <p className="title">
      {props.title}
      {props.validating ? ' ...' : ' *'}
    </p>
  )
}

export const Layout: LayoutComponent = (props) => {
  const titleNode = props.titleNode || (<p className="title">{props.field.title}</p>)
  const errorNode = props.errorNode || (<p className="is-error">{props.field.error}</p>)

  return (
    <div
      style={{ marginBottom: 10 }}
    >
      {titleNode}
      {props.componentNode}
      {errorNode}
    </div>
  )
}

export const FieldLayout: LayoutComponent = (props) => {
  const titleNode = <p className="title">{props.field.title}</p>
  const errorNode = <p className="is-error">{props.field.error}</p>

  return (
    <div
      style={{ margin: '100px 0' }}
    >
      {titleNode}
      {props.componentNode}
      {errorNode}
    </div>
  )
}
