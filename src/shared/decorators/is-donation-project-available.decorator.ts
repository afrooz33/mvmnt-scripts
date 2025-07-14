import { registerDecorator, ValidationOptions } from 'class-validator'
import { IsDonationProjectAvailableConstraint } from '@app/src/shared/validations'

export function IsDonationProjectAvailableDecorator(
  validationOptions?: ValidationOptions,
  section?: unknown,
) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [section],
      validator: IsDonationProjectAvailableConstraint,
    })
  }
}
