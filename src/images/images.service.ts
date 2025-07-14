import { Injectable, Logger } from '@nestjs/common'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { MyService } from '@app/src/shared/base'
import { getImagesService, removeService, uploadService, markFeaturedService } from './services'
import { ImagesEntity } from './entities/images.entity'

@Injectable()
export class ImagesService extends MyService<ImagesEntity> {
  private logger: Logger = new Logger('imagesService')

  constructor(
    @InjectRepository(ImagesEntity)
    private readonly imagesRepository: Repository<ImagesEntity>,
    private readonly configService: ConfigService,
  ) {
    super(imagesRepository, 'images')
  }

  upload = uploadService.bind(this)
  remove = removeService.bind(this)
  getImages = getImagesService.bind(this)
  markFeatured = markFeaturedService.bind(this)
}
