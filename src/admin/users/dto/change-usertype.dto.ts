import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsEnum, IsNotEmpty } from 'class-validator'
import { UserAccountType } from '@app/src/users/user/enums'

export class ChangeUserTypeDto {
  @ApiProperty({
    description: 'Account type to change to',
    enum: Object.values(UserAccountType),
  })
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(UserAccountType)
  readonly account_type: UserAccountType
}
