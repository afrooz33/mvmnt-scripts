import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import { In } from 'typeorm'
import { Status } from '@app/src/shared/enums'
import { DonationProjectsService } from '@app/src/nonprofit/donation-projects/donation-projects.service'

@ValidatorConstraint({ async: true })
export class IsDonationProjectAvailableConstraint implements ValidatorConstraintInterface {
  constructor(private readonly donationProjectServier: DonationProjectsService) {}

  async validate(resourceId: any) {
    let total = 1

    if (resourceId instanceof Array) {
      total = [...new Set(resourceId)].length
    }

    const resource = await this.donationProjectServier.findMany({
      where: {
        id: In(resourceId instanceof Array ? [...new Set(resourceId)] : [resourceId]),
        status: Status.PUBLISHED,
      },
      select: ['id'],
    })

    return resource.length && resource.length === total
  }
}
