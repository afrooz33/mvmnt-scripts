import { Column } from 'typeorm'
import { FacebookProfile, GoogleProfile, InstagramProfile, TwitterProfile } from './'

export class SocialAccounts {
  @Column({
    type: 'jsonb',
    nullable: true,
  })
  facebook?: FacebookProfile

  @Column({
    type: 'text',
    nullable: true,
  })
  twitter?: TwitterProfile

  @Column({
    type: 'jsonb',
    nullable: true,
  })
  google?: GoogleProfile

  @Column({
    type: 'text',
    nullable: true,
  })
  instagram?: InstagramProfile

  @Column({
    type: 'text',
    nullable: true,
  })
  blog?: string
}
