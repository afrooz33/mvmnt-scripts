import { ShippingProfileStatus } from '@app/src/users/shipping-profiles/enums'

function getVariantSpecificOrigins() {
  return `SELECT
      ua.id,
      ua.street,
      ua.city,
      ua.state,
      pc.id,
      pc.postcode,
      ua.name,
      spo."shippingProfilesId"
    FROM user_addressess ua
    JOIN postcodes pc ON pc.id = ua."postcodeId"
    JOIN shipping_profile_origins spo ON spo."userAddressessId" = ua.id
    JOIN shipping_profile_variants spv ON spv."shippingProfilesId" = spo."shippingProfilesId"
    JOIN shipping_profiles sp ON sp.id = spo."shippingProfilesId"
    WHERE spv."dealVariantsId" = $1
      AND sp."userId" = $2
      AND sp.all_deals = false
      AND sp.status = '${ShippingProfileStatus.ENABLED}'
      AND NOT EXISTS (
          SELECT 1
          FROM shipping_profile_deals spd
          WHERE spd."shippingProfilesId" = spo."shippingProfilesId"
      )
    GROUP BY ua.id, pc.id, ua."profileId", spo."shippingProfilesId";`
}

function getDealSpecificOrigins() {
  return `SELECT
      ua.id,
      ua.street,
      ua.city,
      ua.state,
      pc.id,
      pc.postcode,
      ua.name,
      spo."shippingProfilesId"
    FROM user_addressess ua
    JOIN postcodes pc ON pc.id = ua."postcodeId"
    JOIN shipping_profile_origins spo ON spo."userAddressessId" = ua.id
    JOIN shipping_profile_deals spd ON spd."shippingProfilesId" = spo."shippingProfilesId"
    JOIN shipping_profiles sp ON sp.id = spo."shippingProfilesId"
    WHERE spd."dealsId" = $1
      AND sp."userId" = $2
      AND sp."status" = '${ShippingProfileStatus.ENABLED}'
      AND sp."all_deals" = false
    GROUP BY ua.id, pc.id, ua."profileId", spo."shippingProfilesId"`
}

function getAllDealsOrigins() {
  return `SELECT
      ua.id,
      ua.street,
      ua.city,
      ua.state,
      pc.id,
      pc.postcode,
      ua.name,
      spo."shippingProfilesId"
    FROM user_addressess ua
    JOIN postcodes pc ON pc.id = ua."postcodeId"
    JOIN shipping_profile_origins spo ON spo."userAddressessId" = ua.id
    JOIN shipping_profiles sp ON sp.id = spo."shippingProfilesId"
    WHERE sp.all_deals = true
      AND sp."userId" = $1
      AND sp.status = '${ShippingProfileStatus.ENABLED}'
    GROUP BY ua.id, pc.id, ua."profileId", spo."shippingProfilesId"`
}

function getDefaultOrigins() {
  return `SELECT
      sp."id" AS "shippingProfilesId"
    FROM shipping_profiles sp
    WHERE sp.status = '${ShippingProfileStatus.DEFAULT}'
      AND sp."userId" = $1
      AND sp.all_deals = true
    GROUP BY sp."id"`
}

export default {
  getDefaultOrigins,
  getAllDealsOrigins,
  getDealSpecificOrigins,
  getVariantSpecificOrigins,
}
