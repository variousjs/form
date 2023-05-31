import { Children, cloneElement, isValidElement, ReactNode, ReactElement } from 'react'
import { FormProps } from './type'

export { default as Field } from './field'
export { default as Connector } from './connector'
export type { Fields, Validator, Renderer } from './type'

const setProps = (props: FormProps): ReactNode => {
  return Children.map(props.children, (element) => {
    if (!isValidElement(element)) {
      return element
    }

    // @ts-ignore
    if (element?.type?.displayName === 'VARIOUS_FIELD') {
      return cloneElement(element, { ...(element.props || {}), connector: props.connector })
    }

    if (element.props.children) {
      element = cloneElement(element, {
        // @ts-ignore
        children: setProps({
          ...element.props,
          connector: props.connector,
        }),
      })
    }

    return element
  })
}

export default (props: FormProps) => setProps(props) as JSX.Element
