import React from 'react'
import { ErrorComponent, FieldComponent, LayoutComponent, TitleComponent } from './form'

export interface Placeholder { placeholder: string }
export interface Option { label: string, value: string }

export const Input: FieldComponent<Placeholder & { disabled: boolean }> = (props) => {
  return (
    <input
      aria-invalid={props.error ? true : undefined}
      disabled={props.componentProps?.disabled}
      readOnly={props.readOnly}
      placeholder={props.componentProps?.placeholder}
      value={props.value as string || ''}
      onInput={(e) => {
        props.onChange(e.currentTarget.value)
      }}
    />
  )
}

export const Radio: FieldComponent<{ options: Option[] }> = (props) => {
  return (
    <fieldset>
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
              disabled={props.readOnly}
            />
            {item.label}
          </label>
        ))
      }
    </fieldset>
  )
}

export const Select: FieldComponent<{ options: Option[] }> = (props) => {
  if (props.loading) {
    return (
      <span aria-busy="true">Please wait...</span>
    )
  }

  return (
    <select
      onChange={(e) => {
        props.onChange(e.target.value)
      }}
      aria-invalid={props.error ? true : undefined}
      disabled={props.readOnly}
    >
      <option hidden>Please select</option>
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
  )
}

export const Title: TitleComponent = (props) => {
  return (
    <label>
      {props.title}
      <span style={{ color: '#D93526' }}>{props.required ? '' : ' *'}</span>
    </label>
  )
}

export const Error: ErrorComponent = (props) => {
  return (
    <small style={{ color: '#ce7e7b' }}>{props.error}</small>
  )
}

export const Layout: LayoutComponent = (props) => {
  const titleNode = props.titleNode || (
    <label>
      {props.field.title}
      <span style={{ color: '#D93526' }}>{props.field.required ? ' *' : ''}</span>
    </label>
  )
  const errorNode = props.errorNode || (
    <small style={{ color: '#ce7e7b' }}>{props.field.error}</small>
  )

  return (
    <fieldset>
      {titleNode}
      {props.componentNode}
      {errorNode}
    </fieldset>
  )
}

export const FieldLayout: LayoutComponent = (props) => {
  const titleNode = (
    <label>
      {props.field.title}
      <span style={{ color: '#D93526' }}>{props.field.required ? '' : ' *'}</span>
    </label>
  )
  const errorNode = (
    <small style={{ color: '#ce7e7b' }}>{props.field.error}</small>
  )

  return (
    <fieldset>
      {titleNode}
      {props.componentNode}
      {errorNode}
    </fieldset>
  )
}
