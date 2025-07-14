import { Column } from 'typeorm'

export class Blocked {
  @Column('smallint')
  days: number

  @Column({
    type: 'timestamp with time zone',
    nullable: false,
    default: () => 'CURRENT_TIMESTAMP',
  })
  block_date: Date

  @Column('timestamp with time zone')
  unblock_date?: Date
}
