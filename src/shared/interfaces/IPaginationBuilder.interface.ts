import { IPaginationOptions } from 'nestjs-typeorm-paginate'
import { PaginateRO } from '@app/src/shared/dto'

export default interface IPaginationBuilder {
  setOption(options: IPaginationOptions, isRaw: boolean): IPaginationBuilder
  setCondition(condition: any): IPaginationBuilder
  setType(isQueryType: boolean): IPaginationBuilder
  create(cb?: any): Promise<PaginateRO>
}
