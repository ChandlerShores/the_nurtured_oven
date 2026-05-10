export interface SocialPost {
  image: string
  caption: string
  alt: string
}

export const socialLinks = {
  instagram: {
    url: "https://www.instagram.com/thenurturedoven/" /* confirm with owner */,
    handle: "@thenurturedoven",
  },
  facebook: {
    url: "https://www.facebook.com/thenurturedoven/" /* confirm with owner */,
    handle: "The Nurtured Oven",
  },
}

export const recentBakes: SocialPost[] = [
  {
    image: "/images/social-1.jpg",
    caption: "Brown butter chocolate chip — the one that started it all." /* confirm with owner */,
    alt: "Fresh-baked chocolate chip cookies cooling on parchment paper",
  },
  {
    image: "/images/social-2.jpg",
    caption: "Comfort boxes packed and ready for pickup this weekend." /* confirm with owner */,
    alt: "Gift boxes of baked goods wrapped in kraft paper",
  },
  {
    image: "/images/social-3.jpg",
    caption: "Snickerdoodles rolled in cinnamon sugar, just like you remember." /* confirm with owner */,
    alt: "Cinnamon sugar cookies on a baking sheet",
  },
  {
    image: "/images/social-4.jpg",
    caption: "A little something for a friend going through it." /* confirm with owner */,
    alt: "A care package of homemade baked goods with a handwritten note",
  },
  {
    image: "/images/social-5.jpg",
    caption: "Saturday morning baking — oat crumble bars with seasonal fruit." /* confirm with owner */,
    alt: "Oat crumble bars with fruit filling on a kitchen counter",
  },
  {
    image: "/images/social-6.jpg",
    caption: "Fresh from the oven. This batch is spoken for." /* confirm with owner */,
    alt: "Golden brown baked goods fresh from the oven",
  },
]
