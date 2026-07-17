/** Primary navigation, shared by the header, the mobile menu and the footer. */
export const mainNav = [
  { key: 'home', href: '/' },
  { key: 'properties', href: '/properties' },
  { key: 'services', href: '/services' },
  { key: 'about', href: '/about' },
  { key: 'contact', href: '/contact' },
] as const;

export type NavItem = (typeof mainNav)[number];

/** Service anchors used by the footer's secondary column. */
export const serviceLinks = [
  { key: 'investment', href: '/services#investment' },
  { key: 'buying', href: '/services#buying' },
  { key: 'selling', href: '/services#selling' },
  { key: 'management', href: '/services#management' },
  { key: 'consulting', href: '/services#consulting' },
] as const;

export const socialLinks = [
  { key: 'facebook', href: 'https://www.facebook.com/AMJADDevEG' },
] as const;
