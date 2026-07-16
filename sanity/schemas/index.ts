import type { SchemaTypeDefinition } from 'sanity';

import { localeString, localeText } from './objects/locale';
import { property } from './documents/property';
import { agent } from './documents/agent';

export const schemaTypes: SchemaTypeDefinition[] = [
  // Objects
  localeString,
  localeText,
  // Documents
  property,
  agent,
];

export { PROPERTY_TYPES, PROPERTY_STATUSES } from './documents/property';
