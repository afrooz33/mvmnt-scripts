import { ValidateBy, ValidationOptions, buildMessage, ValidationArguments } from 'class-validator'

export const DealEndDateDecorator = (
  property: string,
  options?: ValidationOptions,
): PropertyDecorator =>
  ValidateBy(
    {
      name: 'DealEndDate',
      constraints: [property],
      validator: {
        validate: (value: Date, args: ValidationArguments): boolean => {
          if (!value) {
            return true
          }

          const [relatedPropertyName] = args.constraints
          const relatedValue = (args.object as Record<string, unknown>)[relatedPropertyName] as Date

          return new Date(value).getTime() > new Date(relatedValue).getTime()
        },
        defaultMessage: buildMessage(
          (each: string): string => each + '$property must be after $constraint1',
          options,
        ),
      },
    },
    options,
  )
