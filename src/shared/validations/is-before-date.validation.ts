import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator'

export function IsBeforeDate(compareToProperty: string, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isBeforeDate',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const compareToValue = (args.object as any)[compareToProperty]
          return value instanceof Date && compareToValue instanceof Date && value < compareToValue
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be before ${compareToProperty}`
        },
      },
    })
  }
}
