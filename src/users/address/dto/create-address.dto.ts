import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDefined, IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator'
import { CountryEntity } from '@app/src/admin/geo/entities/country.entity'
import { UserAddressStatus, UserAddressType } from '@app/src/users/address/enums'

export class CreateAddressDto {
  @ApiProperty({
    description: 'Country id',
    example: '0887b22e-7619-4273-8293-9af6337d0319',
    type: 'string',
    format: 'uuid',
  })
  @IsNotEmpty()
  @IsDefined()
  readonly country: CountryEntity

  @ApiProperty({
    description: 'State',
    example: 'California',
    type: 'string',
  })
  @IsNotEmpty()
  @IsDefined()
  readonly state: string

  @ApiProperty({
    description: 'City',
    example: 'Los Angeles',
    type: 'string',
  })
  @IsNotEmpty()
  @IsDefined()
  readonly city: string

  @ApiProperty({
    description: 'Street',
    example: 'Main Street',
    type: 'string',
  })
  @IsDefined()
  @IsNotEmpty()
  readonly street: string

  @ApiProperty({
    description: 'Postcode',
    example: '000c954f-827e-4318-940e-f35b300b77b9',
    format: 'uuid',
  })
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  readonly postcode: string

  @ApiPropertyOptional({
    type: 'string',
    example: '08123456789',
    description: 'Phone number',
  })
  @IsOptional()
  readonly phone_number?: string

  @ApiPropertyOptional({
    type: 'string',
    description: 'Building',
    example: 'Main Building',
  })
  @IsOptional()
  readonly building?: string

  @ApiProperty({
    description: 'Name',
    example: '{"first_name": "John", "last_name": "Doe"}',
    type: 'jsonb',
  })
  @IsNotEmpty()
  @IsDefined()
  readonly name: any

  @ApiProperty({
    description: 'Address type',
    enum: Object.values(UserAddressType),
  })
  @IsEnum(UserAddressType)
  @IsDefined()
  readonly type: UserAddressType

  @IsOptional()
  status: UserAddressStatus
}
