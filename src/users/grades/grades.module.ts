import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { UserModule } from '@app/src/users/user/user.module'
import { DealModule } from '@app/src/users/deal/deal.module'
import { InvitationEntity } from '@app/src/users/invitation/entities/invitation.entity'
import { GradesService } from './grades.service'

@Module({
  imports: [TypeOrmModule.forFeature([InvitationEntity]), UserModule, forwardRef(() => DealModule)],

  providers: [GradesService],
  exports: [GradesService],
})
export class GradesModule {}
