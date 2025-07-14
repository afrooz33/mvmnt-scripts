import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsString, IsUUID } from 'class-validator'

export class RevertWithdrawalRequestDto {
  @ApiProperty({
    description: 'Withdraw ID',
    example: '9055ee74-cf65-49dd-9f2e-7517c00b59df',
    format: 'uuid',
  })
  @IsDefined()
  @IsString()
  @IsUUID()
  readonly withdraw: string
}
