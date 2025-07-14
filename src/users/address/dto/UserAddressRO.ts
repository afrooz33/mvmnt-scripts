import { IsDefined } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'
import { CommonRO } from '@app/src/shared/dto'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { CountryEntity } from '@app/src/admin/geo/entities/country.entity'

export class UserAddressRO extends CommonRO {
  @ApiProperty({ format: 'uuid' })
  readonly id: string

  @ApiProperty()
  @IsDefined()
  readonly street: string

  @ApiProperty()
  @IsDefined()
  readonly city: string

  @ApiProperty()
  @IsDefined()
  readonly state: string

  @ApiProperty()
  @IsDefined()
  readonly postcode: string

  @ApiProperty()
  @IsDefined()
  readonly phone_number: string

  @ApiProperty()
  @IsDefined()
  readonly building: string

  @ApiProperty()
  @IsDefined()
  readonly is_default: boolean

  @ApiProperty()
  @IsDefined()
  readonly name: string

  @ApiProperty({ type: CountryEntity })
  @IsDefined()
  readonly country: CountryEntity

  @ApiProperty({ type: UserEntity })
  @IsDefined()
  user: UserEntity

  @ApiProperty()
  @IsDefined()
  readonly type: string
}
