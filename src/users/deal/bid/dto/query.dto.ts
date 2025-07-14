import { MySearchDto } from '@app/src/shared/base'
import { TranslationSearchFields } from '@app/src/shared/enums'

export class QueryDto extends MySearchDto {
  constructor() {
    super(TranslationSearchFields)
  }
}
