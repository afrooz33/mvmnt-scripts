import { registerDecorator, ValidationOptions } from 'class-validator'

export function IsFutureDate(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isFutureDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: Date) {
          value = new Date(value)

          const today = new Date()
          today.setHours(0, 0, 0, 0)

          return value > today
        },
        defaultMessage() {
          return 'Start date must be a future date'
        },
      },
    })
  }
}

export function IsBeforeEndDate(property: string, validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isBeforeEndDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: Date) {
          value = new Date(value)

          const endDate = object[property]

          if (!endDate) {
            return true
          }

          return value < endDate
        },
        defaultMessage() {
          return 'Start date must be before end date'
        },
      },
    })
  }
}
