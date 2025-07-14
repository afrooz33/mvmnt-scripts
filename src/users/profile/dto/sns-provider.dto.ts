import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator'
import { SnsProvider } from '@app/src/users/profile/enums'

export class SnsProviderDto {
  @ApiProperty({
    format: 'uuid',
    default: null,
    name: 'id',
  })
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  readonly id: string

  @ApiProperty({
    description: 'SNS provider',
    isArray: false,
    enum: Object.values(SnsProvider),
  })
  @IsString()
  @IsDefined()
  @IsNotEmpty()
  @IsEnum(SnsProvider)
  readonly provider: SnsProvider
}
