import { Type } from 'class-transformer'
import { IsOptional } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { MySearchDto } from '@app/src/shared/base'
import { OnlyNameSearchFields } from '@app/src/shared/enums'
import { FiltersProperty } from '@app/src/users/delivery-settings/dto/properties'

export class QueryDeliveryCarrierDto extends MySearchDto {
  constructor() {
    super(OnlyNameSearchFields)
  }

  //Filter properties to be applied on query
  @ApiPropertyOptional({ type: FiltersProperty })
  @Type(() => FiltersProperty)
  @IsOptional()
  readonly filter?: FiltersProperty
}
