import { Validator } from './form'

export const notEmpty: Validator = (v) => {
  if (v === undefined) {
    return 'error'
  }
}

export const notEmptyPromise: Validator = async (v) => {
  await new Promise((r) => setTimeout(r, 1000))
  if (v === undefined) {
    return 'error'
  }
}
