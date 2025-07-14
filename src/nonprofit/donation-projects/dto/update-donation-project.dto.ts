import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsUUID } from 'class-validator'
import { DonationProjectDto } from './donation-project.dto'

export class UpdateDonationProjectDto extends DonationProjectDto {
  @ApiProperty({ format: 'uuid', example: '3c463cc7-c362-4064-9f8c-4ea9327745b9' })
  @IsNotEmpty()
  @IsDefined()
  @IsUUID()
  readonly id: string
}
