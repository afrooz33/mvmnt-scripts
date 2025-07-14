import { Entity, Column, ManyToOne, OneToMany, JoinColumn, CreateDateColumn } from 'typeorm'
import { MyEntity } from '@app/src/shared/base'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { ContactSellerRequestEntity } from './contact-seller-request.entity'
import { ContactSellerAttachmentEntity } from './contact-seller-attachment.entity'

@Entity('contact_seller_messages')
export class ContactSellerMessageEntity extends MyEntity {
  @ManyToOne(() => ContactSellerRequestEntity, (request) => request.messages, {
    nullable: false,
    onDelete: 'CASCADE',
  })
  @JoinColumn()
  request: ContactSellerRequestEntity

  @ManyToOne(() => UserEntity, { nullable: false })
  @JoinColumn()
  sender: UserEntity

  @Column({ type: 'text', nullable: false })
  message: string

  @OneToMany(() => ContactSellerAttachmentEntity, (attachment) => attachment.message, {
    cascade: true,
    eager: true,
  })
  attachments: ContactSellerAttachmentEntity[]

  @CreateDateColumn()
  sent_at: Date
}
