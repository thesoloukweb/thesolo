import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: ({ image }) => z.object({
    title: z.string(),
    /**
     * Optional shorter title for the <title> tag only. A headline that reads well
     * as an on-page <h1> is often past the ~60 characters Google displays, and
     * shortening the visible heading to suit the search result would be the wrong
     * trade. When absent, `title` is used for both.
     */
    seoTitle: z.string().optional(),
    description: z.string(),
    pubDate: z.date(),
    /**
     * Processed through astro:assets, not a public/ path. The post hero fills a
     * full-width band and the cards are 700px wide on a retina phone; served raw
     * that means a 2160px original downloaded on every device. As an image() the
     * build emits WebP at each width the layout actually asks for.
     */
    heroImage: image().optional(),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    author: z.string().default('TheSolo Kitchen & Bar'),
  }),
});

export const collections = {
  blog: blogCollection,
};
