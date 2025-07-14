import { Entity, ManyToOne, JoinColumn } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { ImagesEntity } from '@app/src/images/entities/images.entity'
import { ContactSellerMessageEntity } from './contact-seller-message.entity'

@Entity('contact_seller_attachments')
export class ContactSellerAttachmentEntity extends MyEntity {
  @ManyToOne(() => ContactSellerMessageEntity, (message) => message.attachments, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  message: ContactSellerMessageEntity

  @ManyToOne(() => ImagesEntity, { nullable: false, eager: true })
  @JoinColumn()
  image: ImagesEntity
}
