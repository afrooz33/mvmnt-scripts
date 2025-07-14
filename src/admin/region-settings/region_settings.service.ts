import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { upsertService } from './services'
import { SettingResponse } from './interfaces'
import { RegionSettingsEntity } from './entities/region_settings.entity'

@Injectable()
export class RegionSettingsService extends MyService<RegionSettingsEntity> {
  constructor(
    @InjectRepository(RegionSettingsEntity)
    private readonly regionSettingsRepository: Repository<RegionSettingsEntity>,
  ) {
    super(regionSettingsRepository, 'admin/region-settings')
  }

  /**
   * Transform response
   * @param {any[]} data
   * @returns {SettingResponse}
   */
  transformResponse(data: any[]): SettingResponse {
    const transformedResponse: SettingResponse = {}

    data.forEach((item) => (transformedResponse[item.name] = item.value?.value))

    return transformedResponse
  }

  /**
   * Find all region settings
   * @returns {Promise<SettingResponse>}
   */
  find = async (): Promise<SettingResponse> => {
    const regionSettings = await this.regionSettingsRepository.find()

    return this.transformResponse(regionSettings)
  }

  upsert = upsertService.bind(this)
}
