import { ReactNode, ComponentType, ReactElement } from 'react'
import { INITIALIZED } from './connector'
import type Connector from './connector'

type Primitive = boolean | number | string | undefined
type PlainObject = Record<string, Primitive | Primitive[]>

export interface Field<P extends object = {}> {
  /** field name */
  name: string,

  /** field rendering component */
  component?: string,

  /** rendering component props */
  componentProps?: P,

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

export interface RenderProps<P extends object = {}> extends Field<P> {
  onChange: (v: Field['value']) => void,
}

export type Renderer<P extends object = {}> = ComponentType<RenderProps<P>>

export type Validator = (
  value: Field['value'],
  field: Field,
) => Field['error'] | Promise<Field['error']>

export type TitleNode = (field: Field) => ReactNode
export type ErrorNode = (field: Field) => ReactNode

export interface FieldProps {
  title?: TitleNode
  error?: ErrorNode
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

export type LayoutNode = (props: LayoutProps) => ReactElement

export interface FormProps {
  readOnly?: boolean,
  connector: Connector,
  children: ReactNode,
  fieldLayout: (props: LayoutProps) => ReactElement,
}

// Internal

export type ObjectAny = Record<string, any>

export type Fields = Record<string, Field>

export type Renderers = Record<string, Renderer>

export interface State {
  [key: string]: Field,
  [INITIALIZED]: boolean,
}

export type Validators = Record<string, Validator>

export interface FieldValue {
  key: string,
  value: Field['value'],
}

interface FieldWraperProps {
  connector: Connector,
  fieldProps: Omit<FieldProps, 'connector'>,
  componentNode: ReactNode,
  layoutNode: LayoutNode,
}

export type FieldWrapper = (props: FieldWraperProps) => ReactElement
