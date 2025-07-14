import { IsEmail, IsUrl } from 'class-validator'
import { Column } from 'typeorm'

export class GoogleProfile {
  @Column({
    type: 'text',
    nullable: true,
  })
  id: string

  @Column({
    type: 'text',
    nullable: true,
  })
  @IsEmail()
  email: string

  @Column({
    type: 'text',
    nullable: true,
  })
  given_name: string

  @Column({
    type: 'text',
    nullable: true,
  })
  family_name: string

  @Column({
    type: 'text',
    nullable: true,
  })
  access_token: string

  @Column({
    type: 'text',
    nullable: true,
  })
  @IsUrl()
  picture: string
}
