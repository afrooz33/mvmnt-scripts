import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsUUID } from 'class-validator'

export class PublicShippingProfileQueryDto {
  @ApiProperty({
    format: 'uuid',
    description: 'User Id',
    example: '2647383e-aa00-4f29-b66b-e0ab96993ab5',
  })
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  readonly userId: string
}
