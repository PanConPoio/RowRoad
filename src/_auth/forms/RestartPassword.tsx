import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useCheckEmailExists, useRequestPasswordReset, useResetPassword } from '@/lib/appwrite/react-query/queriesAndMutations'

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import Loader from "@/components/shared/Loader"

const emailSchema = z.object({
  email: z.string().email('Correo electrónico inválido'),
})

const passwordSchema = z.object({
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
})

export default function RestartPassword() {
  const [step, setStep] = useState('email')
  const [email, setEmail] = useState('')
  const { toast } = useToast()
  const navigate = useNavigate()

  const emailForm = useForm<z.infer<typeof emailSchema>>({
    resolver: zodResolver(emailSchema),
    defaultValues: { email: '' },
  })

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { password: '', confirmPassword: '' },
  })

  const { mutateAsync: checkEmailExists, isPending: isCheckingEmail } = useCheckEmailExists()
  const { mutateAsync: requestPasswordReset, isPending: isRequestingReset } = useRequestPasswordReset()
  const { mutateAsync: resetPassword, isPending: isResettingPassword } = useResetPassword()

  const onEmailSubmit = async (data: z.infer<typeof emailSchema>) => {
    try {
      const emailExists = await checkEmailExists(data.email)
      if (emailExists) {
        await requestPasswordReset(data.email)
        setStep('password')
        setEmail(data.email)
        toast({ title: "Se ha enviado un correo con instrucciones para restablecer tu contraseña." })
      } else {
        toast({ title: "No se encontró una cuenta con ese correo electrónico.", variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Ocurrió un error al verificar el correo electrónico.", variant: "destructive" })
    }
  }

  const onPasswordSubmit = async (data: z.infer<typeof passwordSchema>) => {
    try {
      // Nota: En una implementación real, necesitarías obtener el userId y secret de la URL o de un estado
      const userId = "user-id-from-url"
      const secret = "secret-from-url"
      await resetPassword({ userId, secret, password: data.password })
      toast({ title: "Contraseña cambiada con éxito." })
      navigate('/sing-in')
    } catch (error) {
      toast({ title: "Ocurrió un error al cambiar la contraseña.", variant: "destructive" })
    }
  }

  return (
    <div className="sm:w-420 flex-center flex-col">
      <img src="/assets/images/logo.svg" alt="logo" />

      <h2 className="h3-bold md:h2-bold pt-5 sm:pt-12">Reiniciar Contraseña</h2>
      <p className="text-light-3 small-medium md:base-regular mt-2">
        {step === 'email' 
          ? "Ingresa tu correo electrónico para reiniciar tu contraseña" 
          : "Ingresa tu nueva contraseña"}
      </p>

      {step === 'email' ? (
        <Form {...emailForm}>
          <form onSubmit={emailForm.handleSubmit(onEmailSubmit)} className="flex flex-col gap-5 w-full mt-4">
            <FormField
              control={emailForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Correo Electrónico</FormLabel>
                  <FormControl>
                    <Input type="email" className="shad-input" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="shad-button_primary" disabled={isCheckingEmail || isRequestingReset}>
              {isCheckingEmail || isRequestingReset ? (
                <div className="flex-center gap-2">
                  <Loader /> Verificando...
                </div>
              ) : (
                "Verificar Correo"
              )}
            </Button>
          </form>
        </Form>
      ) : (
        <Form {...passwordForm}>
          <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="flex flex-col gap-5 w-full mt-4">
            <FormField
              control={passwordForm.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Nueva Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" className="shad-input" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={passwordForm.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="shad-form_label">Confirmar Contraseña</FormLabel>
                  <FormControl>
                    <Input type="password" className="shad-input" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="shad-button_primary" disabled={isResettingPassword}>
              {isResettingPassword ? (
                <div className="flex-center gap-2">
                  <Loader /> Cambiando contraseña...
                </div>
              ) : (
                "Cambiar Contraseña"
              )}
            </Button>
          </form>
        </Form>
      )}

      <p className="text-small-regular text-light-2 text-center mt-2">
        Recordaste tu contraseña?
        <Link to="/sing-in" className="text-red text-small-semibold ml-1">Inicia Sesión</Link>
      </p>
    </div>
  )
}