import { IsDefined, IsOptional, IsUUID } from 'class-validator'
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { MyPaginateDto } from '@app/src/shared/base'

export class QueryRankingCommentsDto extends MyPaginateDto {
  @ApiProperty({
    description: 'ID of the wishlist owner',
    type: String,
    format: 'uuid',
  })
  @IsUUID()
  @IsDefined()
  wishlist_owner: string

  @ApiProperty({
    description: 'ID of the ranked user',
    type: String,
    format: 'uuid',
  })
  @IsUUID()
  @IsDefined()
  ranked_user: string

  @ApiPropertyOptional({
    description: 'Parent comment ID',
    type: String,
    format: 'uuid',
  })
  @IsUUID()
  @IsOptional()
  parent?: string
}
