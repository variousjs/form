import React from 'react'
import ReactDOM from 'react-dom/client'
import Form, { Field, Fields, Connector } from './form'
import { Input, Radio } from './renderers'
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
}
const renderers = {
  input: Input,
  radio: Radio,
}
const validators = {
  empty: notEmpty,
}

const connector = new Connector(fields, { renderers, validators })

const Entry = () => {
  return (
    <div style={{ padding: 50 }}>
      <Form connector={connector}>
        <div className="field">
          <Field
            extraProps={{ style: { marginTop: 10 } }}
            fid="nickname"
          />
        </div>
        <div className="field">
          <Field
            title={() => (<div style={{ height: 20 }} />)}
            fid="option"
          />
        </div>
      </Form>

      <button
        className="nes-btn is-primary"
        style={{ marginTop: 20 }}
        onClick={async () => {
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
