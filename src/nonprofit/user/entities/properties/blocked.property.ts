import { Column } from 'typeorm'

export class Blocked {
  @Column('smallint')
  days: number

  @Column('timestamp with time zone')
  block_date: Date

  @Column('timestamp with time zone')
  unblock_date?: Date
}
