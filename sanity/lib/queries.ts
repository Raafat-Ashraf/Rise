import { groq } from 'next-sanity';

/**
 * Shared projection. Resolves image assets to CDN URLs plus their LQIP blur
 * placeholder and intrinsic dimensions, so next/image can reserve layout space
 * and blur up without a second round-trip.
 */
const imageProjection = groq`{
  "url": asset->url,
  "lqip": asset->metadata.lqip,
  "width": asset->metadata.dimensions.width,
  "height": asset->metadata.dimensions.height,
  alt
}`;

const propertyProjection = groq`{
  _id,
  "slug": slug.current,
  title,
  description,
  type,
  status,
  price,
  bedrooms,
  bathrooms,
  area,
  location,
  "gallery": gallery[]${imageProjection},
  "features": features[],
  "featured": coalesce(featured, false),
  reference,
  agent->{
    name,
    role,
    "photo": photo${imageProjection},
    phone,
    whatsapp,
    email
  },
  publishedAt
}`;

/** Every published property, newest first. Filtering/sorting happens in-app. */
export const allPropertiesQuery = groq`
  *[_type == "property" && defined(slug.current)]
    | order(publishedAt desc) ${propertyProjection}
`;

export const featuredPropertiesQuery = groq`
  *[_type == "property" && featured == true && defined(slug.current)]
    | order(publishedAt desc)[0...$limit] ${propertyProjection}
`;

export const propertyBySlugQuery = groq`
  *[_type == "property" && slug.current == $slug][0] ${propertyProjection}
`;

/**
 * Comparable assets: same type OR same city, excluding the current property.
 * Ordered so same-type matches surface first.
 */
export const similarPropertiesQuery = groq`
  *[
    _type == "property"
    && slug.current != $slug
    && status != "sold"
    && (type == $type || location.city.en == $city)
  ] | order(select(type == $type => 0, 1) asc, publishedAt desc)[0...$limit] ${propertyProjection}
`;

export const propertySlugsQuery = groq`
  *[_type == "property" && defined(slug.current)]{
    "slug": slug.current,
    "updatedAt": coalesce(_updatedAt, publishedAt)
  }
`;
