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
    url: "https://www.facebook.com/profile.php?id=61573256227837",
    handle: "The Nurtured Oven",
  },
}

export const recentBakes: SocialPost[] = [
  {
    image: "/images/biscoff_cookie.png",
    caption: "Biscoff oatmeal cookies, fresh from this week\u2019s menu.",
    alt: "Biscoff oatmeal cookie with label and packaging",
  },
  {
    image: "/images/cloudbar_stretch.png",
    caption: "Marshmallow cloud bars, pulled warm from the pan.",
    alt: "Homemade marshmallow cereal bar with a gooey pull",
  },
  {
    image: "/images/cloud-bar-in-package.png",
    caption: "Packed with care for Friday pickup.",
    alt: "Cloud bars in clear packaging ready to go",
  },
  {
    image: "/images/weekly_comfort_box.png",
    caption: "This week\u2019s Comfort Box, ready to brighten someone\u2019s day.",
    alt: "A beautifully boxed assortment of fresh-baked treats",
  },
  {
    image: "/images/oatmeal_cookie_spring.png",
    caption: "Small-batch treats for sharing (or not).",
    alt: "Stack of thick oatmeal cookies on a wooden board with spring flowers",
  },
  {
    image: "/images/chai-brownie.png",
    caption: "Something sweet on the counter.",
    alt: "Chai brownie with spiced glaze on a warm plate",
  },
]
