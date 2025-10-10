import { z } from 'zod';

export const newsFormSchema = z.object({
  url: z.string().url('URL inválida').min(1, 'URL é obrigatória'),
  title: z.string().min(3, 'Título deve ter no mínimo 3 caracteres'),
  description: z.string().optional(),
  source: z.string().min(1, 'Fonte é obrigatória'),
  published_date: z.string().optional(),
  image_url: z.string().url('URL de imagem inválida').optional().or(z.literal('')),
  author: z.string().optional(),
  category: z.string().optional(),
  tags: z.string().optional(),
  active: z.boolean().default(true),
  installer_url: z.string().url('URL do instalador inválida').optional().or(z.literal('')),
});

export type NewsFormValues = z.infer<typeof newsFormSchema>;

export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;
