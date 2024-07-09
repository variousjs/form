import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import Form, { Field, Connector, FieldData, Validator, FieldComponent, FieldError } from './form'
import { Input, Radio, Select, Title, Layout, FieldLayout, Placeholder, Option } from './renderers'
import { promiseCheck, not } from './validators'

const fieldsData = {
  input: {
    title: 'Input',
    component: 'input',
    componentProps: {
      placeholder: 'please input',
    },
    required: true,
    validator: 'promiseCheck',
    validateInterval: 300,
    sequence: 100,
  } as FieldData<Placeholder>,
  'input-readonly': {
    title: 'ReadOnly',
    component: 'input',
    componentProps: {
      placeholder: 'input readonly',
    },
    readOnly: true,
    sequence: 1,
  } as FieldData<Placeholder>,
  select: {
    title: 'Select',
    component: 'select',
    componentProps: {
      options: [
        { label: 'YES', value: 'yes' },
        { label: 'NO', value: 'no' },
      ],
    },
    required: true,
    sequence: 2,
  } as FieldData<{ options: Option[] }>,
  radio: {
    title: 'Radio',
    component: 'radio',
    componentProps: {
      options: [
        { label: 'This', value: 'thus' },
        { label: 'Don\'t', value: 'donot' },
      ],
    },
    validator: 'not',
  } as FieldData<{ options: Option[] }>,
  'radio-disabled': {
    title: 'Radio Disabled',
    component: 'radio',
    componentProps: {
      options: [
        { label: 'disabled', value: 'disabled' },
      ],
      disabled: true,
    },
  } as FieldData<{ options: Option[], disabled: boolean }>,
  'select-loading': {
    required: true,
    title: 'Select Loading',
    component: 'select',
    loading: true,
  } as FieldData<{ options: Option[] }>,
  hidden: {} as FieldData,
}

const renderers = {
  input: Input,
  radio: Radio,
  select: Select,
}

const validators = {
  promiseCheck,
  not,
} as Record<string, Validator>

const connector = new Connector(fieldsData, { components: renderers, validators })

const Entry = () => {
  const [loading, setLoading] = useState(false)
  const [readOnly, setReadOnly] = useState(false)
  const [info, setInfo] = useState('')

  const fields = connector.useFields()

  useEffect(() => {
    setTimeout(() => {
      connector.setFieldComponentProps<{ options: Option[] }>('select-loading', {
        options: [
          { label: 'Loading-YESS', value: 'yes' },
          { label: 'loading-NON', value: 'no' },
        ],
      })

      connector.setField('select-loading', { loading: false })
    }, 3000)
  }, [])

  return (
    <div style={{ padding: 50, display: 'flex' }}>
      <div style={{ width: 600, marginRight: 50 }}>
      <Form
        connector={connector}
        fieldLayout={Layout}
        readOnly={readOnly}
      >
        {
          fields.map((field) => (
            <div key={field.name} className="field">
              <Field
                name={field.name}
              />
            </div>
          ))
        }

        <div role="group">
          <button
            onClick={() => {
              connector.addField<Placeholder>('add', {
                component: 'input',
                componentProps: {
                  placeholder: 'please input',
                },
                required: true,
                title: 'Add',
              })
            }}
          >
            Add Field
          </button>
          <button
            aria-busy={loading}
            onClick={async () => {
              setLoading(true)
              try {
                const res = await connector.validateFields()
                setInfo(`Form values: \n${JSON.stringify(res, null, 4)}`)
              } catch (e) {
                const next = (e as FieldError[]).map((s) => ({
                  name: s.name,
                  error: s.error,
                }))
                setInfo(`Validate error: \n${JSON.stringify(next, null, 4)}`)
              } finally {
                setLoading(false)
              }
            }}
          >
            Submit
          </button>
          <button
            onClick={() => setReadOnly(!readOnly)}
          >
            Toggle ReadOnly
          </button>
        </div>
      </Form>
      </div>

      <article style={{ flex: 1, whiteSpace: 'pre-wrap' }}>{info}</article>
    </div>
  )
}

const root =  ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(<Entry />)
