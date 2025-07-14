import { Module } from '@nestjs/common'
import { DealModule } from './deal.module'

@Module({
  imports: [DealModule],
})
export class DealsModule {}
