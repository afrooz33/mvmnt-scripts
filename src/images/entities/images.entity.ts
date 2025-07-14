import { Column, Entity, ManyToMany } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { UploadType } from '@app/src/shared/enums'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'
import { ReportEntity } from '@app/src/users/deal/report/entities/report.entity'
import { DealVariantEntity } from '@app/src/users/deal/entities/deal-variant.entity'
import { FundraiserEntity } from '@app/src/re2/fundraisers/entities/fundraisers.entity'
import { DealRafflePrizeEntity } from '@app/src/users/deal/entities/deal-raffle-prize.entity'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'

@Entity('images')
export class ImagesEntity extends MyEntity {
  @Column('text')
  url: string

  @Column('text')
  filename: string

  @Column('boolean', { default: false })
  is_featured: boolean

  @Column({
    type: 'enum',
    enum: Object.values(UploadType),
    default: UploadType.BANNER,
    nullable: false,
  })
  section: UploadType

  @ManyToMany(() => DonationProjectEntity, (donationProject) => donationProject.images, {
    cascade: true,
  })
  donation_projects?: DonationProjectEntity[]

  @ManyToMany(() => FundraiserEntity, (fundraiser) => fundraiser.images)
  fundraisers?: FundraiserEntity[]

  @ManyToMany(() => ReportEntity, (report) => report.images, { cascade: true })
  deal_report?: ReportEntity[]

  @ManyToMany(() => DealEntity, (deal) => deal.images, { cascade: true })
  deals?: DealEntity[]

  @ManyToMany(() => DealRafflePrizeEntity, (dealRaffle) => dealRaffle.images, {
    cascade: true,
  })
  prizes?: DealRafflePrizeEntity[]

  @ManyToMany(() => DealVariantEntity, (dealVariant) => dealVariant.images)
  deal_variants?: DealVariantEntity[]
}
