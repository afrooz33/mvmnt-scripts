import { ValidationArguments } from 'class-validator'
import { REQUEST_CONTEXT } from '@app/src/shared/interceptors'

export type User = {
  id: string
}

export interface ExtendedValidationArguments extends ValidationArguments {
  object: {
    [REQUEST_CONTEXT]: {
      user: User
    }
  }
}
