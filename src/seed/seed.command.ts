import { NestFactory } from '@nestjs/core'

import { SeedModule } from './seed.module'
import { SeedService } from './seed.service'

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(SeedModule)

  const seeder = appContext.get(SeedService)

  if (process.env.NODE_ENV === 'production') {
    console.log('You are in production mode. Seed is not allowed in production.')
    process.exit(0)
  }

  await seeder.seedAll()

  await appContext.close()
}
bootstrap()
