import { Column } from 'typeorm'

export class ProfileNames {
  @Column({
    type: 'text',
    nullable: true,
  })
  first_name: string

  @Column({
    type: 'text',
    nullable: true,
  })
  last_name: string

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  kanji: {
    first_name: string
    last_name: string
  }

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  kana: {
    first_name: string
    last_name: string
  }
}
