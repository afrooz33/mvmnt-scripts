import { Entity, JoinColumn, JoinTable, ManyToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { HomepagesEntity } from './homepages.entity'
import { BrandEntity } from '@app/src/admin/brands/entities/brand.entity'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { DealCategoryEntity } from '@app/src/admin/deals/category/entities/deal-category.entity'
import { toResponseObject } from './methods'

@Entity('homepage_contents')
export class HomepageContentEntity extends MyEntity {
  @ManyToOne(() => HomepagesEntity, (homepage) => homepage.contents, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  @JoinTable()
  homepage: HomepagesEntity

  @ManyToOne(() => BrandEntity, {
    nullable: true,
  })
  @JoinColumn()
  @JoinTable()
  brand: BrandEntity

  @ManyToOne(() => UserEntity, {
    nullable: true,
  })
  @JoinColumn()
  @JoinTable()
  user: UserEntity

  @ManyToOne(() => DealEntity, {
    nullable: true,
  })
  @JoinColumn()
  @JoinTable()
  deal: DealEntity

  @ManyToOne(() => DealCategoryEntity, {
    nullable: true,
  })
  @JoinColumn()
  @JoinTable()
  category: DealCategoryEntity

  public toResponseObject = toResponseObject.bind(this)
}
