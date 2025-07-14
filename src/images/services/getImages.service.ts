import { ImagesEntity } from '@app/src/images/entities/images.entity'
import { ErrorKey } from '@app/src/shared/enums'

export default async function (ids: string[]): Promise<ImagesEntity[]> {
  const images: ImagesEntity[] = await Promise.all(
    ids.map(async (id) => {
      return await this.documentExists({
        condition: [
          {
            where: {
              id,
            },
          },
        ],
        errorMessage: JSON.stringify({
          key: ErrorKey.IMAGE_NOT_FOUND,
          args: { id },
        }),
      })
    }),
  )

  return images
}
