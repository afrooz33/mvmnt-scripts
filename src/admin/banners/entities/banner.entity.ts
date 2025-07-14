import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm'
import { BannerSection, BannerStatus } from '@app/src/admin/banners/enums'
import { MyEntity } from '@app/src/shared/base'
import { ImagesEntity } from '@app/src/images/entities/images.entity'

@Entity('banners')
export class BannerEntity extends MyEntity {
  @Column('numeric', { nullable: false, default: 1 })
  display_order: number

  @Column({
    type: 'enum',
    enum: Object.values(BannerSection),
    default: BannerSection.HEADER,
    nullable: false,
  })
  section: BannerSection

  @ManyToOne(() => ImagesEntity, { cascade: true })
  @JoinColumn()
  image_sp: ImagesEntity

  @ManyToOne(() => ImagesEntity, { cascade: true })
  @JoinColumn()
  image_pc: ImagesEntity

  @Column('text')
  url: string

  @Column({
    type: 'enum',
    enum: Object.values(BannerStatus),
    default: BannerStatus.ENABLED,
    nullable: false,
  })
  status: BannerStatus
}
