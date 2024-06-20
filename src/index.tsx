import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import Form, { Field, Connector, FieldData, Validator, FieldComponent } from './form'
import { Input, Radio, Select, Title, Layout } from './renderers'
import { notEmpty, promiseCheck, not } from './validators'

const fields: Record<string, FieldData> = {
  nickname: {
    title: 'Nickname',
    component: 'input',
    componentProps: {
      placeholder: 'Input Name',
    },
    name: 'nickname',
    required: true,
    validator: 'promiseCheck',
  },
  option: {
    title: 'Option',
    component: 'radio',
    componentProps: {
      options: [
        { label: 'YES', value: 'yes' },
        { label: 'NO', value: 'no' },
      ],
    },
    name: 'option',
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
    name: 'radio',
    validator: 'not',
  },
  select: {
    title: 'Select',
    component: 'select',
    loading: true,
    componentProps: {
      placeholder: 'select',
    },
    name: 'select',
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
      connector.setField('select', {
        componentProps: {
          options: [
            { label: 'YES', value: 'yes' },
            { label: 'NO', value: 'no' },
          ],
        },
        loading: false,
      })

      connector.addField('add', {
        name: 'add',
        component: 'input',
        componentProps: {
          placeholder: 'add',
        },
        title: 'Add',
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
        </div>
        <div className="field">
          <Field
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
            const res = await connector.submit()
            console.log(res)
          } catch (e) {
            console.error(e)
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

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Entry />,
)
