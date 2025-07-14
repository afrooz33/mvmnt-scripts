import { In } from 'typeorm'
import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import { DealOptionService } from '@app/src/users/deal/deal-option.service'

@ValidatorConstraint({ async: true })
export class IsValidDealOptionColorValueConstraint implements ValidatorConstraintInterface {
  constructor(private readonly dealOptionService: DealOptionService) {}

  isValidHexColor(hex) {
    const hexRegex = /^#(?:[0-9a-fA-F]{3}){1,2}$/

    return hexRegex.test(hex)
  }

  async areAllValidHexColors(array): Promise<boolean> {
    for (const hex of array) {
      if (!this.isValidHexColor(hex)) {
        return false
      }
    }

    return true
  }

  async validate(options: any) {
    if (!options || !options.length) {
      return true
    }

    const selectedOption = [...new Set(options.map((obj) => obj.options))]

    const validOptions = await this.dealOptionService.findMany({
      where: {
        id: In(selectedOption),
      },
      select: ['id'],
    })

    if (validOptions.length && validOptions.length !== selectedOption.length) {
      return false
    }

    const colorOption = await this.dealOptionService.findOne({
      where: {
        type: 'COLOR',
      },
    })

    const filteredColor = options.filter((obj) => obj.options === colorOption.id)

    const colors = filteredColor.map((obj) => obj.value)

    if (colors.length && !(await this.areAllValidHexColors(colors))) {
      return false
    }

    return true
  }

  defaultMessage(): string {
    return 'Invalid detail for variants option_values.'
  }
}
