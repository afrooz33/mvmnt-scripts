import { registerDecorator, ValidationOptions } from 'class-validator'
import { IsNonprofitUserAvailableConstraint } from '@app/src/shared/validations'

export function IsNonprofitUserAvailableDecorator(
  validationOptions?: ValidationOptions,
  section?: unknown,
) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [section],
      validator: IsNonprofitUserAvailableConstraint,
    })
  }
}
