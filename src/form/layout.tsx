import React, { ReactElement, ReactNode } from 'react'
import type Connector from './connector'
import { TitleNode, ErrorNode, LayoutProps } from './type'

interface Props {
  connector: Connector
  elementProps: {
    title?: TitleNode,
    error?: ErrorNode,
    fid: string,
  },
  renderer: ReactElement,
  layout: (props: LayoutProps) => JSX.Element,
}

export default (props: Props) => {
  const { elementProps, connector, renderer } = props
  const store = connector.state.useStore(elementProps.fid)
  const field = store[elementProps.fid]
  const T = elementProps.title
  const E = elementProps.error
  const L = props.layout || (() => <>You should define form `layout` props</>)

  if (!field) {
    return null
  }

  return (
    <L
      renderer={renderer}
      title={T ? <T {...field} /> : undefined}
      error={E ? <E {...field} /> : undefined}
      config={field}
    />
  )
}
