import { z } from "zod";

export const noteSchema = z.object({
  id: z.string(),
  title: z.string(),
  content: z.string(),
  color: z.string().optional(),
  position: z.object({
    x: z.number(),
    y: z.number()
  }),
  size: z.object({
    width: z.number(),
    height: z.number()
  }),
  zIndex: z.number(),
  createdAt: z.string(),
  updatedAt: z.string()
});

export type Note = z.infer<typeof noteSchema>; 