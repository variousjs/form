import { ReactNode, ComponentType, ReactElement } from 'react'
import { INITIALIZED } from './connector'
import type Connector from './connector'

type Primitive = boolean | number | string
type PlainObject = Record<string, Primitive | Primitive[]>
export type ObjectAny = Record<string, any>
export type UnionString<T extends string | number | symbol> = (T & string) | (string & {})

export interface FieldData<P extends object = ObjectAny> {
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

  /** field disabled status, value disabled, not component disabled */
  disabled?: boolean,

  /** field error message */
  error?: string | string[],

  /** field Value */
  value?: Primitive | Primitive[] | PlainObject,

  /** field required status */
  required?: boolean,

  /** field validator name */
  validator?: string,

  /** field validate interval, default 0(ms) */
  validateInterval?: number,

  /** field title */
  title?: string | string[],

  /** field description */
  description?: string | string[],

  /** field readOnly status */
  readOnly?: boolean,

  /** field has been modified by user */
  touched?: boolean,

  /** field position sequence, for useFields */
  sequence?: number,
}

export type ConnectorChange<K extends Record<string, FieldData> = ObjectAny> = (
  e: Record<UnionString<keyof K>, [FieldData, FieldData]>
) => void

export interface FieldComponentProps<P extends object = ObjectAny> extends FieldData<P> {
  onChange: (v: FieldData['value']) => void,
}

export type FieldComponent<P extends object = any> = ComponentType<FieldComponentProps<P>>

export type Validator = (
  value: FieldData['value'],
  field: FieldData,
) => FieldData['error'] | Promise<FieldData['error']>

export type TitleComponent = (field: FieldData) => ReactNode
export type ErrorComponent = (field: FieldData) => ReactNode

export interface LayoutComponentProps {
  componentNode: ReactNode,
  field: FieldData,
  titleNode?: ReactNode,
  errorNode?: ReactNode,
}

export type LayoutComponent = (props: LayoutComponentProps) => ReactElement

export interface FieldProps<K extends Record<string, FieldData> = ObjectAny> {
  title?: TitleComponent
  error?: ErrorComponent
  name: UnionString<keyof K>,
  connector?: Connector,
  readOnly?: boolean,
  layout?: LayoutComponent,
}

export interface FormProps {
  readOnly?: boolean,
  disabled?: boolean,
  connector: Connector,
  children: ReactNode,
  fieldLayout: LayoutComponent,
}

export type FieldChageProperty = keyof Omit<FieldData, 'componentProps'> | '*'

export interface FieldChageCallback {
  (newField: FieldData, oldField: FieldData, changeKeys: (keyof Omit<FieldData, 'componentProps'>)[]): void,
  __once?: boolean,
  __triggered?: boolean,
  __properties?: FieldChageProperty[],
}

export interface ComponentPropsChageCallback<P extends object = ObjectAny> {
  (newProps: P | undefined, oldProps: P | undefined, changeKeys: string[]): void,
  __once?: boolean,
  __triggered?: boolean,
  __properties?: string[],
}

export interface FieldError<K extends Record<string, FieldData> = ObjectAny> {
  name: UnionString<keyof K>,
  error: FieldData['error'],
  field: FieldData,
}

// Internal

export type FieldDatas<K extends string = string> = Record<K, FieldData>

export type FieldComponents = Record<string, FieldComponent>

export interface State {
  [key: string]: FieldData,
  [INITIALIZED]: boolean,
}

export type Validators = Record<string, Validator>

export interface FieldValue<T extends string> {
  name: T,
  value: FieldData['value'],
  field: FieldData,
}

interface FieldWraperProps {
  connector: Connector,
  fieldProps: Omit<FieldProps, 'connector'>,
  componentNode: ReactNode,
  layoutNode: LayoutComponent,
}

export type FieldWrapper = (props: FieldWraperProps) => ReactElement | null

export type FieldDataWithName = { name: string } & FieldData
