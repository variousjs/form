import { Children, cloneElement, isValidElement, ReactNode, ReactElement } from 'react'
import { FormProps } from './type'

export { default as Field } from './field'
export { default as Connector } from './connector'
export type { Fields } from './type'

const setProps = (props: FormProps): ReactNode => {
  return Children.map(props.children, (element) => {
    if (!isValidElement(element)) {
      return element
    }

    // @ts-ignore
    if (element?.type?.displayName === 'VARIOUS_FIELD') {
      return cloneElement(element as ReactElement, { ...(element.props || {}), connector: props.connector })
    }

    const { children } = (element as ReactElement).props
    if (children) {
      (element as ReactElement).props.children = setProps({ ...props, children })
    }

    return element
  })
}

export default (props: FormProps) => setProps(props) as JSX.Element
