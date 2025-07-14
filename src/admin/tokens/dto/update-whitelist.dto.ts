import { ApiProperty } from '@nestjs/swagger'
import { IsArray, IsBoolean, IsUUID } from 'class-validator'

export class UpdateWhitelistDto {
  @ApiProperty({
    description: 'Whitelisted tokens uuids',
    type: [String],
  })
  @IsArray()
  @IsUUID('4', { each: true })
  tokens: string[]

  @ApiProperty({
    description: 'Whitelisted tokens',
    required: false,
  })
  @IsBoolean()
  is_whitelisted: boolean
}
