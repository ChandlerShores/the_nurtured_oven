import type { ContactFormState } from "@/lib/contact/types"
import {
  deliveryCities,
  fulfillmentPolicy,
} from "@/lib/content/fulfillment"

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
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label
            htmlFor="deliveryCity"
            className="block text-sm text-muted mb-1.5 tracking-wide"
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
            htmlFor="deliveryZip"
            className="block text-sm text-muted mb-1.5 tracking-wide"
          >
            {fulfillmentPolicy.deliveryZipLabel}{" "}
            <span className="text-blush">*</span>
          </label>
          <input
            id="deliveryZip"
            type="text"
            required
            inputMode="numeric"
            autoComplete="postal-code"
            maxLength={10}
            className={inputClassName}
            value={form.deliveryZip}
            onChange={(e) => update("deliveryZip", e.target.value)}
            placeholder={fulfillmentPolicy.deliveryZipPlaceholder}
          />
        </div>
      </div>
      <div>
        <label
          htmlFor="deliveryAddress"
          className="block text-sm text-muted mb-1.5 tracking-wide"
        >
          Street address <span className="text-blush">*</span>
        </label>
        <input
          id="deliveryAddress"
          type="text"
          required
          autoComplete="street-address"
          className={inputClassName}
          value={form.deliveryAddress}
          onChange={(e) => update("deliveryAddress", e.target.value)}
          placeholder={fulfillmentPolicy.deliveryStreetPlaceholder}
        />
      </div>
      <p className="text-xs text-muted font-body leading-relaxed">
        {fulfillmentPolicy.deliveryCheckoutHint}
      </p>
    </div>
  )
}
