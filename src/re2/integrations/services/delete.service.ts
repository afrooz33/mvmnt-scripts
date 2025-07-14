import { Not } from 'typeorm'
import { ErrorKey } from '@app/src/shared/enums'
import { SuccessRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { IntegrationStatus } from '@app/src/re2/integrations/enums'

export default async function (id: string, userId: string): Promise<SuccessRO> {
  try {
    await this.documentExists({
      condition: [
        {
          where: {
            id,
            user: {
              id: userId,
            },
            status: Not(IntegrationStatus.DELETED),
          },
          select: ['id'],
        },
      ],
      errorMessage: JSON.stringify({
        key: ErrorKey.RE2_INTEGRATION_NOT_FOUND,
        args: { id },
      }),
    })

    await this.integrationsRepository.update(
      {
        id,
        user: {
          id: userId,
        },
      },
      {
        status: IntegrationStatus.DELETED,
      },
    )

    return {
      success: true,
      message: 'Integration deleted successfully.',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
