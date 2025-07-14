import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsOptional } from 'class-validator'
import { REQUEST_CONTEXT } from '@app/src/shared/interceptors'
import { IsUserDeal } from '@app/src/shared/decorators'

export class RecentlyViewedDealDto {
  @ApiProperty({
    description: 'Deal id',
    example: '0d79240f-832e-4d37-b2dd-35ff317f2a50',
    format: 'uuid',
  })
  @IsNotEmpty()
  @IsDefined()
  @IsUserDeal()
  deal: string;

  @IsOptional()
  [REQUEST_CONTEXT]: string
}
