import { TagEntity } from '@app/src/admin/tags/entities/tag.entity'
import { ErrorKey } from '@app/src/shared/enums'

export default async function (ids: string[]): Promise<TagEntity[]> {
  const tags: TagEntity[] = await Promise.all(
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
          key: ErrorKey.TAG_NOT_FOUND,
          args: { id },
        }),
      })
    }),
  )

  return tags
}
