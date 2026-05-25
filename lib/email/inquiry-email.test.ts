import { describe, it } from "node:test"
import assert from "node:assert/strict"
import {
  formatInquiryCustomerBody,
  formatInquiryOwnerBody,
  formatInquiryOwnerSubject,
  shouldSendInquiryCustomerReply,
} from "@/lib/email/inquiry-email"

const gift: Parameters<typeof formatInquiryOwnerBody>[0] = {
  intent: "gift",
  name: "Jane Doe",
  email: "jane@example.com",
  phone: "+18595551234",
  items: "Comfort Box — $50",
  fulfillment: "delivery",
  deliveryCity: "Georgetown",
  deliveryAddress: "123 Main St",
  giftRecipient: "Sam",
  giftOccasion: "Birthday",
  dietary: "No nuts",
  message: "Please call before delivery",
}

describe("inquiry emails", () => {
  it("owner gift email includes fulfillment and gift details", () => {
    const body = formatInquiryOwnerBody(gift)
    assert.match(body, /Gift recipient: Sam/)
    assert.match(body, /Delivery — Georgetown, 123 Main St/)
    assert.match(body, /Dietary \/ allergies: No nuts/)
    assert.ok(formatInquiryOwnerSubject(gift).includes("Jane Doe"))
  })

  it("sends customer auto-reply for gift and general", () => {
    assert.equal(shouldSendInquiryCustomerReply("gift"), true)
    assert.equal(shouldSendInquiryCustomerReply("general"), true)
    assert.equal(shouldSendInquiryCustomerReply("weekly-order"), false)
  })

  it("customer gift reply is warm and mentions follow-up", () => {
    const body = formatInquiryCustomerBody(gift)
    assert.match(body, /Hi Jane/)
    assert.match(body, /gift box request/i)
    assert.match(body, /Reply to this email/)
  })
})
