import * as bcrypt from 'bcrypt'
import { Request, Response } from 'express'
import { JwtService } from '@nestjs/jwt'
import { createClient } from 'node-zendesk'
import { ConfigService } from '@nestjs/config'
import { InjectRepository } from '@nestjs/typeorm'
import { EventEmitter2 } from '@nestjs/event-emitter'
import { EntityManager, In, Raw, Repository } from 'typeorm'
import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common'
import { SuccessRO } from '@app/src/shared/dto'
import { ErrorKey } from '@app/src/shared/enums'
import { GenerateReferralCode } from '@app/src/shared/utils'
import { MyAuthService } from '@app/src/shared/auth/myauth.service'
import { MailService } from '@app/src/mail/mail.service'
import { UserService } from '@app/src/users/user/user.service'
import { Web3AuthService } from '@app/src/web3auth/web3auth.service'
import { UserEntity } from '@app/src/users/user/entities/user.entity'
import { PaymentWalletsService } from '@app/src/users/payment-method/services'
import { InvitationService } from '@app/src/users/invitation/invitation.service'
import { AccountStatus, EmailVerificationStatus } from '@app/src/users/user/enums'
import { NonprofitUserService } from '@app/src/nonprofit/user/nonprofit-user.service'
import { UserSessionEntity } from '@app/src/users/user/entities/user-session.entity'
import { RegionSettingsService } from '@app/src/admin/region-settings/region_settings.service'
import {
  meService,
  loginService,
  signupService,
  confirmationService,
  createWalletService,
  verify2FaAuthService,
  remove2FaAuthService,
  enable2FaAuthService,
  nonprofitSignupService,
  changePasswordService,
  initiate2FaAuthService,
  resendConfirmationService,
  nonprofitConfirmationService,
} from './services'

@Injectable()
export class AuthService extends MyAuthService {
  private readonly zendeskClient = createClient({
    username: process.env.ZENDESK_EMAIL,
    token: process.env.ZENDESK_API_TOKEN,
    subdomain: process.env.ZENDESK_DOMAIN,
    debug: false,
    logger: console,
  })

  constructor(
    @InjectRepository(UserSessionEntity)
    private readonly userSessionRepository: Repository<UserSessionEntity>,
    public readonly userService: UserService,
    public readonly mailService: MailService,
    public readonly jwtService: JwtService,
    public readonly configService: ConfigService,
    public readonly invitationService: InvitationService,
    private readonly entityManager: EntityManager,
    private readonly regionSettingsService: RegionSettingsService,
    private readonly nonprofitUserService: NonprofitUserService,
    private readonly eventEmitter: EventEmitter2,
    private readonly web3Auth: Web3AuthService,
    private readonly paymentWalletsService: PaymentWalletsService,
  ) {
    super(
      userService,
      mailService,
      jwtService,
      configService,
      null,
      configService.get('app.userDashboardUrl'),
    )
  }

  private setTokenCookies(res: Response, accessToken: string, refreshToken: string) {
    const accessExpires = new Date(Date.now() + 1000 * 60 * 15) // 15 minutes
    const refreshExpires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) // 7 days

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: accessExpires,
    })

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      expires: refreshExpires,
    })
  }

  private async getTokens(user: UserEntity, req: Request, res: Response) {
    const accessTokenPayload = {
      id: user.id,
      email: user.email,
      account_type: user.account_type,
      two_factor_enabled: user.two_factor_authentication.enabled,
    }

    const refreshTokenPayload = {
      id: user.id,
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessTokenPayload, {
        expiresIn: this.configService.get('auth.jwt.access.expiresIn'),
      }),

      this.jwtService.signAsync(refreshTokenPayload, {
        secret: this.configService.get('auth.jwt.refresh.secret'),
        expiresIn: this.configService.get('auth.jwt.refresh.expiresIn'),
        algorithm: 'HS256',
      }),
    ])

    const ip_address = req.ip
    const user_agent = req.headers['user-agent']
    const expires_at = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) // 7 days

    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10)

    const session = this.userSessionRepository.create({
      user,
      refresh_token: hashedRefreshToken,
      ip_address,
      user_agent,
      expires_at,
    })

    await this.userSessionRepository.save(session)

    this.setTokenCookies(res, accessToken, refreshToken)

    return { accessToken }
  }

  public async refreshToken(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies?.refresh_token

      if (!refreshToken) {
        throw new UnauthorizedException('No refresh token provided')
      }

      const decoded = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('auth.jwt.refresh.secret'),
        algorithms: ['HS256'],
      })

      const user = await this.userService.findOne({
        where: { id: decoded.id },
        relations: ['sessions'],
      })

      if (!user) {
        throw new UnauthorizedException(ErrorKey.UNAUTHORIZED)
      }

      const session = user.sessions.find((s) => bcrypt.compareSync(refreshToken, s.refresh_token))

      if (!session) {
        throw new UnauthorizedException('Refresh token not found or revoked.')
      }

      if (session.expires_at < new Date()) {
        await this.userSessionRepository.delete(session.id)

        res.clearCookie('refresh_token')

        throw new UnauthorizedException('Refresh token expired.')
      }

      await this.userSessionRepository.delete(session.id)

      return this.getTokens(user, req, res)
    } catch (error) {
      res.clearCookie('refresh_token')
      throw new UnauthorizedException('Invalid refresh token.')
    }
  }

  public async logout(req: Request, res: Response): Promise<SuccessRO> {
    try {
      const refreshToken = req.cookies?.refresh_token

      if (refreshToken) {
        const decoded = this.jwtService.decode(refreshToken)
        if (decoded && decoded['id']) {
          const user = await this.userService.findOne({
            where: { id: decoded['id'] },
            relations: ['sessions'],
          })
          if (user) {
            const session = user.sessions.find((s) =>
              bcrypt.compareSync(refreshToken, s.refresh_token),
            )
            if (session) await this.userSessionRepository.delete(session.id)
          }
        }
      }
    } finally {
      res.clearCookie('access_token')
      res.clearCookie('refresh_token')
      res.clearCookie('xGuestCartId')
    }
    return { success: true, message: 'Logged out successfully' }
  }

  public async logoutAllDevices(userId: string): Promise<SuccessRO> {
    await this.userSessionRepository.delete({
      user: { id: userId },
    })
    return { success: true, message: 'Logged out from all devices successfully' }
  }

  public async getActiveSessions(userId: string): Promise<any[]> {
    const sessions = await this.userSessionRepository.find({
      where: {
        user: { id: userId },
        expires_at: Raw((alias) => `${alias} > NOW()`),
      },
      order: {
        created: 'DESC',
      },
      select: ['id', 'ip_address', 'created', 'expires_at'],
    })

    return sessions.map((session) => ({
      id: session.id,
      ip_address: session.ip_address,
      created: session.created,
      expires_at: session.expires_at,
    }))
  }

  public async logoutSession(userId: string, sessionId: string): Promise<SuccessRO> {
    const result = await this.userSessionRepository.delete({
      id: sessionId,
      user: { id: userId },
    })
    if (result.affected === 0) {
      throw new NotFoundException('Session not found')
    }
    return { success: true, message: 'Session terminated successfully' }
  }

  public async getAccessToken(user: UserEntity, req: Request, res: Response) {
    const { accessToken } = await this.getTokens(user, req, res)
    return user.toResponseObject({
      jwt: {
        type: 'bearer',
        accessToken: accessToken,
      },
    })
  }

  private async checkUser(id: string): Promise<UserEntity> {
    const user: UserEntity = await this.userService.findOne({
      where: {
        id,
        account_status: AccountStatus.ENABLED,
        email_verification: Raw(
          () => `email_verification::json->>'status' = '${EmailVerificationStatus.EMAIL_VERIFIED}'`,
        ),
      },
    })

    if (!user) {
      throw new NotFoundException(ErrorKey.USER_NOT_FOUND)
    }

    return user
  }

  private async generateUniqueReferralCode(length: number, batchSize: number): Promise<string> {
    let referralCode: string
    const codesToCheck: string[] = []
    do {
      referralCode = GenerateReferralCode(length)
      codesToCheck.push(referralCode)
    } while (codesToCheck.length < batchSize)

    const existingUsers = await this.userService.findMany({
      where: {
        referral_code: In(codesToCheck),
      },
      select: ['referral_code'],
    })

    const existingCodes = existingUsers.map((user) => user.referral_code)
    const uniqueCodes = codesToCheck.filter((code) => !existingCodes.includes(code))

    if (uniqueCodes.length > 0) {
      return uniqueCodes[0]
    } else {
      return this.generateUniqueReferralCode(length, batchSize)
    }
  }

  me = meService.bind(this)
  login = loginService.bind(this)
  signup = signupService.bind(this)
  confirmation = confirmationService.bind(this)
  createWallet = createWalletService.bind(this)
  enable2FaAuth = enable2FaAuthService.bind(this)
  remove2FaAuth = remove2FaAuthService.bind(this)
  verify2FaAuth = verify2FaAuthService.bind(this)
  changePassword = changePasswordService.bind(this)
  nonprofitSignup = nonprofitSignupService.bind(this)
  initiate2FaAuth = initiate2FaAuthService.bind(this)
  resendConfirmation = resendConfirmationService.bind(this)
  nonprofitConfirmation = nonprofitConfirmationService.bind(this)
}
