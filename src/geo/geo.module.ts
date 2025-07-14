import { Module } from '@nestjs/common'
import { GeoModule as AdminGeoModule } from '@app/src/admin/geo/geo.module'
import { GeoController } from './geo.controller'

@Module({
  imports: [AdminGeoModule],
  controllers: [GeoController],
})
export class GeoModule {}
