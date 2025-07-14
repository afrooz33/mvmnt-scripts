import { MySearchDto } from '@app/src/shared/base'
import { DealTemplateSearchFields } from '@app/src/shared/enums'

export class QueryDto extends MySearchDto {
  constructor() {
    super(DealTemplateSearchFields)
  }
}
