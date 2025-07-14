import { Module, forwardRef } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { MailModule } from '@app/src/mail/mail.module'
import { DealModule } from '@app/src/users/deal/deal.module'
import { UpdateNoteEntity } from './entities/update-note.entity'
import { UpdateNoteController } from './update-note.controller'
import { UpdateNoteService } from './update-note.service'

@Module({
  imports: [TypeOrmModule.forFeature([UpdateNoteEntity]), forwardRef(() => DealModule), MailModule],
  controllers: [UpdateNoteController],
  providers: [UpdateNoteService],
})
export class UpdateNoteModule {}
