import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  HttpException,
  HttpStatus,
} from '@nestjs/common'

import { validate } from 'class-validator'
import { plainToInstance } from 'class-transformer'

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, metadata: ArgumentMetadata) {
    if (value instanceof Object && this.isEmpty(value)) {
      throw new HttpException('Validation failed: No Body submitted', HttpStatus.BAD_REQUEST)
    }

    const { metatype } = metadata

    if (!metatype || !this.toValidateMetatype(metatype)) {
      return value
    }

    return await this.toValidateData(metatype, value)
  }

  public async toValidateData(metatype: any, value: any) {
    const object = plainToInstance(metatype, value)

    const errors = await validate(object)

    if (errors.length > 0) {
      throw new HttpException(
        `Validation failed: ${ValidationPipe.formatErrors(errors)}`,
        HttpStatus.BAD_REQUEST,
      )
    }

    return value
  }

  private toValidateMetatype(metatype): boolean {
    return ![String, Boolean, Number, Array, Object].includes(metatype)
  }

  static getChildErrors(
    parent: any,
    prop: string = parent.property,
    length: number = parent.children.length,
  ) {
    const constraints: string[] = []

    if (parent.children?.length > 0) {
      constraints.push(
        ...parent.children.map((child) =>
          ValidationPipe.getChildErrors(child, `${prop}.${child.property}`, parent.children.length),
        ),
      )
    }

    for (const property in parent.constraints) {
      constraints.push(
        length ? `${prop} -> ${parent.constraints[property]}` : parent.constraints[property],
      )
    }

    return constraints
  }

  static formatErrors(errors: any) {
    return errors.map(ValidationPipe.getChildErrors).join().split(',').join(', ')
  }

  private isEmpty(value: any) {
    return !Boolean(Object.keys(value).length)
  }
}
