import React, {
  Children,
  cloneElement,
  isValidElement,
  ReactNode,
  ReactElement,
} from 'react'
import FieldWrapper from './field-wrapper'
import { FormProps } from './type'

export { default as Field } from './field'
export { default as Connector } from './connector'
export type {
  FieldComponentProps,
  FieldComponent,
  TitleNode,
  ErrorNode,
  FieldProps,
  Validator,
  FieldData,
  LayoutProps,
  LayoutNode,
  FormProps,
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
        <FieldWrapper
          connector={props.connector}
          fieldProps={element.props as any}
          componentNode={F}
          layoutNode={props.fieldLayout}
        />
      )
    }

    if (element.props.children) {
      element = cloneElement(element, {
        // @ts-ignore
        children: setProps({
          ...element.props as any,
          connector: props.connector,
          fielayout: props.fieldLayout,
        }),
      })
    }

    return element
  })
}

export default (props: FormProps) => setProps(props) as ReactElement
