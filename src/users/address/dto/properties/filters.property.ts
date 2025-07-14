import { IsEnum, IsOptional } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { UserAddressType } from '@app/src/users/address/enums'

export class FiltersProperty {
  @ApiPropertyOptional({
    description: 'Address type',
    name: 'filter[type]',
    enum: Object.values(UserAddressType),
    default: UserAddressType.DELIVERY,
  })
  @IsOptional()
  @IsEnum(UserAddressType, {
    message: 'Invalid address type.',
  })
  readonly type?: UserAddressType
}
