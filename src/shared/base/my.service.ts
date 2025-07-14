import { DocumentExistsDataInterface, QueryBuilderDataInterface } from '@app/src/shared/interfaces'
import { In, Not, Repository } from 'typeorm'
import { ConflictException, NotFoundException, MethodNotAllowedException } from '@nestjs/common'
import { PaginateRO, SuccessRO } from '@app/src/shared/dto'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { PaginationBuilder } from '@app/src/shared/helpers/Pagination.builder'
import documentExistsService from '@app/src/shared/services/documentExists.service'
import { QueryBuilder } from '@app/src/shared/helpers/Query/Query.builder'
import { IBaseService } from './interfaces/IBase.service'
import { MyEntity } from './my.entity'
import { ErrorKey, Status } from '@app/src/shared/enums'

export class MyService<E extends MyEntity> implements IBaseService<E, PaginateRO> {
  constructor(
    private readonly myRepository: Repository<E>,
    public paginationLinks: string,
    public uniqueKey?: string[],
    public isCustomPagination: boolean = false,
  ) {}

  async documentExists(data: DocumentExistsDataInterface): Promise<E> {
    return await documentExistsService(this.myRepository, data)
  }

  private toResponseObject(myEntity) {
    if (myEntity.hasOwnProperty('toResponseObject')) {
      return myEntity.toResponseObject()
    }

    return myEntity
  }

  toggleCustomPagination() {
    this.isCustomPagination = !this.isCustomPagination

    return this
  }

  getCustomPaginationMeta(total: number, { limit, page }: any) {
    const total_page = Math.ceil(total / limit)

    return {
      limit,
      total_page,
      current_page: page,
      next_page: page < total_page ? `${this.paginationLinks}?page=${page + 1}&limit=${limit}` : '',
      prev_page: page > 1 ? `${this.paginationLinks}?page=${page - 1}&limit=${limit}` : '',
      total_record: total,
    }
  }

  async customPaginate({ condition, pagination }: QueryBuilderDataInterface): Promise<PaginateRO> {
    const total = await condition.getCount()

    if (!total) {
      return {
        data: [],
        meta: this.getCustomPaginationMeta(total, pagination),
      }
    }

    const data = await condition
      .skip((pagination.page - 1) * pagination.limit)
      .take(pagination.limit)
      .getMany()

    return {
      data: data.map(({ toResponseObject }) => toResponseObject()),
      meta: this.getCustomPaginationMeta(total, pagination),
    }
  }

  async paginate(data: QueryBuilderDataInterface): Promise<PaginateRO> {
    return new PaginationBuilder(this.myRepository)
      .setOption({
        ...data.pagination,
        route: this.paginationLinks,
      })
      .setCondition(data.condition)
      .setType(data.isQueryType)
      .create((response) => response.map(this.toResponseObject))
  }

  async rawPaginate(data: QueryBuilderDataInterface): Promise<PaginateRO> {
    return new PaginationBuilder(this.myRepository, true)
      .setOption({
        ...data.pagination,
        route: this.paginationLinks,
      })
      .setCondition(data.condition)
      .setType(data.isQueryType)
      .create()
  }

  async show(query, user = null): Promise<PaginateRO> {
    try {
      const result: QueryBuilderDataInterface = new QueryBuilder(query)
        .addFilter('user', user)
        .useQuery(this.myRepository)
        .create()

      if (this.isCustomPagination) {
        this.toggleCustomPagination()

        return await this.customPaginate(result)
      }

      return await this.paginate(result)
    } catch (error) {
      return HandleErrors(error)
    }
  }

  async findOne(options: any): Promise<E> {
    try {
      return await this.myRepository.findOne(options)
    } catch (error) {
      return HandleErrors(error)
    }
  }

  async updateOne(payload: any, options?: any): Promise<E> {
    if (options) {
      await this.documentExists({
        condition: [
          {
            where: options.where,
            select: ['id'],
          },
        ],
        errorMessage: JSON.stringify({
          key: options.errorKey,
          args: { id: options.id },
        }),
      })
    }

    try {
      const resource: any = await this.myRepository.create(payload)

      return await this.myRepository.save(resource)
    } catch (error) {
      return HandleErrors(error)
    }
  }

  async findMany(options: any): Promise<E[]> {
    try {
      return await this.myRepository.find(options)
    } catch (error) {
      return HandleErrors(error)
    }
  }

  async findBy(condition: [Record<string, unknown>]): Promise<E> {
    return await this.myRepository.findOne(...condition)
  }

  async updateStatus(payload, user = {}, statusField = 'status'): Promise<SuccessRO> {
    try {
      const ids = payload.ids instanceof Array ? payload.ids : [payload]

      await this.myRepository.manager.getRepository(this.myRepository.metadata.name).update(
        {
          id: In(ids),
          ...user,
        },
        {
          [statusField]: payload.status,
        },
      )

      return {
        success: true,
        message: 'Resource status successfully updated',
      }
    } catch (error) {
      return HandleErrors(error)
    }
  }

  async delete(payload, user = {}, statusField = 'status'): Promise<SuccessRO> {
    try {
      const ids = payload.ids instanceof Array ? payload.ids : [payload]

      const exists: E = await this.findOne({
        where: {
          id: In(ids),
          [statusField]: Not(Status.DELETED),
          ...user,
        },
      })

      if (!exists) {
        throw new NotFoundException(
          JSON.stringify({
            key: ErrorKey.RESOURCE_NOT_FOUND,
            args: ids,
          }),
        )
      }

      await this.myRepository.manager.getRepository(this.myRepository.metadata.name).update(
        {
          id: In(ids),
          ...user,
        },
        {
          [statusField]: Status.DELETED,
        },
      )

      return {
        success: true,
        message: 'Multiple resources successfully deleted',
      }
    } catch (error) {
      return HandleErrors(error)
    }
  }

  async create(payload, user = {}): Promise<SuccessRO> {
    try {
      const resource: E = await this.updateOne({
        ...payload,
        ...user,
      })

      return {
        success: true,
        message: 'Resource successfully saved',
        data: resource,
      }
    } catch (error) {
      return HandleErrors(error)
    }
  }

  async reOrder(payload): Promise<SuccessRO> {
    try {
      await Promise.all(
        payload.items.map((item) => {
          return this.myRepository.manager.getRepository(this.myRepository.metadata.name).update(
            {
              id: item.id,
            },
            {
              display_order: item.display_order,
            },
          )
        }),
      )

      return {
        success: true,
        message: 'Resource successfully reordered',
        data: payload,
      }
    } catch (error) {
      return HandleErrors(error)
    }
  }

  async remove(payload, user = {}): Promise<SuccessRO> {
    try {
      await this.myRepository.delete({
        ...payload,
        ...user,
      })

      return {
        success: true,
        message: 'Resource successfully deleted',
      }
    } catch (error) {
      return HandleErrors(error)
    }
  }

  async upsert(payload, condition = {}): Promise<SuccessRO> {
    try {
      const resource = await this.myRepository.upsert(
        {
          ...payload,
          updated: new Date(),
          ...condition,
        },
        {
          skipUpdateIfNoValuesChanged: true,
          conflictPaths: this.uniqueKey,
        },
      )

      return {
        success: true,
        message: 'Resource successfully saved',
        data: resource,
      }
    } catch (error) {
      return HandleErrors(error)
    }
  }

  async showOne(id: string, query = {}, user = null): Promise<E> {
    try {
      const result: QueryBuilderDataInterface = new QueryBuilder(query)
        .addFilter('user', user)
        .addFilter('id', id)
        .useQuery(this.myRepository)
        .create()

      const resource: E = await result.condition.getOne()

      return resource.toResponseObject()
    } catch (error) {
      return HandleErrors(error)
    }
  }

  async updateUnpublished(
    id: string,
    user = null,
    status_value: string = Status.DRAFT,
    status_field = 'status',
  ): Promise<E> {
    try {
      const record: E = await this.findOne({
        where: {
          id,
          user: { id: user },
          status: Status.PUBLISHED,
        },
      })

      if (record) {
        throw new MethodNotAllowedException(ErrorKey.PUBLISHED_STATUS_UPDATE_NOT_ALLOWED)
      }

      return await this.updateOne({
        id,
        [status_field]: status_value,
      })
    } catch (error) {
      return HandleErrors(error)
    }
  }

  async getDisplayOrderCount(condition: any): Promise<number> {
    const count = await this.myRepository.count(condition)

    return count + 1
  }

  async createUnique(payload, user = {}, unique_field = 'name'): Promise<SuccessRO> {
    try {
      const exists: E = await this.findOne({
        where: {
          [unique_field]: payload[unique_field],
          status: Not(Status.DELETED),
          ...user,
        },
      })

      if (exists) {
        throw new ConflictException('duplicate key value violates unique constraint')
      }

      const resource: E = await this.updateOne({
        ...payload,
        ...user,
      })

      return {
        success: true,
        message: 'Resource successfully saved',
        data: resource,
      }
    } catch (error) {
      return HandleErrors(error)
    }
  }

  async updateUnique(id: string, payload: any, unique_field = 'name'): Promise<E> {
    const exists: E = await this.findOne({
      where: {
        id: Not(id),
        [unique_field]: payload[unique_field],
        status: Not(Status.DELETED),
      },
    })

    if (exists) {
      throw new ConflictException('duplicate key value violates unique constraint')
    }

    try {
      const resource: any = await this.myRepository.create(payload)

      return await this.myRepository.save(resource)
    } catch (error) {
      return HandleErrors(error)
    }
  }
}
