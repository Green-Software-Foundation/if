import {z} from 'zod';

export const implValidation = z.object({
  name: z.string(),
  description: z.string(),
  tags: z
    .object({
      kind: z.string().optional(),
      complexity: z.string().optional(),
      category: z.string().optional(),
    })
    .optional(),
  initialize: z.object({
    models: z.object({
      name: z.string(),
      kind: z.string(),
      path: z.string().optional(),
      model: z.string().optional(),
      config: z.object({}),
    }),
  }),
  graph: z
    .object({
      children: z.object({}),
    })
    .required(),
});
