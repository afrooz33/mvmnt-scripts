import { ApiProperty } from '@nestjs/swagger'
import { IsDefined, IsNotEmpty } from 'class-validator'

export class BanDto {
  @ApiProperty({
    description: 'Admin memo',
    example: 'This deal has been banned because of ...',
  })
  @IsNotEmpty()
  @IsDefined()
  readonly admin_memo: string
}
