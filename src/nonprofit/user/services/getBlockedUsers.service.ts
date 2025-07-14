import { Raw } from 'typeorm'
import { AccountStatus } from '@app/src/nonprofit/user/enums'
import { NonprofitUserEntity } from '@app/src/nonprofit/user/entities/nonprofit-user.entity'

export default async function (): Promise<NonprofitUserEntity> {
  const today = new Date()
  const property = 'blocked_details'
  const field = 'unblock_date'

  const todayMonth = String(today.getMonth() + 1).padStart(2, '0')
  const todayDate = String(today.getDate()).padStart(2, '0')
  const todayYear = today.getFullYear()

  const dateToSearch = `${todayYear}-${todayMonth}-${todayDate}`

  const conditionField = `${property}::json->>'${field}' != '' AND cast(to_date(${property}::json->>'${field}', 'YYYY-MM-DD') as timestamp with time zone)`

  return await this.nonprofitUserRepository.find({
    where: {
      account_status: AccountStatus.BLOCKED,
      [property]: Raw(() => `${conditionField} = '${dateToSearch}'`),
    },
  })
}
