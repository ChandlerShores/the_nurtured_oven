import {
  deliveryCities,
  fulfillmentPolicy,
} from "@/lib/content/fulfillment"
import type { ContactFormState } from "@/lib/contact/types"

interface DeliveryFieldsProps {
  form: ContactFormState
  update: (field: string, value: string) => void
  inputClassName: string
}

export default function DeliveryFields({
  form,
  update,
  inputClassName,
}: DeliveryFieldsProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      <div>
        <label
          htmlFor="deliveryCity"
          className="block text-sm text-brown-sugar/80 mb-1.5 tracking-wide"
        >
          {fulfillmentPolicy.deliveryCityLabel}{" "}
          <span className="text-blush">*</span>
        </label>
        <select
          id="deliveryCity"
          required
          className={inputClassName}
          value={form.deliveryCity}
          onChange={(e) => update("deliveryCity", e.target.value)}
        >
          <option value="">Select city...</option>
          {deliveryCities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label
          htmlFor="deliveryAddress"
          className="block text-sm text-brown-sugar/80 mb-1.5 tracking-wide"
        >
          Street address <span className="text-blush">*</span>
        </label>
        <input
          id="deliveryAddress"
          type="text"
          required
          className={inputClassName}
          value={form.deliveryAddress}
          onChange={(e) => update("deliveryAddress", e.target.value)}
          placeholder={fulfillmentPolicy.deliveryStreetPlaceholder}
        />
      </div>
    </div>
  )
}
