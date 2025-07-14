import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { SystemFeeController } from './system-fee.controller'
import { SystemFeeService } from './system-fee.service'
import { SystemFeeEntity } from './entities/system-fee.entity'

@Module({
  imports: [TypeOrmModule.forFeature([SystemFeeEntity])],
  controllers: [SystemFeeController],
  providers: [SystemFeeService],
  exports: [SystemFeeService],
})
export class SystemFeeModule {}
