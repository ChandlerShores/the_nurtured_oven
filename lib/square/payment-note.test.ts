import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  buildPaymentNote,
  parsePaymentNote,
  SQUARE_PAYMENT_NOTE_MAX_LENGTH,
} from "@/lib/square/payment-note"

const batch = {
  fulfillmentDate: "2026-05-29",
  internalRef: "TNO-2026-05-29-A8F3K2",
}

describe("payment note", () => {
  it("builds compact structured note", () => {
    const note = buildPaymentNote({
      name: "Jane Doe",
      phone: "+18595551234",
      fulfillment: "delivery",
      deliveryCity: "Georgetown",
      deliveryAddress: "123 Main St",
      dietary: "No nuts",
      message: "Gate code 1234",
      batch,
    })

    assert.match(note, /^TNO Fri 5\/29 \| DELIVERY \| Jane Doe/)
    assert.match(note, /Ref: TNO-2026-05-29-A8F3K2$/)
    assert.ok(note.length <= SQUARE_PAYMENT_NOTE_MAX_LENGTH)
  })

  it("parses structured note segments", () => {
    const note = buildPaymentNote({
      name: "Jane Doe",
      fulfillment: "pickup",
      batch,
    })
    const parsed = parsePaymentNote(note)
    assert.equal(parsed.fulfillmentMethod, "pickup")
    assert.equal(parsed.customerName, "Jane Doe")
    assert.equal(parsed.internalRef, batch.internalRef)
  })

  it("truncates long message within max length", () => {
    const note = buildPaymentNote({
      name: "Jane Doe",
      fulfillment: "delivery",
      deliveryCity: "Lexington",
      deliveryAddress: "A".repeat(200),
      message: "B".repeat(200),
      batch,
    })
    assert.ok(note.length <= SQUARE_PAYMENT_NOTE_MAX_LENGTH)
    assert.match(note, /Ref: TNO-2026-05-29-A8F3K2$/)
  })
})
