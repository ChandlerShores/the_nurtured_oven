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
    image: "/images/biscoff_cookie.png",
    caption: "Biscoff oatmeal cookies — fresh-baked happiness." /* confirm with owner */,
    alt: "Biscoff oatmeal cookie with label and packaging",
  },
  {
    image: "/images/marshmallow-cloud-bar.png",
    caption: "Marshmallow cloud bars, pulled warm from the pan." /* confirm with owner */,
    alt: "Homemade marshmallow cereal bar with a gooey pull",
  },
  {
    image: "/images/cloud-bar-in-package.png",
    caption: "Packed with care for pickup weekend." /* confirm with owner */,
    alt: "Cloud bars in clear packaging ready to go",
  },
  {
    image: "/images/sour-dough-loaf.png",
    caption: "Slow bread days — comfort from the oven." /* confirm with owner */,
    alt: "Rustic sourdough loaf on a warm surface",
  },
  {
    image: "/images/biscoff-butter-cloud-bar.png",
    caption: "Small-batch treats for sharing (or not)." /* confirm with owner */,
    alt: "Biscoff butter cloud bar treat",
  },
  {
    image: "/images/seasonal-feature.png",
    caption: "Something sweet on the counter." /* confirm with owner */,
    alt: "Seasonal bake from the kitchen",
  },
]
