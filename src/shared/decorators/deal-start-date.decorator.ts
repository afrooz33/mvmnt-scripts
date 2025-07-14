import { ValidateBy, ValidationOptions } from 'class-validator'

export const DealStartDateDecorator = (options?: ValidationOptions): PropertyDecorator =>
  ValidateBy(
    {
      name: 'DealStartDate',
      constraints: [],
      validator: {
        validate: (value: Date): boolean => {
          const relatedValue = new Date(value) as Date
          const todayPlusThreeDays = new Date()

          todayPlusThreeDays.setDate(todayPlusThreeDays.getDate() + 3)

          return todayPlusThreeDays.getTime() <= relatedValue.getTime()
        },
      },
    },
    options,
  )
