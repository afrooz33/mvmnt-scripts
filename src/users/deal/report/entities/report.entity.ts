import { Column, Entity, JoinColumn, JoinTable, ManyToMany, ManyToOne } from 'typeorm'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { ImagesEntity } from '@app/src/images/entities/images.entity'
import { MyEntity } from '@app/src/shared/base'
import { UserEntity } from '@app/src/users/user/entities/user.entity'

@Entity('deal_reports')
export class ReportEntity extends MyEntity {
  @Column('text', { nullable: false, default: null })
  description: string

  @ManyToOne(() => DealEntity)
  @JoinTable()
  @JoinColumn()
  deal: DealEntity

  @ManyToMany(() => ImagesEntity, (image) => image.deal_report)
  @JoinTable()
  images: ImagesEntity[]

  @ManyToOne(() => UserEntity, (user) => user.reports, {
    nullable: false,
    cascade: true,
  })
  @JoinColumn()
  user: UserEntity
}
