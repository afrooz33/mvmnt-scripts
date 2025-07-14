import { Column, Entity, JoinColumn, JoinTable, ManyToOne, OneToMany, OneToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { ImagesEntity } from '@app/src/images/entities/images.entity'
import { AddressEntity } from '@app/src/users/address/entities/address.entity'
import { LanguageEntity } from '@app/src/admin/languages/entities/language.entity'
import { VerificationStatus, IdentityVerificationStatus } from '@app/src/users/profile/enums'
import { toResponseObject } from './methods'
import { SocialAccounts } from './properties'

@Entity('user_profiles')
export class ProfileEntity extends MyEntity {
  @Column('text', { nullable: true })
  introduction: string

  @Column('jsonb', { nullable: true, default: null })
  social_accounts: SocialAccounts

  @OneToOne(() => UserEntity, (user) => user.profile, {
    cascade: true,
  })
  @JoinColumn()
  user: UserEntity

  @OneToOne(() => ImagesEntity, { cascade: true })
  @JoinColumn()
  profile_images: ImagesEntity

  @ManyToOne(() => LanguageEntity, { cascade: true })
  @JoinColumn()
  language: LanguageEntity

  @Column('enum', {
    enum: Object.values(VerificationStatus),
    default: VerificationStatus.REVIEW,
    nullable: false,
  })
  verification_status: VerificationStatus

  @OneToMany(() => AddressEntity, (address) => address.profile, {
    cascade: true,
  })
  @JoinTable()
  addresses?: AddressEntity[]

  @Column('text', { nullable: true })
  admin_memo?: string

  @Column('enum', {
    enum: Object.values(IdentityVerificationStatus),
    default: IdentityVerificationStatus.NOT_SUBMITTED,
    nullable: false,
  })
  identity_verification_status: IdentityVerificationStatus

  public toResponseObject = toResponseObject.bind(this)
}
