import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator'
import { AccountStatus, AdminRole } from '@app/src/admin/user/enums'

export class CreateAdminDto {
  @ApiProperty({ enum: AdminRole })
  @IsEnum(AdminRole)
  readonly role: AdminRole

  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  readonly email: string

  @ApiProperty()
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string

  @ApiProperty({ enum: AccountStatus })
  @IsEnum(AccountStatus)
  readonly status: AccountStatus
}
