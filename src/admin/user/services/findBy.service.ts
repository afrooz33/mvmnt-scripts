import { AdminUserEntity } from '@app/src/admin/user/entities/user.entity'

export default async function (condition: any): Promise<AdminUserEntity> {
  return await this.adminUserRepository.findOne(...condition)
}
