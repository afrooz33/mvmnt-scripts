import { Column } from 'typeorm'

export class InstagramProfile {
  @Column({
    type: 'text',
    nullable: true,
  })
  id: string

  @Column({
    type: 'text',
    nullable: true,
  })
  username: string

  @Column({
    type: 'text',
    nullable: true,
  })
  media_count: string

  @Column({
    type: 'text',
    nullable: true,
  })
  account_type: string
}
