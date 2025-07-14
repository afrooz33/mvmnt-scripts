import { In } from 'typeorm'
import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import { REQUEST_CONTEXT } from '@app/src/shared/interceptors'
import { ExtendedValidationArguments } from '@app/src/shared/validations'
import { DealStatus } from '@app/src/users/deal/enums'
import { DealService } from '@app/src/users/deal/deal.service'
import { DealEntity } from '@app/src/users/deal/entities/deal.entity'

@ValidatorConstraint({ async: true })
export class IsUserDealConstraint implements ValidatorConstraintInterface {
  constructor(private readonly dealService: DealService) {}

  async validate(id: string, args?: ExtendedValidationArguments) {
    const user = args?.object[REQUEST_CONTEXT]
    const conditions = {
      id,
      status: In([DealStatus.ON_DEAL, DealStatus.ENDED]),
    }

    if (user) {
      conditions['user'] = {
        id: user,
      }
    }

    const deal: DealEntity = await this.dealService.findOne({
      where: conditions,
    })

    return deal ? false : true
  }

  defaultMessage(): string {
    return 'You cannot perform this action'
  }
}
