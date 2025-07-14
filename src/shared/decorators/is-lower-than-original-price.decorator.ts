import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator'

@ValidatorConstraint({ name: 'IsLowerThanOriginalPrice', async: false })
export class IsLowerThanOriginalPriceConstraint implements ValidatorConstraintInterface {
  validate(price: any, args: ValidationArguments) {
    const object = args.object as any
    const originalPrice = object.original_price

    if (originalPrice === undefined || originalPrice <= 0) {
      return true
    }

    return price < originalPrice
  }

  defaultMessage() {
    return `price must be lower than original price`
  }
}

function IsLowerThanOriginalPrice(validationOptions?: ValidationOptions) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsLowerThanOriginalPriceConstraint,
    })
  }
}

export { IsLowerThanOriginalPrice }
