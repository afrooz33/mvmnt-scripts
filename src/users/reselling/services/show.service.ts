import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'

export default async function (token: string): Promise<any> {
  try {
    const link = await this.documentExists({
      condition: [
        {
          where: {
            token,
          },
          relations: [Query.USER, Query.DEAL],
          select: {
            id: true,
            token: true,
            user: {
              id: true,
            },
            deal: {
              id: true,
            },
          },
        },
      ],
      errorMessage: ErrorKey.RESELLING_LINK_NOT_FOUND,
    })

    return {
      user: link?.user?.id,
      deal: link?.deal?.id,
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
