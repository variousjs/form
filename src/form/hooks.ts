import { useEffect, useState } from 'react'
import type Nycticorax from 'nycticorax'
import type Connector from './connector'
import {
  FieldData,
  State,
  FieldDatas,
  ObjectAny,
  UnionString,
  FieldDataWithName,
} from './type'

export function getFieldsStore(getStore: Nycticorax<State>['getStore']) {
  const globalStore = getStore()
  const keys = Object.keys(globalStore)

  return keys
    .reduce((prev, cur) => prev.concat({
      name: cur,
      ...getStore(cur),
    }), [] as FieldDataWithName[])
    .sort((a, b) => (b.sequence ?? 0) - (a.sequence ?? 0))
}

function hooks<T extends FieldDatas = ObjectAny>(connector: Connector) {
  const { getStore, useStore } = connector.store

  return {
    useFields: () => {
      const [fields, setFields] = useState(getFieldsStore(getStore))

      useEffect(() => {
        connector.store.onChange = () => {
          setFields(getFieldsStore(getStore))
        }
      }, [])

      return fields
    },

    useField: (name: UnionString<keyof T>) => {
      const field = useStore(name)
      return field[name] as FieldData
    }
  }
}

export default hooks
