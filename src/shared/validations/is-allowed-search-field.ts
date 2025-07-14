import { ValidationArguments, ValidationOptions, registerDecorator } from 'class-validator'

/**
 *
 * @param property To check which property from class is set for allowed search fields
 * @param validationOption
 * @returns decorator function
 */
export function IsAllowedSearchField(property: string, validationOption: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isAllowedSearchField',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOption,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const keyword = (args.object as any)['keyword']

          if (!keyword) {
            return true
          }

          const trimmed = value.trim()

          if (!/^[A-Za-z0-9_.]+$/.test(trimmed)) {
            return false
          }

          const [relatedPropertyName] = args.constraints
          const relatedValue = (args.object as any)[relatedPropertyName]

          return Object.values(relatedValue).includes(trimmed)
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} is not allowed`
        },
      },
    })
  }
}
