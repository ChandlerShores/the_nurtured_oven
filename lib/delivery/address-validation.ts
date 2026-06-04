import type { DeliveryCity } from "@/lib/content/fulfillment"
import { isDeliveryCity } from "@/lib/content/fulfillment"
import { extractHouseNumber, hasDeliveryStreetAddress } from "@/lib/delivery/address"

export const GEORGETOWN_ZIP = "40324"
export const LEXINGTON_ZIP_MIN = 40502
export const LEXINGTON_ZIP_MAX = 40517

export function normalizeDeliveryZip(value: string): string | null {
  const digits = value.trim().replace(/\D/g, "")
  if (digits.length === 5) return digits
  if (digits.length === 9) return digits.slice(0, 5)
  return null
}

export function validateDeliveryStreetAddress(address: string): string | null {
  if (!hasDeliveryStreetAddress(address)) {
    return "Please enter your street address for delivery."
  }
  if (!extractHouseNumber(address)) {
    return "Please include a street number (for example, 123 Main St)."
  }
  return null
}

export function validateDeliveryZip(
  city: DeliveryCity,
  zip: string
): string | null {
  const normalized = normalizeDeliveryZip(zip)
  if (!normalized) {
    return "Please enter a valid 5-digit zip code."
  }

  if (city === "Georgetown" && normalized !== GEORGETOWN_ZIP) {
    return "Georgetown deliveries use zip code 40324."
  }

  if (city === "Lexington") {
    const zipNumber = Number(normalized)
    if (
      zipNumber < LEXINGTON_ZIP_MIN ||
      zipNumber > LEXINGTON_ZIP_MAX
    ) {
      return "Lexington deliveries use zip codes 40502–40517."
    }
  }

  return null
}

export function validateDeliveryCheckoutAddress(input: {
  city: string
  address: string
  zip: string
}): string | null {
  const city = input.city.trim()
  if (!isDeliveryCity(city)) {
    return "Please select Georgetown or Lexington for delivery."
  }

  const streetError = validateDeliveryStreetAddress(input.address)
  if (streetError) return streetError

  return validateDeliveryZip(city, input.zip)
}
