import { Module } from '@nestjs/common'
import { TemplateController } from './template.controller'
import { TemplateService } from './template.service'
import { TypeOrmModule } from '@nestjs/typeorm'
import { TemplateEntity } from './entities/template.entity'

@Module({
  imports: [TypeOrmModule.forFeature([TemplateEntity])],
  controllers: [TemplateController],
  providers: [TemplateService],
})
export class TemplateModule {}
