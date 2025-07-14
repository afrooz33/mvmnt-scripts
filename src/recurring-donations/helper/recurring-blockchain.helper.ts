import { v4 as uuidv4 } from 'uuid'

// ToDo: Uncomment after testing
// const generatePaymentIds = (dateInput: number, totalMonths: number = 12) => {
//   const paymentIds: string[] = []
//   const executionTime: number[] = []
//
//   for (let i = 0; i < totalMonths; i += 1) {
//     const date = new Date()
//     date.setMonth(date.getMonth() + i)
//     date.setDate(dateInput)
//
//     paymentIds.push(uuidv4())
//     executionTime.push(Math.floor(date.getTime() / 1000))
//   }
//
//   return {
//     paymentIds,
//     executionTime,
//   }
// }

const generatePaymentIds = (dateInput: number) => {
  const paymentIds: string[] = []
  const executionTime: number[] = []
  const currentTime = new Date().getTime()

  for (let i = 0; i < 12; i += 1) {
    const twoMin = 1000 * 60 * 2
    const threeMinOffset = 1000 * 60 * 3
    const date = new Date(currentTime + twoMin * (i + 1) + threeMinOffset)

    paymentIds.push(uuidv4())
    executionTime.push(Math.floor(date.getTime() / 1000))
  }
  return {
    paymentIds,
    executionTime,
    dateInput,
  }
}

export { generatePaymentIds }
