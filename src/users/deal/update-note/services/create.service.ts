import { In } from 'typeorm'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AccountStatus } from '@app/src/users/user/enums'
import { DealType, DealStatus } from '@app/src/users/deal/enums'
import { UpdateNoteDto } from '@app/src/users/deal/update-note/dto'
import { UpdateNoteEntity } from '@app/src/users/deal/update-note/entities/update-note.entity'

export default async function (payload: UpdateNoteDto, userId: string): Promise<SuccessRO> {
  try {
    const deal = await this.dealService.documentExists({
      condition: [
        {
          where: {
            id: payload.deal,
            user: {
              id: userId,
            },
            status: In([DealStatus.ON_DEAL, DealStatus.ENDED]),
            deal_type: In([DealType.AUCTION, DealType.RAFFLE]),
          },
          select: ['id', 'name'],
        },
      ],
      message: ErrorKey.UPDATE_NOTES_NOT_ALLOWED,
    })

    const updateNote: UpdateNoteEntity = await this.updateNotesRepository.create(payload)

    await updateNote.save()

    const participants = await this.updateNotesRepository.query(`SELECT
        "u"."username",
        "u"."email"
      FROM
        "user_deals_likes" "like"
      INNER JOIN "users" "u" ON "u"."id" = "like"."userId"
      WHERE "u"."account_status" = '${AccountStatus.ENABLED}' AND "like"."dealId" = '${deal.id}'
      GROUP BY "u"."id"
      UNION ALL
      SELECT
        "u"."username",
        "u"."email"
      FROM
        "user_deal_item_payment" "item_payment"
      INNER JOIN "users" "u" ON "u"."id" = "item_payment"."senderId"
      WHERE "u"."account_status" = '${AccountStatus.ENABLED}' AND "item_payment"."dealId" = '${deal.id}' 
      GROUP BY "u"."id"`)

    const batchSize = 10

    if (participants.length) {
      for (let i = 0; i < participants.length; i += batchSize) {
        const batch = participants.slice(i, i + batchSize)

        Promise.all(
          batch.map((participant) =>
            this.mailService.dealUpdateNotes({
              deal_name: deal.name,
              email: participant.email,
              username: participant.username,
              notes: payload.note.substring(0, 100),
            }),
          ),
        )
      }
    }

    return {
      success: true,
      message: 'Update note created successfully',
      data: updateNote,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
