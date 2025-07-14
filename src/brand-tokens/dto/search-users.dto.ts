import { MySearchDto } from '@app/src/shared/base'
import { UserSearchFields } from '@app/src/brand-tokens/enums'

export class SearchUsersDto extends MySearchDto {
  constructor() {
    super(UserSearchFields)
  }
}
