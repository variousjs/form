import { ReactNode, ComponentType } from 'react'
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
  /** 渲染类型 */
  type?: string,

  /** 加载中 */
  loading?: boolean,

  /** 验证中 */
  validating?: boolean,

  /** 只读 */
  readonly?: boolean,

  /** 禁用 */
  disabled?: boolean,

  /** 占位符 */
  placeholder?: string | string[],

  /** 错误 */
  error?: string | string[],

  /** 值 */
  value?: any,

  /** 选项 */
  options?: Option[],

  /** 必须 */
  required?: boolean,

  /** 验证器名字 */
  validator?: string,

  /** 标题 */
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

export interface FieldProps<T = ObjectAny> {
  title?: (props: Field) => ReactNode
  error?: (props: Field) => ReactNode
  onChange?: (value: Field['value']) => void,
  extraProps: T,
  fid: string,
  connector?: Connector,
}

export interface FormProps {
  connector: Connector,
  children: ReactNode,
  layout?: () => ReactNode
}
