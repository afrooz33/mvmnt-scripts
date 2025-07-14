import { Injectable } from '@nestjs/common'
import { EntityManager, Repository } from 'typeorm'
import { InjectRepository } from '@nestjs/typeorm'
import { ErrorKey } from '@app/src/shared/enums'
import { AccountStatus } from '@app/src/users/user/enums'
import { DealService } from '@app/src/users/deal/deal.service'
import { UserService } from '@app/src/users/user/user.service'
import { InvitationEntity } from '@app/src/users/invitation/entities/invitation.entity'
import { UserGrade } from './enums'

@Injectable()
export class GradesService {
  constructor(
    private readonly entityManager: EntityManager,
    @InjectRepository(InvitationEntity)
    public readonly invitationRepository: Repository<InvitationEntity>,
    private readonly dealService: DealService,
    private readonly userService: UserService,
  ) {}

  async updateGrades() {
    await this.entityManager.query(
      `BEGIN;

      CREATE TEMP TABLE temp_ranked_users AS
      WITH user_totals AS (
      SELECT
        us."userId", SUM(us.stars) AS stars
      FROM
        user_stars us
      WHERE
        us.created >= DATE_TRUNC('month', CURRENT_DATE) - interval '3 months'
        AND
        us.created < DATE_TRUNC('month', CURRENT_DATE)
      GROUP BY us."userId"
      ),
      ranked_users as (
      SELECT
        "userId" as user_id,
        stars,
        PERCENT_RANK() OVER (ORDER BY stars DESC) AS percentile,
        CASE
          WHEN PERCENT_RANK() over (
          order by stars desc) <= 0.05 then 'Legend'
          WHEN PERCENT_RANK() over (
          order by stars desc) <= 0.10 then 'Leader III'
          WHEN PERCENT_RANK() over (
          order by stars desc) <= 0.20 then 'Leader II'
          WHEN PERCENT_RANK() over (
          order by stars desc) <= 0.30 then 'Leader I'
          WHEN PERCENT_RANK() over (
          order by stars desc) <= 0.40 then 'Ambassador III'
          WHEN PERCENT_RANK() over (
          order by stars desc) <= 0.50 then 'Ambassador II'
          WHEN PERCENT_RANK() over (
          order by stars desc) <= 0.60 then 'Ambassador I'
          WHEN PERCENT_RANK() over (
          order by stars desc) <= 0.70 then 'Contributor III'
          WHEN PERCENT_RANK() over (
          order by stars desc) <= 0.80 then 'Contributor II'
          ELSE 'Contributor I'
        END as grade
      FROM
        user_totals
      )
      SELECT * FROM ranked_users;


      INSERT
        INTO
        user_grade_history ("userId", stars, grade, percentile, created, updated)
      select
        user_id, stars, grade::user_grade_history_grade_enum, percentile, NOW() as updated, NOW() as created
      from
        temp_ranked_users;

      UPDATE users
      SET grade = ru.grade::users_grade_enum
      FROM temp_ranked_users ru
      WHERE users.id = ru.user_id;

      DROP TABLE IF EXISTS temp_ranked_users;

      COMMIT;`,
    )
  }

  calculateGrade = (percentile: number): UserGrade => {
    if (percentile <= 0.05) return UserGrade.Legend
    if (percentile <= 0.1) return UserGrade.LeaderIII
    if (percentile <= 0.2) return UserGrade.LeaderII
    if (percentile <= 0.3) return UserGrade.LeaderI
    if (percentile <= 0.4) return UserGrade.AmbassadorIII
    if (percentile <= 0.5) return UserGrade.AmbassadorII
    if (percentile <= 0.6) return UserGrade.AmbassadorI
    if (percentile <= 0.7) return UserGrade.ContributorIII
    if (percentile <= 0.8) return UserGrade.ContributorII
    else return UserGrade.ContributorI
  }

  //common check if user exists
  private async userExists(user: string): Promise<void> {
    await this.userService.documentExists({
      condition: [
        {
          where: {
            id: user,
            account_status: AccountStatus.ENABLED,
          },
          select: ['id', 'stripe_customer_id', 'email'],
        },
      ],
      errorMessage: JSON.stringify({
        key: ErrorKey.USER_NOT_FOUND,
        args: { id: user },
      }),
    })
  }

  /**
   * @description - check if the user has been invited, if so, get invited user
   * @param user - user id
   * @returns - user id
   */
  private async getInvitedUser(user: string): Promise<any> {
    const invitation = await this.invitationRepository.findOne({
      where: {
        user: {
          id: user,
        },
      },
      select: ['invited_by'],
    })

    return invitation?.invited_by
  }
}
