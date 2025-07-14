import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { TaskSchedulerEntity } from './entities/task-scheduler.entity'

@Injectable()
export class TaskSchedulerService extends MyService<TaskSchedulerEntity> {
  constructor(
    @InjectRepository(TaskSchedulerEntity)
    private readonly taskSchedulerRepository: Repository<TaskSchedulerEntity>,
  ) {
    super(taskSchedulerRepository, 'tasks')
  }
}
