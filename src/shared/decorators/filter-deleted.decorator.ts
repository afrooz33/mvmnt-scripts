import { Status } from '@app/src/shared/enums'
import { PipeTransform } from '@nestjs/common'

/**
 * Objectives:
 * - Filter all the deleted records by default
 * - Allow the query to be used for other purposes
 *
 * If the query has a filter and the filter has a status
 * then return the query as is.
 *
 * This is to allow the query to be used for other purposes
 * like ignore all the deleted records.
 *
 * Explanation of query object created by this function:
 * {
 *   filter: {
 *     status: {
 *       value: Status.DELETED,
 *       deny: true,
 *     }
 *   }
 * }
 *
 * status is the field to filter
 * value is the value to filter
 * deny is to allow or deny the value (= or != condition)
 *
 */
export class FilterDeletedDecorator implements PipeTransform {
  constructor(
    private readonly field: string = 'status',
    private readonly value: Status = Status.DELETED,
  ) {}

  transform(query: any) {
    if (query?.filter?.status) {
      return query
    }

    query.filter = {
      ...query.filter,
      [this.field]: {
        value: this.value,
        deny: true,
      },
    }

    return query
  }
}
