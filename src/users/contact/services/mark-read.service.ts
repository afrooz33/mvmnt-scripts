import { BadRequestException, NotFoundException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { ErrorKey, Query } from '@app/src/shared/enums'

export default async function (id: string, userId: string): Promise<SuccessRO> {
  try {
    const ticket = await this.contactRepository.findOne({
      where: [
        { id, user: { id: userId } },
        { id, receiver: { id: userId } },
      ],
      relations: [Query.USER, Query.RECEIVER],
    })

    if (!ticket) {
      throw new NotFoundException(ErrorKey.INVALID_CONTACT_US)
    }

    if (ticket.user.id === userId) {
      ticket.sender_read = true
    } else if (ticket.receiver.id === userId) {
      ticket.receiver_read = true
    } else {
      throw new BadRequestException(ErrorKey.INVALID_CONTACT_US)
    }

    await this.contactRepository.save(ticket)

    return {
      message: 'Ticket marked as read',
      success: true,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
