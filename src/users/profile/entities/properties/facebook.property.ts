import { IsEmail, IsUrl } from 'class-validator'
import { Column } from 'typeorm'

export class FacebookProfile {
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
  name: string

  @Column({
    type: 'text',
    nullable: true,
  })
  @IsUrl()
  picture: string
}
