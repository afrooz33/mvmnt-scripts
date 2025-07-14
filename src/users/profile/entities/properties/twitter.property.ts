import { Column } from 'typeorm'

export class TwitterProfile {
  @Column({
    type: 'text',
    nullable: true,
  })
  id: string

  @Column({
    type: 'text',
    nullable: true,
  })
  name: string

  @Column({
    type: 'text',
    nullable: true,
  })
  username: string
}
