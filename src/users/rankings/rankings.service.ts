import { Injectable } from '@nestjs/common'
import { StarsService } from '@app/src/users/stars/stars.service'
import {
  starRankingService,
  profileStatsService,
  starEarningHistoryService,
  userStarPercentileRankingService,
} from './services'

@Injectable()
export class RankingsService {
  constructor(private readonly starsService: StarsService) {}

  starRanking = starRankingService.bind(this)
  profileStats = profileStatsService.bind(this)
  starEarningHistory = starEarningHistoryService.bind(this)
  userStarPercentileRanking = userStarPercentileRankingService.bind(this)
}
