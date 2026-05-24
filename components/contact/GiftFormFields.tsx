import DeliveryFields from "@/components/contact/DeliveryFields"
import { fulfillmentPolicy } from "@/lib/content/fulfillment"
import { siteConfig } from "@/lib/content/site"
import type { ContactFormState } from "@/lib/contact/types"

interface GiftFormFieldsProps {
  form: ContactFormState
  update: (field: string, value: string) => void
  inputClassName: string
}

export default function GiftFormFields({
  form,
  update,
  inputClassName,
}: GiftFormFieldsProps) {
  return (
    <>
      <div>
        <label
          htmlFor="phone"
          className="block text-sm text-brown-sugar/80 mb-1.5 tracking-wide"
        >
          Phone <span className="text-brown-sugar/40 text-xs">(optional)</span>
        </label>
        <input
          id="phone"
          type="tel"
          className={inputClassName}
          value={form.phone}
          onChange={(e) => update("phone", e.target.value)}
          placeholder="(859) 555-1234"
        />
      </div>

      <div>
        <label
          htmlFor="items"
          className="block text-sm text-brown-sugar/80 mb-1.5 tracking-wide"
        >
          Which Comfort Box? <span className="text-blush">*</span>
        </label>
        <select
          id="items"
          required
          className={inputClassName}
          value={form.items}
          onChange={(e) => update("items", e.target.value)}
        >
          <option value="">Select a size...</option>
          <option value="Mini Comfort Box">Mini Comfort Box ($16–22)</option>
          <option value="Classic Comfort Box">Classic Comfort Box ($32–42)</option>
          <option value="Gathering Box">Gathering Box ($55–75+)</option>
        </select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label
            htmlFor="giftRecipient"
            className="block text-sm text-brown-sugar/80 mb-1.5 tracking-wide"
          >
            Who is it for?
          </label>
          <input
            id="giftRecipient"
            type="text"
            className={inputClassName}
            value={form.giftRecipient}
            onChange={(e) => update("giftRecipient", e.target.value)}
            placeholder="Recipient name or description"
          />
        </div>
        <div>
          <label
            htmlFor="giftOccasion"
            className="block text-sm text-brown-sugar/80 mb-1.5 tracking-wide"
          >
            Occasion
          </label>
          <input
            id="giftOccasion"
            type="text"
            className={inputClassName}
            value={form.giftOccasion}
            onChange={(e) => update("giftOccasion", e.target.value)}
            placeholder="e.g., birthday, new baby, thank you"
          />
        </div>
      </div>

      <div>
        <label
          htmlFor="giftMessage"
          className="block text-sm text-brown-sugar/80 mb-1.5 tracking-wide"
        >
          Gift message{" "}
          <span className="text-brown-sugar/40 text-xs">
            (optional — we&apos;ll include it in the box)
          </span>
        </label>
        <textarea
          id="giftMessage"
          rows={2}
          className={inputClassName}
          value={form.giftMessage}
          onChange={(e) => update("giftMessage", e.target.value)}
          placeholder="A personal note to include with the gift..."
        />
      </div>

      <div className="space-y-5">
        <div className="max-w-md">
          <label
            htmlFor="fulfillment"
            className="block text-sm text-brown-sugar/80 mb-1.5 tracking-wide"
          >
            Pickup or delivery?
          </label>
          <select
            id="fulfillment"
            className={inputClassName}
            value={form.fulfillment}
            onChange={(e) => {
              const value = e.target.value
              if (value === "pickup") {
                update("deliveryCity", "")
                update("deliveryAddress", "")
              }
              update("fulfillment", value)
            }}
          >
            <option value="pickup">{fulfillmentPolicy.pickupOptionLabel}</option>
            <option value="delivery">{fulfillmentPolicy.deliveryOptionLabel}</option>
          </select>
        </div>
        {form.fulfillment === "delivery" && (
          <DeliveryFields
            form={form}
            update={update}
            inputClassName={inputClassName}
          />
        )}
      </div>

      <p className="text-xs text-brown-sugar/50 leading-relaxed font-body bg-oatmeal/30 rounded-xl px-4 py-3 border border-linen/30">
        {fulfillmentPolicy.customerFacing}
      </p>

      <div>
        <label
          htmlFor="dietary"
          className="block text-sm text-brown-sugar/80 mb-1.5 tracking-wide"
        >
          Allergy or dietary notes{" "}
          <span className="text-brown-sugar/40 text-xs">(optional)</span>
        </label>
        <input
          id="dietary"
          type="text"
          className={inputClassName}
          value={form.dietary}
          onChange={(e) => update("dietary", e.target.value)}
          placeholder="Any allergies or dietary needs?"
        />
        <p className="mt-2 text-xs text-brown-sugar/50 leading-relaxed">
          {siteConfig.cottageBakeryDisclosure}
        </p>
      </div>

      <div>
        <label
          htmlFor="message"
          className="block text-sm text-brown-sugar/80 mb-1.5 tracking-wide"
        >
          Anything else?{" "}
          <span className="text-brown-sugar/40 text-xs">(optional)</span>
        </label>
        <textarea
          id="message"
          rows={2}
          className={inputClassName}
          value={form.message}
          onChange={(e) => update("message", e.target.value)}
          placeholder="Preferred fulfillment date, special requests..."
        />
      </div>
    </>
  )
}
