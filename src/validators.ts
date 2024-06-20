export const notEmpty = (v?: string) => {
  if (v === undefined) {
    return 'empty value'
  }
}

export const not = (v?: string) => {
  if (!v || v === 'donot') {
    return 'donot'
  }
}

export const promiseCheck = async (v?: string) => {
  await new Promise((r) => setTimeout(r, 300))
  if ((v?.length || 0) % 2 === 1) {
    return 'async error'
  }
}
