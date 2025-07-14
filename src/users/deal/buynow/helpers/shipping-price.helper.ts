import { ShippingPriceConditionType } from '@app/src/users/shipping-profiles/enums'

export function GetApplicableShippingPrice(shippingPrices, itemWeight, itemPrice, quantity) {
  let fallbackPrice = null

  for (const price of shippingPrices) {
    if (price.condition_enabled) {
      // Handle condition based on weight
      if (price.condition_type === ShippingPriceConditionType.WEIGHT && itemWeight.length) {
        const weight = Number.parseFloat(itemWeight[0].value) * quantity

        if (weight >= (price.range.start ?? 0) && weight <= (price.range.end ?? Number.MAX_VALUE)) {
          return price.price
        }
      }
      // Handle condition based on price
      else if (price.condition_type === ShippingPriceConditionType.PRICE) {
        if (
          itemPrice >= (price.range.start ?? 0) &&
          itemPrice <= (price.range.end ?? Number.MAX_VALUE)
        ) {
          return price.price
        }
      }
    } else {
      fallbackPrice = price.price
    }
  }

  return fallbackPrice
}
