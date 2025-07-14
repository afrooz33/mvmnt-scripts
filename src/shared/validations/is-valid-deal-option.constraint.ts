import { In } from 'typeorm'
import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import { DealOptionService } from '@app/src/users/deal/deal-option.service'

@ValidatorConstraint({ async: true })
export class IsValidDealOptionConstraint implements ValidatorConstraintInterface {
  constructor(private readonly dealOptionService: DealOptionService) {}

  validate(options: any): Promise<boolean> {
    if (!options || !options.length) {
      return Promise.resolve(true)
    }

    const selectedOption = options.map((option) => option.id)

    return this.dealOptionService
      .findMany({
        where: {
          id: In(selectedOption),
        },
        select: ['id'],
      })
      .then((options) => {
        if (options.length && options.length === selectedOption.length) {
          return true
        }

        return false
      })
  }
}
