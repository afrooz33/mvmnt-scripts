// ToDo: Create a logic so that unique ID can be recreated
//  One idea is to remove timestamp, but this might result in collission
//  Another idea is to take another input to append the hex or number
export function createUniqueId(uuid: string) {
  //  1. Clean the UUID string by removing dashes
  const cleanString = uuid.replace(/-/g, '').toLowerCase()
  const timestamp = new Date().getTime()

  //  2. Add timestamp for uniqueness
  return '0x' + cleanString + timestamp
}

export function uuidFromUniqueId(uniqueId: string) {
  //  1. Extract the part containing the UUID
  const uuidString = uniqueId.substring(2, 34)

  //  2. Separate the parts of the string
  const parts = []
  for (let i = 0; i < 5; i += 1) {
    const part = uuidString.substring(i * 4, i * 4 + 4)
    parts.push(part)
  }
  parts.push(uuidString.substring(20))

  //  3. Return the uuid
  return parts.join('-').replace('-', '')
}
