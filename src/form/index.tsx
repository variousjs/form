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
  TitleComponent,
  ErrorComponent,
  LayoutComponentProps,
  LayoutComponent,
  FieldProps,
  FormProps,
  FieldChageProperty,
  FieldChageCallback,
  ComponentPropsChageCallback,
  Validator,
  FieldData,
  ConnectorChange,
  FieldError,
} from './type'

const setProps = (props: FormProps): ReactNode => {
  return Children.map(props.children, (element) => {
    if (!isValidElement(element)) {
      return element
    }

    // @ts-ignore
    if (element?.type?.displayName === 'VARIOUS_FIELD') {
      const { layout, ...rest } = element.props as any

      const F = cloneElement(element, {
        connector: props.connector,
        readOnly: props.readOnly,
        ...rest,
      })

      return (
        <FieldWrapper
          connector={props.connector}
          fieldProps={element.props as any}
          componentNode={F}
          layoutNode={layout || props.fieldLayout}
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
          readOnly: props.readOnly,
          fieldLayout: props.fieldLayout,
        }),
      })
    }

    return element
  })
}

export default (props: FormProps) => setProps(props) as ReactElement
