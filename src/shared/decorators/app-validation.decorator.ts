import { UsePipes } from '@nestjs/common'

import { ValidationPipe } from '@app/shared/validations'

export const AppValidationDecorator = () => UsePipes(new ValidationPipe())
