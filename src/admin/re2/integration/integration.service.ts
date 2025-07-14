import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { IntegrationsEntity } from '@app/src/re2/integrations/entities/integrations.entity'
import { showService } from './services'

@Injectable()
export class IntegrationService extends MyService<IntegrationsEntity> {
  constructor(
    @InjectRepository(IntegrationsEntity)
    public readonly integrationRepository: Repository<IntegrationsEntity>,
  ) {
    super(integrationRepository, 'admin/re2/integration')
  }

  show = showService.bind(this)
}
