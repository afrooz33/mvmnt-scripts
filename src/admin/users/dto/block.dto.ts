import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, ValidateNested } from 'class-validator'
import { BlockDetails } from './properties'
import { Type } from 'class-transformer'

export class BlockedDto {
  @ApiProperty({
    description: 'User id',
    example: '30435443-32fd-4b16-92f5-d5aa8932b1c2',
    format: 'uuid',
    type: 'string',
  })
  @IsNotEmpty()
  @IsDefined()
  readonly id: string

  @ValidateNested({ each: true })
  @Type(() => BlockDetails)
  @ApiProperty({
    name: 'blocked_details',
    description: 'Block details',
    type: BlockDetails,
  })
  @IsDefined()
  @IsNotEmpty()
  readonly blocked_details: BlockDetails
}
