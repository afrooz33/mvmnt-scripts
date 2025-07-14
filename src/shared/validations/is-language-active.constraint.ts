import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import { In } from 'typeorm'
import { LanguagesService } from '@app/src/admin/languages/languages.service'
import { LanguageStatus } from '@app/src/admin/languages/enums'

@ValidatorConstraint({ async: true })
export class IsLanguageActiveConstraint implements ValidatorConstraintInterface {
  constructor(private readonly languagesService: LanguagesService) {}

  validate(translations: any) {
    if (!translations) {
      return true
    }

    const languages = translations.map((translation) => translation.language)

    return this.languagesService
      .findMany({
        where: {
          id: In(languages),
          status: LanguageStatus.ACTIVE,
        },
        select: ['id'],
      })
      .then((languages) => {
        if (languages.length && languages.length === translations.length) {
          return true
        }

        return false
      })
  }
}
