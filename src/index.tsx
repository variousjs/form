import React from 'react'
import ReactDOM from 'react-dom/client'
import Form, { Field, Fields, Connector } from './form'
import { Input } from './renderers'
import { notEmpty } from './validators'

const fields: Fields = {
  nickname: {
    title: '昵称',
    type: 'input',
    placeholder: '输入昵称',
    validator: 'empty',
  },
}
const renderers = {
  input: Input,
}
const validators = {
  empty: notEmpty,
}


const connector = new Connector(fields, { renderers, validators })

const Entry = () => {
  return (
    <div style={{ padding: 50 }}>
      <Form connector={connector}>
        <div className="aaa">
          <Field extraProps={{ bb: 1 }} fid="nickname" />
        </div>
      </Form>
    </div>
  )
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <Entry />,
)
