import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty, IsUUID } from 'class-validator'
import { CreateAdminDto } from './create-admin-user.dto'

export class UpdateAdminDto extends CreateAdminDto {
  @ApiProperty({
    description: 'Admin user id',
    type: String,
    format: 'uuid',
    example: 'd0f0a6c0-0b4b-4a8b-8c0a-5b2b269c7c6e',
  })
  @IsUUID()
  @IsDefined()
  @IsNotEmpty()
  readonly id: string
}
