import { MarkFeaturedDto } from '@app/src/images/dto'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { ImagesEntity } from '@app/src/images/entities/images.entity'

export default async function (payload: MarkFeaturedDto): Promise<SuccessRO> {
  const oldImage: ImagesEntity = await this.documentExists({
    condition: [
      {
        where: {
          id: payload.oldFeatured,
          section: payload.type,
          is_featured: true,
        },
      },
    ],
    message: ErrorKey.IMAGE_NOT_FOUND,
  })

  const newsImage: ImagesEntity = await this.documentExists({
    condition: [
      {
        where: {
          id: payload.newFeatured,
          section: payload.type,
          is_featured: false,
        },
      },
    ],
    message: ErrorKey.IMAGE_NOT_FOUND,
  })

  await this.updateOne({
    ...oldImage,
    is_featured: false,
  })

  await this.updateOne({
    ...newsImage,
    is_featured: true,
  })

  return {
    message: 'Image has been marked as featured',
    success: true,
  }
}
