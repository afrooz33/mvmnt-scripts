import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import { Status } from '@app/src/shared/enums'
import { BrandsService } from '@app/src/admin/brands/brands.service'

@ValidatorConstraint({ async: true })
export class IsBrandAvailableConstraint implements ValidatorConstraintInterface {
  constructor(private readonly brandService: BrandsService) {}

  validate(id: string) {
    return this.brandService
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
