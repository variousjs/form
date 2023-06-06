import React, {
  Children, cloneElement, isValidElement, ReactNode,
} from 'react'
import Layout from './layout'
import { FormProps } from './type'

export { default as Field } from './field'
export { default as Connector } from './connector'
export type {
  Fields, Validator, Renderer, Field as FieldType, LayoutProps,
} from './type'

const setProps = (props: FormProps): ReactNode => {
  return Children.map(props.children, (element) => {
    if (!isValidElement(element)) {
      return element
    }

    // @ts-ignore
    if (element?.type?.displayName === 'VARIOUS_FIELD') {
      const F = cloneElement(element, {
        ...element.props,
        connector: props.connector,
      })

      return (
        <Layout
          connector={props.connector}
          elementProps={{
            title: element.props.title,
            error: element.props.error,
            fid: element.props.fid,
          }}
          renderer={F}
          layout={props.layout}
        />
      )
    }

    if (element.props.children) {
      element = cloneElement(element, {
        // @ts-ignore
        children: setProps({
          ...element.props,
          connector: props.connector,
          layout: props.layout,
        }),
      })
    }

    return element
  })
}

export default (props: FormProps) => setProps(props) as JSX.Element
