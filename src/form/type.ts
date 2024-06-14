import { ReactNode, ComponentType } from 'react'
import { INITIALIZED } from './connector'
import type Connector from './connector'

type Primitive = boolean | number | string | undefined
type PlainObject = Record<string, Primitive | Primitive[]>

export interface Field {
  /** field name */
  name: string,

  /** field rendering component */
  component?: string,

  /** rendering component props */
  componentProps?: PlainObject,

  /** field loading status */
  loading?: boolean,

  /** field validating status */
  validating?: boolean,

  /** field hidden status, value enable */
  hidden?: boolean,

  /** field disabled status, value disabled */
  disabled?: boolean,

  /** field error message */
  error?: string | string[],

  /** field Value */
  value?: Primitive | Primitive[] | PlainObject,

  /** field required status */
  required?: boolean,

  /** field validator name */
  validator?: string,

  /** field title */
  title?: string | string[],

  /** field description */
  description?: string | string[],

  /** field readOnly status */
  readOnly?: boolean,

  /** field has been modified */
  modified?: boolean,
}

export interface RenderProps extends Field {
  onChange: (v: Field['value']) => void,
}

export type Renderer = ComponentType<RenderProps>

export type Validator = (
  value: Field['value'],
  field: Field,
) => Field['error'] | Promise<Field['error']>

export type TitleNode = (props: Field) => ReactNode
export type ErrorNode = (props: Field) => ReactNode

export interface FieldProps<P extends object = {}> {
  title?: TitleNode
  error?: ErrorNode
  componentProps?: P,
  name: string,
  connector?: Connector,
}

export type FieldNode = (props: FieldProps) => ReactNode

export interface LayoutProps {
  componentNode: ReactNode,
  field: Field,
  titleNode?: ReactNode,
  errorNode?: ReactNode,
}

export type LayoutNode = (props: LayoutProps) => ReactNode

export interface FormProps {
  readOnly?: boolean,
  connector: Connector,
  children: ReactNode,
  fieldLayout: (props: LayoutProps) => ReactNode,
}

type FieldChangeCallback = (field: Field) => void

export type FieldChange = (target: string, callback: FieldChangeCallback) => void

// Internal

export type ObjectAny = Record<string, any>

export type Fields = Record<string, Field>

export type Renderers = Record<string, Renderer>

export interface State {
  [key: string]: Field,
  [INITIALIZED]: boolean,
}

export type Validators = Record<string, Validator>
