import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsUUID } from 'class-validator'
import { MyPaginateDto } from '@app/src/shared/base'

export class PublicPurchaseHistoryQueryDto extends MyPaginateDto {
  @ApiProperty({
    description: 'The buyer id',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  buyer: string

  @ApiProperty({
    description: 'The seller id',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  seller: string
}
