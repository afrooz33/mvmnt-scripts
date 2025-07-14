import { Injectable } from '@nestjs/common'
import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from 'class-validator'
import { DealType, DonationType } from '@app/src/users/deal/enums'

@Injectable()
@ValidatorConstraint({ name: 'isValidDonationType', async: false })
export class IsValidDonationTypeConstraint implements ValidatorConstraintInterface {
  validate(value: any, args: ValidationArguments) {
    const dealType = (args.object as any).deal_type

    switch (dealType) {
      case DealType.AUCTION:
        return (
          value === DonationType.FIXED_PER_ORDER ||
          value === DonationType.PERCENTAGE_PER_ORDER ||
          value === DonationType.WINNING_BID_ROUND_UP
        )
      case DealType.RAFFLE:
        return value === DonationType.FIXED_PER_ENTRY || value === DonationType.PERCENTAGE_PER_ORDER
      case DealType.BUYNOW:
        return (
          value === DonationType.FIXED_PER_ITEM ||
          value === DonationType.FIXED_PER_ORDER ||
          value === DonationType.FIXED_PERCENTAGE_PER_ITEM ||
          value === DonationType.PERCENTAGE_PER_ORDER ||
          value === DonationType.ROUND_UP_SUB_TOTAL ||
          value === DonationType.MONHTLY_RECURRING
        )
      default:
        return false
    }
  }

  defaultMessage(args: ValidationArguments) {
    const { value, object } = args
    const dealType = (object as any).deal_type

    return `The donation type ${value} is not valid for the deal type ${dealType}.`
  }
}
