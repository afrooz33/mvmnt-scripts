import { Column, Entity, JoinColumn, JoinTable, ManyToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { Fields, Conditions } from '@app/src/admin/homepages/enums'
import { HomepagesEntity } from './homepages.entity'

@Entity('homepage_search_conditions')
export class HomepageSearchConditionsEntity extends MyEntity {
  @Column({
    type: 'enum',
    nullable: false,
    enum: Object.values(Fields),
  })
  field: Fields

  @Column({
    type: 'enum',
    nullable: false,
    enum: Object.values(Conditions),
  })
  condition: Conditions

  @Column({
    type: 'text',
    nullable: true,
  })
  values: string

  @ManyToOne(() => HomepagesEntity, (homepage) => homepage.search_conditions)
  @JoinTable()
  @JoinColumn()
  homepage: HomepagesEntity
}
