import { registerDecorator, ValidationOptions } from 'class-validator'
import { IsValidDealOptionColorValueConstraint } from '@app/src/shared/validations'

export function IsValidDealOptionColorValueDecorator(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsValidDealOptionColorValue',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsValidDealOptionColorValueConstraint,
    })
  }
}
