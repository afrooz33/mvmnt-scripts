import { MySearchDto } from '@app/src/shared/base'
import { OnlyNameSearchFields } from '@app/src/shared/enums'

export class QueryDto extends MySearchDto {
  constructor() {
    super(OnlyNameSearchFields)
  }
}
