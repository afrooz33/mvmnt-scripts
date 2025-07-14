import { registerDecorator, ValidationOptions } from 'class-validator'
import { IsValidDealOptionConstraint } from '@app/src/shared/validations'

export function IsValidDealOptionDecorator(validationOptions?: ValidationOptions) {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsValidDealOption',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: IsValidDealOptionConstraint,
    })
  }
}
