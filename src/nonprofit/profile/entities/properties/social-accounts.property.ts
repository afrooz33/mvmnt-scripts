import { Column } from 'typeorm'

export class SocialAccounts {
  @Column({
    type: 'text',
    nullable: true,
  })
  facebook?: string

  @Column({
    type: 'text',
    nullable: true,
  })
  twitter?: string

  @Column({
    type: 'text',
    nullable: true,
  })
  youTube?: string

  @Column({
    type: 'text',
    nullable: true,
  })
  instagram?: string

  @Column({
    type: 'text',
    nullable: true,
  })
  blog?: string
}
