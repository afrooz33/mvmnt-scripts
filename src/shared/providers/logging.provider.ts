import { APP_INTERCEPTOR } from '@nestjs/core'

import { LoggingInterceptor } from '@app/shared/interceptors'

export default {
  provide: APP_INTERCEPTOR,
  useClass: LoggingInterceptor,
}
