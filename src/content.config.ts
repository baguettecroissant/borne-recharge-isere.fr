import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const guides = defineCollection({
  loader: glob({ pattern: '**/[^_]*.md', base: "./src/content/guides" }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.string().optional(),
    image: z.string().optional(),
    category: z.string().optional(),
  }),
});

export const collections = {
  guides: guides,
};
