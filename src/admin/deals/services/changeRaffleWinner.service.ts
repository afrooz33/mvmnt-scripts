import { BadRequestException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ChangeRaffleWinnerDto } from '@app/src/admin/deals/dto'

export default async function (
  id: string,
  payload: ChangeRaffleWinnerDto,
  userId: string,
): Promise<SuccessRO> {
  try {
    const exist = await this.raffleWinnerRepository.findOne({
      where: {
        winner: {
          user: {
            username: payload.username,
          },
        },
        prize: {
          raffles: {
            deal: {
              id: payload.deal,
            },
          },
        },
      },
      select: ['id'],
    })

    if (exist) {
      throw new BadRequestException('Raffle winner already exists')
    }

    const winner = await this.rafflePurchaseRepository.findOne({
      where: {
        user: {
          username: payload.username,
        },
        deal: {
          id: payload.deal,
        },
      },
      select: ['id'],
    })

    if (!winner) {
      throw new BadRequestException('User did not participated in the raffle.')
    }

    exist.old_winner = exist.winner
    exist.replaced_by = userId
    exist.was_replaced = true
    exist.winner = winner

    await exist.save()

    return {
      success: true,
      message: 'Successfully updated raffle winner',
      data: exist,
    }
  } catch (error) {
    throw new BadRequestException(error.message ?? error.toString())
  }
}
