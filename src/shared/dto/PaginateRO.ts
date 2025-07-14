import { ApiProperty } from '@nestjs/swagger'

import { PaginateMetaRO } from './PadinationMetaRO'

export class PaginateRO {
  @ApiProperty({ example: [] })
  readonly data: any[]

  @ApiProperty({ type: PaginateMetaRO })
  readonly meta: PaginateMetaRO
}
