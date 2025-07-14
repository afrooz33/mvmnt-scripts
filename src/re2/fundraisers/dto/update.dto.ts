import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsUUID } from 'class-validator'
import { CreateFundraiserDto } from './create.dto'

export class UpdateFundraiserDto extends CreateFundraiserDto {
  @ApiProperty({
    description: 'Fundraiser page or form id',
    type: 'string',
    format: 'uuid',
    example: '8feffe08-4830-4bb8-af3a-dfba905efc7e',
  })
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  readonly id: string
}
