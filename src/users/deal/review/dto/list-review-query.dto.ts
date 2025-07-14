import { ApiProperty } from '@nestjs/swagger'
import { IsUUID, IsString, IsNotEmpty } from 'class-validator'

export class ListReviewQueryDto {
  @ApiProperty({
    description: 'Page',
    default: 1,
  })
  @IsString()
  @IsNotEmpty()
  readonly page?: string

  @ApiProperty({
    description: 'Results per page',
    default: 10,
  })
  @IsString()
  @IsNotEmpty()
  readonly limit?: string

  @ApiProperty({
    description: 'User ID',
    format: 'uuid',
  })
  @IsUUID()
  @IsString()
  @IsNotEmpty()
  readonly user: string
}
