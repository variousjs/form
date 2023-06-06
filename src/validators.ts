import { Validator } from './form'

export const notEmpty: Validator = (v) => {
  if (v === undefined) {
    return 'empty value'
  }
}

export const promiseCheck: Validator = async (v?: string) => {
  console.log('checking =>>>', v)
  await new Promise((r) => setTimeout(r, 3000))
  if ((v?.length || 0) % 2 === 1) {
    return 'async error'
  }
}
