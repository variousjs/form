export const not = (v?: string) => {
  if (!v || v === 'donot') {
    return 'donot'
  }
}

export const promiseCheck = async (v?: string) => {
  await new Promise((r) => setTimeout(r, 1000))
  if ((v?.length || 0) % 2 === 1) {
    return 'async error'
  }
}
