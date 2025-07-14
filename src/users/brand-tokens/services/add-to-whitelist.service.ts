import { In } from 'typeorm'
import * as csv from 'csv-parse'
import { BadRequestException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { AddWhitelistDto } from '@app/src/brand-tokens/dto'
import { WhitelistStatus, PhaseType, ParticipationMethod } from '@app/src/brand-tokens/enums'

export async function addToWhitelistService(
  userId: string,
  phaseId: string,
  payload: AddWhitelistDto,
  file?: Express.Multer.File,
): Promise<SuccessRO> {
  try {
    const phase = await this.offeringPhaseRepository.findOne({
      where: {
        id: phaseId,
        type: PhaseType.WHITELISTED,
      },
      select: {
        id: true,
      },
    })

    if (!phase) {
      throw new BadRequestException(ErrorKey.PHASE_NOT_FOUND)
    }

    let userIds: string[] = []

    if (payload.method === ParticipationMethod.CSV && file) {
      // Parse CSV file
      const records = await new Promise<string[][]>((resolve, reject) => {
        csv.parse(
          file.buffer,
          {
            delimiter: ',',
            from_line: 2,
          },
          (err, data) => {
            if (err) reject(err)
            resolve(data)
          },
        )
      })

      // Get users by email
      const emails = records.map((record) => record[0])
      const users = await this.userRepository.find({
        where: { email: In(emails) },
        select: ['id'],
      })
      userIds = users.map((u) => u.id)
    } else {
      userIds = payload.entries.map((entry) => entry.wallet_address)
    }

    // Create whitelist records
    const whitelist = userIds.map((userId) => ({
      phase,
      user: { id: userId },
      status: WhitelistStatus.PENDING,
    }))

    await this.phaseWhitelistRepository.save(whitelist)

    return {
      success: true,
      message: 'Users added to whitelist successfully',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
