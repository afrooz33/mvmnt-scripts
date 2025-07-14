import { AfterLoad, Column, Entity, JoinColumn, JoinTable, ManyToOne, OneToMany } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { GuideStatus, GuideLevel } from '@app/src/admin/guides/enums'
import { GuidesTranslationEntity } from '@app/src/admin/guides/entities/guides.translation.entity'
import { toResponseObject } from './methods'

@Entity('guides')
export class GuidesEntity extends MyEntity {
  @Column('integer', { nullable: false })
  display_order: number

  @Column('text', {
    nullable: false,
  })
  name: string

  @Column('text', {
    nullable: true,
  })
  description: string

  @ManyToOne(() => GuidesEntity, (guide) => guide.children)
  parent: GuidesEntity

  @OneToMany(() => GuidesEntity, (guide) => guide.parent)
  children: GuidesEntity[]

  @OneToMany(() => GuidesTranslationEntity, (translation) => translation.category, {
    cascade: true,
  })
  @JoinColumn()
  @JoinTable()
  translations: GuidesTranslationEntity[]

  @Column({
    type: 'enum',
    enum: Object.values(GuideLevel),
    default: GuideLevel.BIG,
    nullable: false,
  })
  level: GuideLevel

  @Column({
    type: 'enum',
    enum: Object.values(GuideStatus),
    default: GuideStatus.ENABLED,
    nullable: false,
  })
  status: GuideStatus

  total_childs?: number

  @AfterLoad()
  async countTotalChild() {
    const { count } = await GuidesEntity.createQueryBuilder('guides')
      .where('guides.parent = :id AND guides.status = :status', {
        id: this.id,
        status: GuideStatus.ENABLED,
      })
      .select('COUNT(*)', 'count')
      .getRawOne()

    this.total_childs = count
  }

  public toResponseObject = toResponseObject.bind(this)
}
