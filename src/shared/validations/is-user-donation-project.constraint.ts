import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import { In } from 'typeorm'
import { ExtendedValidationArguments } from '@app/src/shared/validations'
import { DonationProjectsService } from '@app/src/nonprofit/donation-projects/donation-projects.service'
import { DonationProjectEntity } from '@app/src/nonprofit/donation-projects/entities/donation-project.entity'
import {
  DonationProjectReviewStatus,
  DonationProjectStatus,
} from '@app/src/nonprofit/donation-projects/enums'
import { REQUEST_CONTEXT } from '@app/src/shared/interceptors'

@ValidatorConstraint({ async: true })
export class IsUserDonationProjectConstraint implements ValidatorConstraintInterface {
  constructor(private readonly donationProjectService: DonationProjectsService) {}

  async validate(id: any, args?: ExtendedValidationArguments) {
    const user = args?.object[REQUEST_CONTEXT]
    let total = 1

    if (id instanceof Array) {
      total = id.length
    }

    const conditions = {
      id: In(id instanceof Array ? id : [id]),
      review_status: DonationProjectReviewStatus.APPROVED,
      status: In([
        DonationProjectStatus.PUBLISHED,
        DonationProjectStatus.ENDED,
        DonationProjectStatus.TO_BE_CANCELLED,
      ]),
    }

    if (user) {
      conditions['user'] = {
        id: user,
      }
    }

    const donationProject: DonationProjectEntity[] = await this.donationProjectService.findMany({
      where: conditions,
      select: ['id'],
    })

    return donationProject.length && donationProject.length === total
  }

  defaultMessage(): string {
    return 'You cannot perform this action'
  }
}
