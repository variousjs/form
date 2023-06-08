import { ReactNode, ComponentType, ReactElement } from 'react'
import { INITIALIZED } from './connector'
import type Connector from './connector'

export type ObjectAny = Record<string, any>

export interface Option {
  disabled?: boolean,
  label?: string | string[],
  value: any,
  children?: Option[],
  [key: string]: any,
}

export interface Field {
  /** Render Type */
  type?: string,

  /** Loading Status */
  loading?: boolean,

  /** Validating Status */
  validating?: boolean,

  /** Validate Interval */
  validateInterval?: number,

  /** Hidden Field */
  hidden?: boolean,

  /** Disabled Status */
  disabled?: boolean,

  /** Field Placeholder */
  placeholder?: string | string[],

  /** Error Message */
  error?: string | string[],

  /** Field Value */
  value?: any,

  /** Field Options */
  options?: Option[],

  /** Field Required */
  required?: boolean,

  /** Validator Name */
  validator?: string,

  /** Field Title */
  title?: string | string[],
}

export type Fields = Record<string, Field>

export interface State {
  [key: string]: Field,
  [INITIALIZED]: boolean,
}

export interface RenderProps<T = ObjectAny> extends Field {
  extraProps: T,
  onChange: (v: Field['value']) => void,
  onValidate: (v: Field['value']) => void,
}
export type Renderer = ComponentType<RenderProps>
export type Renderers = Record<string, Renderer>

export type Validator = (value: Field['value']) => Field['error'] | Promise<Field['error']>
export type Validators = Record<string, Validator>

export interface FieldChangeParams {
  key: string,
  value: Field['value']
}
export type FieldChange = (args: FieldChangeParams[]) => void

export type TitleNode = (props: Field) => JSX.Element
export type ErrorNode = (props: Field) => JSX.Element
export interface LayoutProps {
  renderer: ReactElement,
  config: Field,
  title?: ReactElement,
  error?: ReactElement,
}

export interface FieldProps<T = ObjectAny> {
  title?: TitleNode
  error?: ErrorNode
  onChange?: (value: Field['value']) => void,
  extraProps?: T,
  fid: string,
  connector?: Connector,
}

export interface FormProps {
  connector: Connector,
  children: ReactNode,
  layout: (props: LayoutProps) => JSX.Element,
}
