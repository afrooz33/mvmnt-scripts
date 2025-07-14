import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey, Query } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { GuideLevel, GuideStatus } from '@app/src/admin/guides/enums'

export default async function showArticleService(
  guideId: string,
  articleId: string,
  language: string,
): Promise<SuccessRO> {
  try {
    const article = await this.documentExists({
      condition: [
        {
          where: {
            id: articleId,
            level: GuideLevel.ARTICLE,
            status: GuideStatus.ENABLED,
            parent: {
              id: guideId,
              level: GuideLevel.MIDDLE,
              status: GuideStatus.ENABLED,
            },
          },
          relations: [Query.TRANSLATIONS, Query.TRANSLATIONS_LANGUAGE],
        },
      ],
      errorMessage: ErrorKey.RESOURCE_NOT_FOUND,
    })

    const matchingTranslation = article.translations.find(
      (translation) => translation.language.code === language,
    )

    return {
      success: true,
      data: {
        ...article,
        name: matchingTranslation ? matchingTranslation.name : article.name,
        description: matchingTranslation ? matchingTranslation.description : article.description,
        translations: undefined,
      },
      message: '',
    }
  } catch (error) {
    return HandleErrors(error)
  }
}
