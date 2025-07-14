import { Module } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ImagesService } from '@app/src/images/images.service'
import { ImagesController } from '@app/src/images/images.controller'
import { ImagesEntity } from '@app/src/images/entities/images.entity'

@Module({
  imports: [TypeOrmModule.forFeature([ImagesEntity])],
  controllers: [ImagesController],
  providers: [ImagesService, ConfigService],
  exports: [ImagesService],
})
export class ImagesModule {}
