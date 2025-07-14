import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { InvitationService } from './invitation.service'
import { InvitationController } from './invitation.controller'
import { InvitationEntity } from './entities/invitation.entity'

@Module({
  imports: [TypeOrmModule.forFeature([InvitationEntity])],
  controllers: [InvitationController],
  providers: [InvitationService],
  exports: [InvitationService],
})
export class InvitationModule {}
