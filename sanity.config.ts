'use client';

/**
 * Sanity Studio, embedded at /studio.
 *
 * The client signs in with their Sanity account at
 * https://<your-site>/studio and edits properties from the browser — no code,
 * no deploys.
 */

import { defineConfig } from 'sanity';
import { structureTool } from 'sanity/structure';
import { visionTool } from '@sanity/vision';
import { Building2, Star, UserRound } from 'lucide-react';

import { apiVersion, dataset, projectId, studioBasePath } from './sanity/env';
import { schemaTypes } from './sanity/schemas';

export default defineConfig({
  name: 'rise-studio',
  title: 'Rise — Content',
  basePath: studioBasePath,
  projectId,
  dataset,
  schema: { types: schemaTypes },
  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Rise')
          .items([
            S.listItem()
              .title('Properties')
              .icon(Building2)
              .child(
                S.list()
                  .title('Properties')
                  .items([
                    S.listItem()
                      .title('All properties')
                      .icon(Building2)
                      .child(
                        S.documentTypeList('property')
                          .title('All properties')
                          .defaultOrdering([
                            { field: 'publishedAt', direction: 'desc' },
                          ]),
                      ),
                    S.listItem()
                      .title('Featured on homepage')
                      .icon(Star)
                      .child(
                        S.documentTypeList('property')
                          .title('Featured')
                          .filter('_type == "property" && featured == true'),
                      ),
                    S.divider(),
                    ...[
                      { id: 'for-sale', title: 'For sale' },
                      { id: 'for-rent', title: 'For rent' },
                      { id: 'off-plan', title: 'Off-plan' },
                      { id: 'sold', title: 'Sold' },
                    ].map((status) =>
                      S.listItem()
                        .title(status.title)
                        .child(
                          S.documentTypeList('property')
                            .title(status.title)
                            .filter('_type == "property" && status == $status')
                            .params({ status: status.id }),
                        ),
                    ),
                  ]),
              ),
            S.listItem()
              .title('Advisors')
              .icon(UserRound)
              .child(S.documentTypeList('agent').title('Advisors')),
          ]),
    }),
    // Lets the client (or us) run GROQ queries against live data.
    visionTool({ defaultApiVersion: apiVersion }),
  ],
});
