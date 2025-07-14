import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsString } from 'class-validator'

export class VerifyTwoAuthDto {
  @ApiProperty({
    description: 'The user ID',
    format: 'uuid',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  readonly id: string

  @ApiProperty({
    description: 'The two-factor authentication code',
    example: '123456',
  })
  @IsDefined()
  @IsString()
  @IsNotEmpty()
  readonly code: string
}
