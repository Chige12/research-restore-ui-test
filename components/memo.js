const obj = {
  lastname: ['Doe', { firstname: ['John'] }],
}

const chainedKeyText = 'lastname.1.firstname.0'
const chainedKey = chainedKeyText.split('.')

let value = { ...obj }
for (const key of chainedKey) {
  value = value[key]
}

console.log(chainedKeyText, value) // > "lastname.1.firstname.0" "John"

let diffObj = value
for (const key of chainedKey.reverse()) {
  const newObj = {}
  newObj[key] = diffObj
  diffObj = { ...newObj }
}

console.log(diffObj) // > { lastname: { 1: { firstname: { 0: "John" } } } }
