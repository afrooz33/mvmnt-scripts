import { Repository } from 'typeorm'
import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { MyService } from '@app/src/shared/base'
import { UserService } from '@app/src/users/user/user.service'
import { ImagesService } from '@app/src/images/images.service'
import { FollowerEntity } from '@app/src/users/follower/entities/follower.entity'
import { AssetsService } from './assets.service'
import { ActivityReportEntity } from './entities/activity-report.entity'
import { ActivityReportCommentEntity } from './entities/activity-report-comment.entity'
import { ActivityReportBookmarkEntity } from './entities/activity-report-bookmark.entity'
import {
  showService,
  createService,
  updateService,
  deleteService,
  followService,
  showOneService,
  showPublicService,
  addBookmarkService,
  showCommentService,
  showFollowerService,
  showFollowingService,
  createCommentService,
  removeBookmarkService,
} from './services'

@Injectable()
export class ActivityReportsService extends MyService<ActivityReportEntity> {
  constructor(
    @InjectRepository(ActivityReportEntity)
    private readonly activityReportsRepository: Repository<ActivityReportEntity>,
    @InjectRepository(ActivityReportCommentEntity)
    private readonly activityReportCommentsRepository: Repository<ActivityReportCommentEntity>,
    @InjectRepository(ActivityReportBookmarkEntity)
    private readonly activityReportBookmarksRepository: Repository<ActivityReportBookmarkEntity>,
    @InjectRepository(FollowerEntity)
    private readonly followersRepository: Repository<FollowerEntity>,
    private readonly userService: UserService,
    private readonly imagesService: ImagesService,
    private readonly assetsService: AssetsService,
  ) {
    super(activityReportsRepository, 'nonprofit-user/activity-reports')
  }

  /**
   * Helper function to extract @mentions from comment content.
   */
  private extractMentions(comment: string): string[] {
    let match

    const mentions = []
    const mentionRegex = /@([a-zA-Z0-9._-]+)/g

    while ((match = mentionRegex.exec(comment)) !== null) {
      mentions.push(match[1])
    }

    return mentions
  }

  show = showService.bind(this)
  follow = followService.bind(this)
  create = createService.bind(this)
  update = updateService.bind(this)
  delete = deleteService.bind(this)
  showOne = showOneService.bind(this)

  showComment = showCommentService.bind(this)
  createComment = createCommentService.bind(this)

  showFollower = showFollowerService.bind(this)
  showFollowing = showFollowingService.bind(this)

  showPublic = showPublicService.bind(this)

  addBookmark = addBookmarkService.bind(this)
  removeBookmark = removeBookmarkService.bind(this)
}
