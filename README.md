# Form

https://variousjs.github.io/form

## Install

```bash
$ npm i @variousjs/form
```

## Usage

### Field Renderer

```tsx
import { Renderer } from '@variousjs/form'

export const Input: Renderer = (props) => {
  return (
    <input
      placeholder={props.placeholder as string}
      className={`input ${props.error ? 'is-error' : ''}`}
      value={props.value || ''}
      onInput={(e) => {
        props.onChange(e.currentTarget.value)
        props.onValidate(e.currentTarget.value)
      }}
    />
  )
}
```

### Title Renderer

```tsx
import { FieldProps } from '@variousjs/form'

export const TitleNode = (props: FieldProps) => {
  return (
    <p className="title">
      {props.title}
      {props.validating ? ' ...' : ' *'}
    </p>
  )
}
```

### Error Renderer

```tsx
import { FieldProps } from '@variousjs/form'

export const ErrorNode = (props: FieldProps) => {
  return (
    <p className="error">
      {props.error}
    </p>
  )
}
```

### Layout Renderer

```tsx
import { LayoutProps } from '@variousjs/form'

export const LayoutNode = (props: LayoutProps) => {
  const titleNode = props.title || (<p className="title">{props.config.title}</p>)
  const errorNode = props.error || (<p className="error">{props.config.error}</p>)

  return (
    <div>
      {titleNode}
      {props.renderer}
      {errorNode}
    </div>
  )
}
```

### Validator

```ts
import { Validator } from '@variousjs/form'

export const notEmpty: Validator = (v) => {
  if (v === undefined) {
    return 'empty value'
  }
}

export const promiseCheck: Validator = async (v?: string) => {
  await new Promise((r) => setTimeout(r, 300))
  if ((v?.length || 0) % 2 === 1) {
    return 'async error'
  }
}
```

### Connector

```ts
import { Connector, FieldProps } from '@variousjs/form'
import Input from './input'
import promiseCheck from './promiseCheck'

const fields: Record<string, FieldProps> = {
  nickname: {
    title: 'Nickname',
    type: 'input',
    placeholder: 'Input Name',
    required: true,
    validator: 'promiseCheck',
  },
}

const renderers = {
  input: Input,
}

const validators = {
  promiseCheck,
}

export const connector = new Connector(fields, { renderers, validators })
```

### Form / Field

```tsx
import Form, { Field } from '@variousjs/form'
import connector from './connector'
import LayoutNode from './layout'
import TitleNode from './title'
import ErrorNode from './error'

export default () => {
  return (
    <Form
      connector={connector}
      layout={LayoutNode}
    >
      <div className="field">
        <Field
          onChange={(v) => console.log(v)}
          title={TitleNode}
          fid="nickname"
          error={ErrorNode}
        />
      </div>
      <button
        onClick={async () => {
          try {
            const res = await connector.submit()
            console.log(res)
          } catch (e) {
            console.error(e)
          }
        }}
      >
        Submit
      </button>
    </Form>
  )
}
```

## API

```ts
interface FieldChangeParams {
  key: string;
  value: Field['value'];
}
type FieldChange = (args: FieldChangeParams[]) => void;

class {
  getField(key: string): Field;

  set onChange(fn: FieldChange);

  setField(key: string, data: Partial<Field>): void;

  submit(): Promise<FieldChangeParams[]>;

  getFieldValue(key: string): any;

  getFieldsValue(): Record<string, any>;

  validateField(key: string): Promise<FieldChangeParams[]>;

  addField(key: string, data: Field): void;
}
```
