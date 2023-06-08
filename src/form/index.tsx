import React, {
  Children, cloneElement, isValidElement, ReactNode,
} from 'react'
import Layout from './layout'
import { FormProps } from './type'

export { default as Field } from './field'
export { default as Connector } from './connector'
export type {
  Validator, Renderer, Field as FieldProps, LayoutProps,
} from './type'

const setProps = (props: FormProps): ReactNode => {
  return Children.map(props.children, (element) => {
    if (!isValidElement(element)) {
      return element
    }

    // @ts-ignore
    if (element?.type?.displayName === 'VARIOUS_FIELD') {
      const F = cloneElement(element, {
        ...element.props as any,
        connector: props.connector,
      })

      return (
        <Layout
          connector={props.connector}
          elementProps={element.props as any}
          renderer={F}
          layout={props.layout}
        />
      )
    }

    // @ts-ignore
    if (element.props.children) {
      element = cloneElement(element, {
        // @ts-ignore
        children: setProps({
          ...element.props as any,
          connector: props.connector,
          layout: props.layout,
        }),
      })
    }

    return element
  })
}

export default (props: FormProps) => setProps(props) as JSX.Element
