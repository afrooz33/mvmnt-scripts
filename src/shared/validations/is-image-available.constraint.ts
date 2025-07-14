import { ValidatorConstraint, ValidatorConstraintInterface } from 'class-validator'
import { In } from 'typeorm'
import { ImagesService } from '@app/src/images/images.service'

@ValidatorConstraint({ async: true })
export class IsImageAvailableConstraint implements ValidatorConstraintInterface {
  constructor(private readonly imageService: ImagesService) {}

  async validate(imageId: any, args: any) {
    const [section] = args.constraints
    let total = 1

    if (imageId instanceof Array) {
      total = [...new Set(imageId)].length
    }

    const images = await this.imageService.findMany({
      where: {
        id: In(imageId instanceof Array ? [...new Set(imageId)] : [imageId]),
        section,
      },
      select: ['id'],
    })

    return images.length && images.length === total
  }
}
