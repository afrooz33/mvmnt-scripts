import { PaginateRO } from '@app/src/shared/dto'
import { GetDealFirstImageQuery } from '@app/src/shared/sql'
import { HandleErrors } from '@app/src/shared/helpers/Error.helper'
import { DealType } from '@app/src/users/deal/enums'
import { QueryDto } from '@app/src/users/contact/dto/query.dto'
import { MessageType } from '@app/src/users/contact/enums/message-type.enum'
import { ContactRequestStatus } from '@app/src/purchase-history/contact-seller/enums'

function GetCombinedContactsSql(isCount: boolean): string {
  const selectClause = isCount
    ? `COUNT(*)`
    : `combined_contacts.id,
      combined_contacts.external_ticket_id,
      combined_contacts.type,
      combined_contacts.status,
      combined_contacts.last_message,
      combined_contacts.last_message_at,
      combined_contacts.is_read,
      combined_contacts.other_party_info,
      combined_contacts.deal_info,
      combined_contacts.order_info`

  let deal_image = GetDealFirstImageQuery('d.deal_type', 'd.id')

  deal_image = deal_image.replace(' AS "deal_image"', '')

  // 1. User Contact Us Tickets (ADMIN or DEAL related)
  const userContactQuery = `
    SELECT
      uc.id::text as id,
      uc.zendesk_ticket_id as external_ticket_id,
      CASE WHEN uc."receiverId" IS NOT NULL THEN 'DEAL' ELSE 'ADMIN' END as type,
      'OPEN' as status,
      uc.latest_comment as last_message,
      uc.updated as last_message_at,
      CASE WHEN uc."userId" = $1 THEN uc.sender_read ELSE uc.receiver_read END as is_read,
      CASE
        WHEN uc."receiverId" IS NOT NULL THEN JSONB_BUILD_OBJECT(
          'id', r.id,
          'display_name', r.display_name,
          'username', r.username,
          'type', 'USER',
          'profile_image', (SELECT img.url FROM images img JOIN user_profiles up ON up."profileImagesId" = img.id WHERE up."userId" = r.id LIMIT 1)
        )
        ELSE JSONB_BUILD_OBJECT('type', 'ADMIN')
      END as other_party_info,
      CASE
        WHEN uc."dealId" IS NOT NULL THEN
          JSONB_BUILD_OBJECT(
            'id', d.id,
            'name', d.name,
            'image', (${deal_image})
          )
        ELSE NULL END as deal_info,
      NULL::jsonb as order_info
    FROM user_contact uc
    LEFT JOIN deals d ON d.id = uc."dealId"
    LEFT JOIN users r ON r.id = uc."receiverId"
    WHERE (uc."userId" = $1 OR uc."receiverId" = $1)
  `

  // Combined query for both buyer and seller requests
  const contactSellerQuery = `
    SELECT
      csr.id::text as id,
      NULL as external_ticket_id,
      CASE 
        WHEN csr."buyerId" = $1 THEN 'BUYER_SELLER_REQUEST' 
        ELSE 'SELLER_BUYER_REQUEST' 
      END as type,
      csr.status::text as status,
      (SELECT message FROM contact_seller_messages csm WHERE csm."requestId" = csr.id ORDER BY csm.sent_at DESC LIMIT 1) as last_message,
      csr.updated as last_message_at,
      CASE
        WHEN csr."buyerId" = $1 AND csr.status = '${ContactRequestStatus.PENDING_BUYER_RESPONSE}' THEN false
        WHEN csr."sellerId" = $1 AND csr.status = '${ContactRequestStatus.PENDING_SELLER_RESPONSE}' THEN false
        ELSE true
      END as is_read,
      CASE
        WHEN csr."buyerId" = $1 THEN JSONB_BUILD_OBJECT(
          'id', seller.id,
          'display_name', seller.display_name,
          'username', seller.username,
          'type', 'SELLER',
          'profile_image', (SELECT img.url FROM images img JOIN user_profiles up ON up."profileImagesId" = img.id WHERE up."userId" = seller.id LIMIT 1)
        )
        ELSE JSONB_BUILD_OBJECT(
          'id', buyer.id,
          'display_name', buyer.display_name,
          'username', buyer.username,
          'type', 'BUYER',
          'profile_image', (SELECT img.url FROM images img JOIN user_profiles up ON up."profileImagesId" = img.id WHERE up."userId" = buyer.id LIMIT 1)
        )
      END as other_party_info,
      (SELECT
        JSONB_BUILD_OBJECT(
          'id', d.id,
          'name', d.name,
          'image', (${deal_image})
        )
        FROM deals d
        JOIN user_deal_item_payment ip ON ip."dealId" = d.id AND ip."paymentId" = csr."orderId"
        LIMIT 1
      ) as deal_info,
      JSONB_BUILD_OBJECT(
        'id', csr."orderId",
        'type', CASE WHEN csr."cartId" IS NOT NULL THEN '${DealType.BUYNOW}' WHEN csr."bidId" IS NOT NULL THEN '${DealType.AUCTION}' ELSE NULL END
      ) as order_info
    FROM contact_seller_requests csr
    JOIN users buyer ON buyer.id = csr."buyerId"
    JOIN users seller ON seller.id = csr."sellerId"
    WHERE csr."buyerId" = $1 OR csr."sellerId" = $1
  `

  return `
    SELECT ${selectClause}
    FROM (
      (${userContactQuery})
      UNION ALL
      (${contactSellerQuery})
    ) as combined_contacts
  `
}

export default async function (query: QueryDto, userId: string): Promise<PaginateRO> {
  try {
    const pagination = {
      page: Number.parseInt(query.page ?? '1', 10) || 1,
      limit: Number.parseInt(query.limit ?? '10', 10) || 10,
    }
    const offset = (pagination.page - 1) * pagination.limit

    const whereClauses: string[] = []
    const queryParams: any[] = [userId]

    let paramIndex = 2

    if (query.keyword) {
      whereClauses.push(`(
        combined_contacts.last_message ILIKE $${paramIndex}
        OR combined_contacts.deal_info->>'name' ILIKE $${paramIndex}
        OR combined_contacts.other_party_info->>'display_name' ILIKE $${paramIndex}
        OR combined_contacts.other_party_info->>'username' ILIKE $${paramIndex}
      )`)
      queryParams.push(`%${query.keyword.toLowerCase()}%`)
      paramIndex++
    }

    if (query?.message_type && query?.message_type !== MessageType.ALL) {
      if (query?.message_type === MessageType.ORDER_RELATED) {
        whereClauses.push(
          `(combined_contacts.type = 'BUYER_SELLER_REQUEST' OR combined_contacts.type = 'SELLER_BUYER_REQUEST')`,
        )
      } else {
        whereClauses.push(`combined_contacts.type = $${paramIndex}`)
        queryParams.push(query.message_type)
        paramIndex++
      }
    }

    if (query.last_sent?.leading_date) {
      whereClauses.push(`combined_contacts.last_message_at >= $${paramIndex}`)
      queryParams.push(query.last_sent.leading_date)
      paramIndex++
    }
    if (query.last_sent?.trailing_date) {
      whereClauses.push(`combined_contacts.last_message_at <= $${paramIndex}`)
      queryParams.push(query.last_sent.trailing_date)
      paramIndex++
    }

    const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : ''

    const countSql = `${GetCombinedContactsSql(true)} ${whereSql}`
    const dataSql = `${GetCombinedContactsSql(
      false,
    )} ${whereSql} ORDER BY combined_contacts.last_message_at DESC LIMIT $${paramIndex} OFFSET $${
      paramIndex + 1
    }`

    const countParams = queryParams
    const dataParams = [...queryParams, pagination.limit, offset]

    const [results, countResult] = await Promise.all([
      this.contactRepository.query(dataSql, dataParams),
      this.contactRepository.query(countSql, countParams),
    ])

    const total = Number.parseInt(countResult[0]?.count || '0', 10)
    const totalPages = Math.ceil(total / pagination.limit)

    const meta = {
      limit: pagination.limit,
      total_page: totalPages,
      current_page: pagination.page,
      next_page: '',
      prev_page: '',
      total_record: total,
    }

    return { data: results, meta }
  } catch (error) {
    return HandleErrors(error)
  }
}
