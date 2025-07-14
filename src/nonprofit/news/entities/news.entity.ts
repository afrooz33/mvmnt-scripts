import { Column, Entity, ManyToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { NewsStatus } from '@app/src/nonprofit/news/enums'
import { documentExistsMethod } from '@app/src/shared/entities/methods'
import { NonprofitUserEntity } from '@app/src/nonprofit/user/entities/nonprofit-user.entity'

@Entity('nonprofit_news')
export class NewsEntity extends MyEntity {
  @Column({
    type: 'text',
    nullable: false,
  })
  title: string

  @Column({
    type: 'text',
    nullable: false,
  })
  details: string

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  schedule_date?: Date

  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  published_date?: Date

  @Column('bigint', {
    nullable: false,
    default: 0,
  })
  views: number

  @Column({
    type: 'enum',
    enum: Object.values(NewsStatus),
    default: NewsStatus.DRAFT,
  })
  status?: NewsStatus

  @ManyToOne(() => NonprofitUserEntity, (user) => user.news)
  user: NonprofitUserEntity

  public static documentExists = documentExistsMethod
}
