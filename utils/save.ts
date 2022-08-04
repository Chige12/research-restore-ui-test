export const saveJsonFile = (obj: any, fileName: string) => {
  const json = JSON.stringify(obj, null, '  ')
  const blob = new Blob([json], {
    type: 'application/json',
  })
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = `${fileName}.json`
  link.click()
  link.remove()
}
