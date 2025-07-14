import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator'

export class CreateRankingCommentDto {
  @ApiProperty({ description: 'The comment text', maxLength: 1000 })
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  @MaxLength(1000)
  readonly comment: string

  @ApiProperty({ description: 'The wishlist owner ID', format: 'uuid' })
  @IsUUID()
  @IsOptional()
  readonly wishlist_owner?: string

  @ApiPropertyOptional({ description: 'Parent comment ID for threaded replies', format: 'uuid' })
  @IsUUID()
  @IsOptional()
  readonly parent?: string
}
