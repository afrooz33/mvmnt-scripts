import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsEnum, IsOptional } from 'class-validator'
import { SocialLoginProvider } from '@app/src/users/auth/enums'

export class SocialLoginDto {
  @ApiProperty({
    description: 'Service Provider for Login',
    enum: Object.values(SocialLoginProvider),
  })
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(SocialLoginProvider)
  readonly provider: SocialLoginProvider

  @ApiPropertyOptional({
    description: 'Id Token from the provider that support ODIC',
    type: String,
  })
  @IsOptional()
  readonly token: string

  @ApiPropertyOptional({
    description: 'Email from the provider that only support OAUTH',
    type: String,
  })
  @IsOptional()
  readonly email: string
}
