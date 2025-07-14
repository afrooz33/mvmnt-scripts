import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { IntegrationsEntity } from '@app/src/re2/integrations/entities/integrations.entity'
import { IntegrationController } from './integration.controller'
import { IntegrationService } from './integration.service'

@Module({
  imports: [TypeOrmModule.forFeature([IntegrationsEntity])],
  controllers: [IntegrationController],
  providers: [IntegrationService],
  exports: [IntegrationService],
})
export class AdminRe2IntegrationModule {}
