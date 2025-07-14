import { registerDecorator, ValidationOptions } from 'class-validator'
import { IsValidDonationTypeConstraint } from './is-valid-donation-type.constraint'

export function IsValidDonationType(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isValidDonationType',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: new IsValidDonationTypeConstraint(),
    })
  }
}
