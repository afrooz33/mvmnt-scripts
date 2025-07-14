import { registerDecorator, ValidationOptions } from 'class-validator'
import { IsUserDealConstraint } from '@app/src/shared/validations'

export function IsUserDealDecorator(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsUserDeal',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsUserDealConstraint,
    })
  }
}
