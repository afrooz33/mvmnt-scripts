import { faker } from '@faker-js/faker/locale/ja'
import { ISeederEntity } from '@app/src/shared/auth/interfaces'
import {
  NotificationType,
  NotificationRelatedTo,
  NotificationReceiverType,
} from '@app/src/notifications/enums'
import { DealType } from '@app/src/users/deal/enums'
import { NewsStatus } from '@app/src/nonprofit/news/enums'

export default async function (settings: any) {
  if (!settings.user) {
    return
  }

  const deals: ISeederEntity[] = await this.getDealsByType(DealType.BUYNOW)
  const deal = faker.helpers.arrayElement(deals)
  const bynowDealUser = await this.getDealWithUserById(deal.id)
  const nonprofits: ISeederEntity[] = await this.getNonprofits()
  const nonprofit = faker.helpers.arrayElement(nonprofits)

  const payload = []

  payload.push({
    title: `Recurring donation on ${bynowDealUser.name} has been stopped`,
    user: settings.user,
    type: NotificationType.RECURRING_DONATION_SUSPENDED,
    receiver_type: NotificationReceiverType.USER,
    related_to: NotificationRelatedTo.DEAL,
    data: {
      deal: deal.id,
      deal_name: bynowDealUser.name,
      seller: bynowDealUser.display_name,
      price: 100,
      payment_method: {
        id: 'pm_1J4J9z2eZvKYlo2C5J9z2eZvKYlo2C5J',
        type: 'card',
        brand: 'Visa',
        last4: '4242',
      },
    },
  })

  payload.push({
    title: 'Your account has been blocked',
    user: settings.user,
    type: NotificationType.ACCOUNT_BLOCKED,
    receiver_type: NotificationReceiverType.USER,
    related_to: NotificationRelatedTo.SERVICE,
    data: {
      message: `Block period: 11 days`,
    },
  })

  payload.push({
    title: 'There has been a change in the authentication status of personal identification',
    user: settings.user,
    type: NotificationType.PERSONAL_ID_STATUS_CHANGE,
    receiver_type: NotificationReceiverType.USER,
    related_to: NotificationRelatedTo.SERVICE,
    data: {
      message: 'Personal identification has been approved',
      document: {},
    },
  })

  payload.push({
    title: 'Your account block has been lifted',
    user: settings.user,
    type: NotificationType.ACCOUNT_UNBLOCKED,
    receiver_type: NotificationReceiverType.USER,
    related_to: NotificationRelatedTo.SERVICE,
  })

  const news = await this.entityManager.save('nonprofit_news', {
    title: faker.lorem.words(6),
    details: faker.lorem.paragraphs(3),
    user: nonprofit.id,
    views: faker.number.int({ min: 5, max: 1000 }),
    schedule_date: null,
    published_date: new Date(),
    status: NewsStatus.PUBLISHED,
  })

  payload.push({
    title: 'New news has been added',
    type: NotificationType.NONPROFIT_ADD_NEWS,
    receiver_type: NotificationReceiverType.USER,
    related_to: NotificationRelatedTo.NONPROFIT,
    user: settings.user,
    data: {
      nonprofitId: nonprofit.id,
      resource: news.id,
      title: 'New news has been added',
    },
  })

  const auctionDeal: ISeederEntity[] = await this.getDealsByType(DealType.AUCTION)
  const auction = faker.helpers.arrayElement(auctionDeal)

  payload.push({
    title: "You've won the auction",
    user: settings.user,
    type: NotificationType.BID_ON_AUCTION,
    receiver_type: NotificationReceiverType.USER,
    related_to: NotificationRelatedTo.DEAL,
    data: {
      deal: auction.id,
      deal_name: auction.name,
      price: 100,
    },
  })

  const bidders: ISeederEntity[] = await this.getUsers()
  const bidder = faker.helpers.arrayElement(bidders)
  const biddersDeal: ISeederEntity[] = await this.getDealByUserIdAndType(
    settings.user,
    DealType.AUCTION,
  )
  const bidderDeal = faker.helpers.arrayElement(biddersDeal)

  if (bidderDeal) {
    payload.push({
      title: "There's a bid on your auction",
      user: settings.user,
      type: NotificationType.BID_ON_AUCTION,
      receiver_type: NotificationReceiverType.USER,
      related_to: NotificationRelatedTo.DEAL,
      data: {
        deal: bidderDeal.id,
        deal_name: bidderDeal.name,
        bidder: bidder.id,
      },
    })
  }

  for (const item of payload) {
    await this.entityManager.save('notifications', item)
  }

  return
}
