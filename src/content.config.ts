import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const docs = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/docs' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    status: z.enum(['listo', 'proximamente']).default('listo'),
    duration: z.string().optional(),
    level: z.enum(['inicial', 'intermedio', 'avanzado']).optional(),
    outcome: z.string().optional(),
    prerequisites: z.array(z.string()).optional(),
  }),
});

export const collections = { docs };
