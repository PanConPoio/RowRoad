import { z } from "zod"

export const SignupValidation = z.object({
    name: z.string().min(2, {message: 'Muy corto' }),
    username: z.string().min(2, {message: 'Muy corto' }),
    email: z.string().email(),
    password: z.string().min(8, {message: 'La contraseña tiene que ser de minimo 8 caracteres' }),
  })

  export const SigninValidation = z.object({
    email: z.string().email(),
    password: z.string().min(8, {message: 'La contraseña tiene que ser de minimo 8 caracteres' }),
  })

  export const ProfileValidation = z.object({
    file: z.custom<File[]>(),
    name: z.string().min(2, { message: "Name must be at least 2 characters." }),
    username: z.string().min(2, { message: "Name must be at least 2 characters." }),
    email: z.string().email(),
    bio: z.string(),
  });
  
  export const PostValidation = z.object({
    caption: z.string().min(5).max(2200),
    file: z.custom<File[]>(),
    location: z.string(),
    tags: z.string(),
  })

