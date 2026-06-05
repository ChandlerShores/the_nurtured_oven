/** Small helpers for natural admin copy. */

export function isAre(count: number): "is" | "are" {
  return count === 1 ? "is" : "are"
}

export function orderWord(count: number): string {
  return count === 1 ? "order" : "orders"
}

export function deliveryWord(count: number): string {
  return count === 1 ? "delivery" : "deliveries"
}

export function pickupWord(count: number): string {
  return count === 1 ? "pickup" : "pickups"
}
