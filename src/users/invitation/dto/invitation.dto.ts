import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, MaxLength, MinLength, IsNotEmpty, IsAlphanumeric } from 'class-validator'

export class InvitationDto {
  @ApiProperty({
    description: 'The invitation code',
    example: '12345678',
    nullable: false,
    required: true,
  })
  @IsNotEmpty()
  @IsDefined()
  @MaxLength(8)
  @MinLength(8)
  @IsAlphanumeric()
  readonly code: string
}
