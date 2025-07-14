import { Module } from '@nestjs/common'
import { AuthModule } from './auth/auth.module'
import { UserModule } from './user/user.module'
import { ProfileModule } from './profile/profile.module'
import { DealsModule } from './deal/deals.module'
import { BrandModule } from './brand/brand.module'
import { FollowerModule } from './follower/follower.module'
import { AddressModule } from './address/address.module'
import { EmailChangeModule } from './email-change/email-change.module'
import { ShareModule } from './share/share.module'
import { ContactModule } from './contact/contact.module'
import { DonationProjectsModule } from './donation-projects/donation-projects.module'
import { PurchaseModule } from './purchases/purchases.module'
import { RestrictionsModule } from './restrictions/restrictions.module'
import { InvitationModule } from './invitation/invitation.module'
import { ShippingProfilesModule } from './shipping-profiles/shipping-profiles.module'
import { WishlistModule } from './wishlist/wishlist.module'
import { DeliverySettingsModule } from './delivery-settings/delivery-settings.module'
import { UserPaymentModule } from './payment/user-payment.module'
import { UserPointsModule } from './points/user-points.module'
import { RankModule } from './rank/rank.module'
import { OrderRoutingModule } from './order-routing/order-routing.module'
import { CheckoutModule } from './checkout/checkout.module'
import { ActivityReportsModule } from './activity-reports/activity-reports.module'
import { UserWithdrawalModule } from './withdrawal/user-withdrawal.module'
import { ResellingModule } from './reselling/reselling.module'
import { RankingsModule } from './rankings/rankings.module'
import { StarsModule } from './stars/stars.module'
import { TokensModule } from './tokens/tokens.module'
import { ReceiptsModule } from './receipts/receipts.module'
import { Re2SettingsModule } from './re2-settings/re2-settings.module'
import { BrandTokensModule } from './brand-tokens/brand-tokens.module'
import { WalletTransactionHistoryModule } from './wallet-transaction-history/wallet-transaction-history.module'

@Module({
  imports: [
    AuthModule,
    UserModule,
    ProfileModule,
    DealsModule,
    BrandModule,
    FollowerModule,
    AddressModule,
    EmailChangeModule,
    ShareModule,
    ContactModule,
    DonationProjectsModule,
    PurchaseModule,
    RestrictionsModule,
    InvitationModule,
    ShippingProfilesModule,
    WishlistModule,
    DeliverySettingsModule,
    UserPaymentModule,
    UserPointsModule,
    RankModule,
    OrderRoutingModule,
    CheckoutModule,
    ActivityReportsModule,
    UserWithdrawalModule,
    ResellingModule,
    RankingsModule,
    StarsModule,
    TokensModule,
    ReceiptsModule,
    Re2SettingsModule,
    BrandTokensModule,
    WalletTransactionHistoryModule,
  ],
})
export class UsersModule {}
