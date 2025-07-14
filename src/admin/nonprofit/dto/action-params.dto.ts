import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsEnum, IsNotEmpty } from 'class-validator'
import { NonprofitAccountStatus } from '@app/src/admin/nonprofit/enums'

export class ActionParamDto {
  @ApiProperty({
    description: 'Nonprofit profile id',
    example: 'a876c666-be68-4620-9990-642a0af0f568',
    format: 'uuid',
  })
  @IsDefined()
  @IsNotEmpty()
  readonly id: string

  @ApiProperty({ enum: NonprofitAccountStatus })
  @IsEnum(NonprofitAccountStatus)
  @IsDefined()
  @IsNotEmpty()
  readonly status: NonprofitAccountStatus
}
