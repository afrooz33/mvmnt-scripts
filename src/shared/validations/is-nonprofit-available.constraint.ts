import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import { In } from 'typeorm'
import { Status } from '@app/src/shared/enums'
import { NonprofitUserService } from '@app/src/nonprofit/user/nonprofit-user.service'

@ValidatorConstraint({ async: true })
export class IsNonprofitUserAvailableConstraint implements ValidatorConstraintInterface {
  constructor(private readonly nonprofileUserService: NonprofitUserService) {}

  async validate(resourceId: any) {
    let total = 1

    if (resourceId instanceof Array) {
      total = [...new Set(resourceId)].length
    }

    const resource = await this.nonprofileUserService.findMany({
      where: {
        id: In(resourceId instanceof Array ? [...new Set(resourceId)] : [resourceId]),
        account_status: Status.ACTIVE,
      },
      select: ['id'],
    })

    return resource.length && resource.length === total
  }
}
