import { Column, Entity, JoinColumn, ManyToOne, OneToOne } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { ImagesEntity } from '@app/src/images/entities/images.entity'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { IdentityDocumentType, VerificationStatus } from '@app/src/users/profile/enums'
import { ProfileNames } from './properties'

@Entity('user_identity_documents')
export class UserIdentityDocumentsEntity extends MyEntity {
  @Column('jsonb', { nullable: true, default: null })
  name: ProfileNames

  @Column('date', { nullable: true })
  birthday: Date

  @Column('enum', {
    enum: Object.values(IdentityDocumentType),
    default: IdentityDocumentType.DRIVING_LICENSE,
    nullable: false,
  })
  readonly type: IdentityDocumentType

  @OneToOne(() => ImagesEntity, { cascade: true })
  @JoinColumn()
  readonly front_image: ImagesEntity

  @OneToOne(() => ImagesEntity, { cascade: true })
  @JoinColumn()
  readonly back_image: ImagesEntity

  @ManyToOne(() => UserEntity, (user) => user.identity_documents)
  @JoinColumn()
  readonly user: UserEntity

  @Column('enum', {
    enum: Object.values(VerificationStatus),
    default: VerificationStatus.REVIEW,
    nullable: false,
  })
  status: VerificationStatus
}
