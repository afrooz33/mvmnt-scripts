import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TaskSchedulerEntity } from './entities/task-scheduler.entity'
import { TaskSchedulerService } from './task-scheduler.service'

@Module({
  imports: [TypeOrmModule.forFeature([TaskSchedulerEntity])],
  providers: [TaskSchedulerService],
  exports: [TaskSchedulerService],
})
export class TaskSchedulerModule {}
