import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsUUID } from 'class-validator'

export class RevertDirectDonationDto {
  @ApiProperty({
    description: 'Donation ID',
    example: '195eae0c-350a-4413-bcaf-e034a0b190b6',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  @IsDefined()
  readonly donation: string
}
