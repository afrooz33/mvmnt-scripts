import { Repository } from 'typeorm'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { OAuth2Client } from 'google-auth-library'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { BadRequestException, Injectable } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { SocialLoginDto } from '@app/src/users/auth/dto'
import { AccountStatus } from '@app/src/users/user/enums'
import { UserService } from '@app/src/users/user/user.service'
import { SocialLoginProvider } from '@app/src/users/auth/enums'
import { SettingName } from '@app/src/admin/region-settings/enums'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { RegionSettingsService } from '@app/src/admin/region-settings/region_settings.service'

@Injectable()
export class UserSocialLogin {
  private GoogleClientId: string
  private expiresIn: string

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly configService: ConfigService,
    private readonly regionSettingsService: RegionSettingsService,
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly eventEmitter: EventEmitter2,
  ) {
    this.GoogleClientId = this.configService.getOrThrow('auth.google.clientId')
    this.expiresIn = this.configService.getOrThrow('auth.jwt.access.expiresIn')
  }

  async getSocialData(payload: SocialLoginDto): Promise<{ identifier: string }> {
    switch (payload.provider) {
      case SocialLoginProvider.GOOGLE:
        return await this.getGoogleData(payload.token)
      default:
        return { identifier: payload.email }
    }
  }

  async addSocialLogin(userId: string, payload: SocialLoginDto): Promise<SuccessRO> {
    //  1: Decode data from Social website token
    const socialData = await this.getSocialData(payload)

    //  2: Get user information
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.profile', 'profile')
      .select(['user.id', 'profile.id', 'profile.social_accounts'])
      .where('user.id = :userId', { userId })
      .getOne()

    user.profile.social_accounts[payload.provider] = socialData.identifier

    await user.profile.save()

    // ToDo: Update profile link if available

    return {
      success: true,
      message: 'Social Login added',
      data: payload,
    }
  }

  async removeSocialLogin(userId: string, provider: SocialLoginProvider): Promise<SuccessRO> {
    const user = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.profile', 'profile')
      .select(['user.id', 'profile.id', 'profile.social_accounts'])
      .where('user.id = :userId', { userId })
      .getOne()

    if (!user.profile.social_accounts[provider]) {
      throw new BadRequestException(ErrorKey.SOCIAL_LOGIN_NOT_FOUND)
    }

    delete user.profile.social_accounts[provider]

    await user.profile.save()

    return { success: true, message: 'Social Login removed' }
  }

  async loginSocial(payload: SocialLoginDto, xGuestCartId: string) {
    //  1: Decode payload data
    const socialData = await this.getSocialData(payload)

    //  2: Check if login is enabled in this region
    const region_settings = await this.regionSettingsService.find()

    if (!region_settings[SettingName.LOGIN_ENABLED]) {
      throw new BadRequestException(ErrorKey.LOGIN_DISABLED)
    }

    //  3: Find user with the email from ID token
    const user: UserEntity = await this.userRepository
      .createQueryBuilder('user')
      .leftJoin('user.profile', 'profile')
      .where(`"profile"."social_accounts"->>'${payload.provider}' = :identifier`, {
        identifier: socialData.identifier,
      })
      .andWhere(`"user"."account_status" != :status`, {
        status: AccountStatus.DELETED,
      })
      .select([
        'user.id',
        'user.email',
        'user.username',
        'user.password',
        'user.account_type',
        'user.account_status',
        'user.two_factor_authentication',
      ])
      .getOne()

    try {
      if (!user) {
        throw new BadRequestException(ErrorKey.USER_NOT_FOUND)
      }

      if (user.two_factor_authentication.enabled) {
        return user.toResponseObject()
      }

      const response = await this.getAccessToken(user)

      //  4: Update last login for User
      await this.userService.updateOne(
        {
          ...user,
          last_login: new Date(),
        },
        null,
        false,
      )

      //  5: Create Login Activity for User
      await this.userService.logLoginActivity(user)

      //  6: Emit event for merge cart
      this.eventEmitter.emit('user.merge.cart', { user, xGuestCartId })

      return response
    } catch (err) {
      return HandleErrors(err)
    }
  }

  private async getAccessToken(user: UserEntity) {
    const token: string = this.jwtService.sign(
      {
        id: user.id,
        email: user.email,
        account_type: user.account_type,
        two_factor_authentication: user.two_factor_authentication.enabled,
      },
      {
        expiresIn: this.expiresIn,
      },
    )

    return user.toResponseObject({
      type: 'bearer',
      token,
    })
  }

  async getGoogleData(token: string): Promise<{ identifier: string }> {
    const client = new OAuth2Client()
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: this.GoogleClientId,
      })
      const payload = ticket.getPayload()

      return {
        identifier: payload.email,
      }
    } catch (err) {
      console.error('Error validating Google Token', err)
      throw err
    }
  }
}
