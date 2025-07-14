import { documentExistsMethod } from '@app/src/shared/entities/methods'
import { PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BaseEntity } from 'typeorm'

export class MyEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @CreateDateColumn()
  created: Date

  @UpdateDateColumn()
  updated: Date

  public static documentExists = documentExistsMethod

  public toResponseObject() {
    return this
  }
}
