import { registerDecorator, ValidationOptions } from 'class-validator'
import { IsDealCategoryAvailableConstraint } from '@app/src/shared/validations'

export function IsDealCategoryAvailableDecorator(
  validationOptions?: ValidationOptions,
  section?: unknown,
) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [section],
      validator: IsDealCategoryAvailableConstraint,
    })
  }
}
