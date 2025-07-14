import { registerDecorator, ValidationOptions } from 'class-validator'
import { IsImageAvailableConstraint } from '@app/src/shared/validations'

export function IsImageAvailableDecorator(validationOptions?: ValidationOptions, section?: string) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [section],
      validator: IsImageAvailableConstraint,
    })
  }
}
