import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import Form, { Field, Fields, Connector } from './form'
import { Input, Radio, Select, TitleNode, LayoutNode } from './renderers'
import { notEmpty, promiseCheck, not } from './validators'

const fields: Fields = {
  nickname: {
    title: 'Nickname',
    type: 'input',
    placeholder: 'Input Name',
    required: true,
    validator: 'promiseCheck',
  },
  option: {
    title: 'Option',
    type: 'radio',
    options: [
      { label: 'YES', value: 'yes' },
      { label: 'NO', value: 'no' },
    ],
    validator: 'empty',
    required: true,
  },
  radio: {
    title: 'Option',
    type: 'radio',
    options: [
      { label: 'This', value: 'thus' },
      { label: 'Don\'t', value: 'donot' },
    ],
    validator: 'not',
  },
  select: {
    title: 'Select',
    type: 'select',
    loading: true,
    placeholder: 'select',
  },
}
const renderers = {
  input: Input,
  radio: Radio,
  select: Select,
}
const validators = {
  empty: notEmpty,
  promiseCheck,
  not,
}

const connector = new Connector(fields, { renderers, validators })

const Entry = () => {
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      connector.setField('select', {
        options: [
          { label: 'YES', value: 'yes' },
          { label: 'NO', value: 'no' },
        ],
        loading: false,
      })

      connector.addField('add', {
        type: 'input',
        placeholder: 'add',
        title: 'Add',
      })
    }, 3000)

    connector.onChange = (v) => {
      console.log(v)
    }
  }, [])

  return (
    <div style={{ padding: 50 }}>
      <Form
        connector={connector}
        layout={LayoutNode}
      >
        <div className="field">
          <Field
            title={TitleNode}
            fid="nickname"
          />
        </div>
        <div className="field">
          <Field
            fid="option"
            extraProps={{
              style: { background: '#212529', paddingTop: 10 },
            }}
          />
        </div>
        <div className="field">
          <Field
            fid="radio"
            extraProps={{
              style: { background: '#212529', paddingTop: 10 },
            }}
          />
        </div>
        <div className="field">
          <Field
            fid="select"
          />
        </div>
        <div className="field">
          <Field
            onChange={async (v) => {
              connector.setField('add', { title: v })
              try {
                const res = await connector.validateField('radio')
                console.log(res)
              } catch (e) {
                console.log(e)
              }
            }}
            fid="add"
          />
        </div>
      </Form>

      {
        loading ? (
          <div className="nes-badge">
            <span className="is-warning">Submiting</span>
          </div>
        ) : null
      }

      <button
        className="nes-btn is-primary"
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
