import { HandleErrors } from '@app/src/shared/helpers/Error.helper'

export default async function (username: string): Promise<any> {
  try {
    return await this.userService.findMany({
      where: { username },
      select: ['id', 'username', 'display_name'],
    })
  } catch (error) {
    return HandleErrors(error)
  }
}
