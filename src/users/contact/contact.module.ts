import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ContactController } from './contact.controller'
import { ContactService } from './contact.service'
import { ContactEntity } from './entities/contact.entity'
import { UserModule } from '@app/src/users/user/user.module'
import { DealModule } from '@app/src/users/deal/deal.module'

@Module({
  imports: [TypeOrmModule.forFeature([ContactEntity]), UserModule, DealModule],
  controllers: [ContactController],
  providers: [ContactService],
})
export class ContactModule {}
