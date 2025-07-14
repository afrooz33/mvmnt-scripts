import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsUUID } from 'class-validator'
import { UserSearchConditionProperty } from './'

export class UpdateUserSearchConditionProperty extends UserSearchConditionProperty {
  @ApiProperty({
    type: 'string',
    format: 'uuid',
    example: 'bbdd3373-bdb7-4d9f-9970-9c87d0d7f209',
  })
  @IsDefined()
  @IsNotEmpty()
  @IsUUID()
  readonly id: string
}
