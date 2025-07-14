/**
 * Calculates the Haversine distance between two points on the Earth.
 * The Haversine formula determines the great-circle distance between two points.
 *
 * @param lat1 - Latitude of the first point in degrees.
 * @param lon1 - Longitude of the first point in degrees.
 * @param lat2 - Latitude of the second point in degrees.
 * @param lon2 - Longitude of the second point in degrees.
 * @returns The distance between the two points in kilometers.
 */
export function HaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRadians = (degrees: number): number => degrees * (Math.PI / 180)

  // Convert latitude and longitude from degrees to radians
  const lat1Rad = toRadians(lat1)
  const lon1Rad = toRadians(lon1)
  const lat2Rad = toRadians(lat2)
  const lon2Rad = toRadians(lon2)

  // Haversine formula to calculate the distance
  const dLat = lat2Rad + -lat1Rad
  const dLon = lon2Rad + -lon1Rad

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  // Earth's radius in kilometers (mean radius)
  const R = 6371

  // Distance in kilometers
  return R * c
}
