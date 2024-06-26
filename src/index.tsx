import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import Form, { Field, Connector, FieldData, Validator, FieldComponent } from './form'
import { Input, Radio, Select, Title, Layout } from './renderers'
import { notEmpty, promiseCheck, not } from './validators'

const fields = {
  nickname: {
    title: 'Nickname',
    component: 'input',
    componentProps: {
      placeholder: 'Input Name',
    },
    required: true,
    validator: 'promiseCheck',
    validateInterval: 300,
  } as FieldData,
  option: {
    title: 'Option',
    component: 'select',
    componentProps: {
      options: [
        { label: 'YES', value: 'yes' },
        { label: 'NO', value: 'no' },
      ],
      extra: '!!!',
    },
    validator: 'empty',
    required: true,
  },
  radio: {
    title: 'Option',
    component: 'radio',
    componentProps: {
      options: [
        { label: 'This', value: 'thus' },
        { label: 'Don\'t', value: 'donot' },
      ],
    },
    validator: 'not',
  },
  select: {
    required: true,
    title: 'Select',
    component: 'select',
    loading: false,
    componentProps: {
    },
  },
}
const renderers = {
  input: Input,
  radio: Radio,
  select: Select,
} as Record<string, FieldComponent<any>>

const validators = {
  empty: notEmpty,
  promiseCheck,
  not,
} as Record<string, Validator>

const connector = new Connector(fields, { components: renderers, validators })

const Entry = () => {
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      connector.setFieldComponentProps('option', {
        options: [
          { label: 'YESS', value: 'yes' },
          { label: 'NON', value: 'no' },
        ],
        extra: <div>???</div>,
      })

      connector.addField('add', {
        component: 'input',
        componentProps: {
          placeholder: 'add',
        },
        title: 'Add',
      })

      setTimeout(() => {
        console.log(connector.getField('add'))
      })
    }, 3000)
  }, [])

  return (
    <div style={{ padding: 50 }}>
      <Form
        connector={connector}
        fieldLayout={Layout}
      >
        <div className="field">
          <Field
            title={Title}
            name="nickname"
          />
          <button onClick={() => console.log(connector.getField('nickname'))}>get</button>
        </div>
        <div className="field">
          <Field
            title={() => null}
            name="option"
          />
        </div>
        <div className="field">
          <Field
            name="radio"
          />
        </div>
        <div className="field">
          <Field
            name="select"
          />
        </div>
        <div className="field">
          <Field
            name="add"
          />
        </div>
      </Form>

      {
        loading ? (
          <span className="is-warning">Submiting</span>
        ) : null
      }

      <button
        style={{ marginTop: 20, display: loading ? 'none' : 'block' }}
        onClick={async () => {
          // connector.setField('option', { title: '___' })
          setLoading(true)
          try {
            const res = await connector.validateFields()
            console.log(res)
          } catch (e) {
            console.warn(e)
          } finally {
            setLoading(false)
          }
        }}
      >
        Submit
      </button>
    </div>
  )
}

const root =  ReactDOM.createRoot(document.getElementById('root') as HTMLElement)

root.render(<Entry />)
