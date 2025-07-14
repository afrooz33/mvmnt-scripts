import { registerDecorator, ValidationOptions } from 'class-validator'
import { IsLanguageActiveConstraint } from '@app/src/shared/validations'

export function IsLanguageActiveDecorator(validationOptions?: ValidationOptions) {
  return function (object: unknown, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsLanguageActiveConstraint,
    })
  }
}
