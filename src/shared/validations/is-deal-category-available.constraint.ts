import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import { Status } from '@app/src/shared/enums'
import { DealCategoryService } from '@app/src/users/deal/category/category.service'

@ValidatorConstraint({ async: true })
export class IsDealCategoryAvailableConstraint implements ValidatorConstraintInterface {
  constructor(private readonly dealCategoryService: DealCategoryService) {}

  validate(id: string) {
    return this.dealCategoryService
      .findOne({
        where: {
          id,
          status: Status.ENABLED,
        },
        select: ['id'],
      })
      .then((resource) => {
        return resource ? true : false
      })
  }
}
