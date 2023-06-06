import React, { useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import Form, { Field, Fields, Connector } from './form'
import { Input, Radio, Select, TitleNode, LayoutNode } from './renderers'
import { notEmpty } from './validators'

const fields: Fields = {
  nickname: {
    title: 'Nickname',
    type: 'input',
    placeholder: 'Input Name',
    validator: 'empty',
  },
  option: {
    title: 'Option',
    type: 'radio',
    validator: 'empty',
    options: [
      { label: 'YES', value: 'yes' },
      { label: 'NO', value: 'no' },
    ],
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
}

const connector = new Connector(fields, { renderers, validators })

const Entry = () => {
  useEffect(() => {
    setTimeout(() => {
      connector.setField('select', {
        options: [
          { label: 'YES', value: 'yes' },
          { label: 'NO', value: 'no' },
        ],
        loading: false,
      })
    }, 3000)
  }, [])

  return (
    <div style={{ padding: 50 }}>
      <Form
        connector={connector}
        layout={LayoutNode}
      >
        <div className="field">
          <Field
            extraProps={{ style: { marginTop: 10 } }}
            fid="nickname"
          />
        </div>
        <div className="field">
          <Field
            title={TitleNode}
            fid="option"
          />
        </div>
        <div className="field">
          <Field
            fid="select"
          />
        </div>
      </Form>

      <button
        className="nes-btn is-primary"
        style={{ marginTop: 20 }}
        onClick={async () => {
          connector.setField('option', { title: '___' })
          const res = await connector.submit()
          console.log(res)
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
