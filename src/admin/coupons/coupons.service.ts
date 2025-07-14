import { Queue } from 'bullmq'
import { Injectable } from '@nestjs/common'
import { InjectQueue } from '@nestjs/bullmq'
import { InjectRepository } from '@nestjs/typeorm'
import { EntityManager, Repository } from 'typeorm'
import { MyService } from '@app/src/shared/base'
import { BullMqQuery } from '@app/src/shared/constant'
import { TaskSchedulerService } from '@app/src/task-scheduler/task-scheduler.service'
import { CouponsEntity } from './entities/coupons.entity'
import { DealCategoryEntity } from '@app/src/admin/deals/category/entities/deal-category.entity'
import { showService, createService, updateCouponService, listCategoryService } from './services'

@Injectable()
export class CouponsService extends MyService<CouponsEntity> {
  constructor(
    @InjectRepository(CouponsEntity)
    private couponsRepository: Repository<CouponsEntity>,
    @InjectRepository(DealCategoryEntity)
    private dealCategoryRepository: Repository<DealCategoryEntity>,
    @InjectQueue(BullMqQuery.ADMIN_COUPONS_QUEUE)
    private readonly couponsQueue: Queue,
    private readonly taskSchedulerService: TaskSchedulerService,
    private readonly entityManager: EntityManager,
  ) {
    super(couponsRepository, 'admin/coupons')
  }

  show = showService.bind(this)
  create = createService.bind(this)
  updateCoupon = updateCouponService.bind(this)
  listCategory = listCategoryService.bind(this)
}
