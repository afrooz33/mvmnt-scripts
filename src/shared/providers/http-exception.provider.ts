import { APP_FILTER } from '@nestjs/core'

import { HttpExceptionFilter } from '@app/shared/filters'

export default {
  provide: APP_FILTER,
  useClass: HttpExceptionFilter,
}
