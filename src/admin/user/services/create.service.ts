import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common'
import { AdminUserEntity } from '@app/src/admin/user/entities/user.entity'
import { CreateAdminDto } from '@app/src/admin/user/dto'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { AdminRole } from '@app/src/admin/user/enums'

export default async function (payload: CreateAdminDto): Promise<SuccessRO> {
  try {
    if (payload.role === AdminRole.OWNER) {
      throw new ForbiddenException(ErrorKey.OWNER_CANNOT_BE_CREATED)
    }

    const user: AdminUserEntity = await this.updateOne({
      ...payload,
    })

    return {
      success: true,
      message: `Admin user [${payload.email}] successfully saved`,
      data: this.toResponseObject(user),
    }
  } catch (error) {
    if (error.message.includes('duplicate key value violates unique constraint')) {
      throw new ConflictException(ErrorKey.EMAIL_ALREADY_EXISTS)
    } else {
      throw new BadRequestException(error.message)
    }
  }
}
