import { registerDecorator, ValidationOptions } from 'class-validator'
import { IsUserDonationProjectConstraint } from '@app/src/shared/validations'

export function IsUserDonationProjectDecorator(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsUserDonationProject',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsUserDonationProjectConstraint,
    })
  }
}
