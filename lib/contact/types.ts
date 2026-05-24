export interface ContactFormState {
  name: string
  email: string
  phone: string
  items: string
  fulfillment: string
  deliveryAddress: string
  giftRecipient: string
  giftMessage: string
  giftOccasion: string
  dietary: string
  message: string
}

export const emptyContactFormState: ContactFormState = {
  name: "",
  email: "",
  phone: "",
  items: "",
  fulfillment: "pickup",
  deliveryAddress: "",
  giftRecipient: "",
  giftMessage: "",
  giftOccasion: "",
  dietary: "",
  message: "",
}
