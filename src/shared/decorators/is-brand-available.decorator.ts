import { registerDecorator, ValidationOptions } from 'class-validator'
import { IsBrandAvailableConstraint } from '@app/src/shared/validations'

export function IsBrandAvailableDecorator(
  validationOptions?: ValidationOptions,
  section?: unknown,
) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [section],
      validator: IsBrandAvailableConstraint,
    })
  }
}
