import { HttpErrorDto } from '@app/src/shared/dto'
import { ResponseObject } from '@app/src/shared/swagger/interfaces/ResponseObject.interface'

export default function (description = ''): ResponseObject {
  return {
    description,
    type: HttpErrorDto,
  }
}
