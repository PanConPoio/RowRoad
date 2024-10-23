'use client'

import { useState } from 'react'
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import FileUploader from "@/components/shared/FileUploader"
import AIImageGenerator from "@/components/ia/AIImageGenerator"
import { PostValidation } from "@/lib/validation"
import { Models } from "appwrite"
import { useUserContext } from "@/context/AuthContext"
import { useToast } from "@/components/ui/use-toast"
import Loader from "@/components/shared/Loader"
import { storage, appwriteConfig } from "@/lib/appwrite/config"
import { ID } from "appwrite"
import { useCreatePost, useUpdatePost } from '@/lib/appwrite/react-query/queriesAndMutations'

type PostFormProps = {
  post?: Models.Document;
  action: "create" | "update";
}

export default function PostForm({ post, action }: PostFormProps) {
  const navigate = useNavigate()
  const { user } = useUserContext()
  const { toast } = useToast()
  const { mutateAsync: createPost, isPending: isLoadingCreate } = useCreatePost()
  const { mutateAsync: updatePost, isPending: isLoadingUpdate } = useUpdatePost()
  const [isProcessingAIImage, setIsProcessingAIImage] = useState(false)

  const form = useForm<z.infer<typeof PostValidation>>({
    resolver: zodResolver(PostValidation),
    defaultValues: {
      caption: post?.caption || "",
      file: [],
      location: post?.location || "",
      tags: post?.tags ? post.tags.join(", ") : "",
    },
  })

  const handleAIGeneratedImage = async (imageBase64: string) => {
    setIsProcessingAIImage(true)
    try {
      // Ensure the imageBase64 string is properly formatted
      if (!imageBase64.startsWith('data:image/')) {
        throw new Error('Invalid image data format');
      }

      const base64Data = imageBase64.split(',')[1];
      if (!base64Data) {
        throw new Error('Invalid Base64 image data');
      }

      // Validate Base64 string
      if (!/^[A-Za-z0-9+/]*={0,2}$/.test(base64Data)) {
        throw new Error('Invalid Base64 encoding');
      }

      // Convert Base64 to Blob
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });

      // Create File object
      const file = new File([blob], "ai-generated-image.png", { type: 'image/png' })

      // Upload file to Appwrite storage
      const uploadedFile = await storage.createFile(
        appwriteConfig.storageId,
        ID.unique(),
        file
      )

      // Get file URL
      const fileUrl = storage.getFileView(appwriteConfig.storageId, uploadedFile.$id)

      // Update form state
      form.setValue("file", [file])
      
      toast({
        title: "Éxito",
        description: "Imagen generada y subida exitosamente.",
      })
    } catch (error) {
      console.error('Error al procesar la imagen generada:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "No se pudo procesar la imagen generada. Por favor, intenta de nuevo.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingAIImage(false)
    }
  }

  async function onSubmit(values: z.infer<typeof PostValidation>) {
    if (post && action === "update") {
      const updatedPost = await updatePost({
        ...values,
        postId: post.$id,
        mediaId: post.mediaId,
        mediaUrl: post.mediaUrl,
        mediaType: post.mediaType,
      })

      if (!updatedPost) {
        toast({ title: "Error al actualizar la publicación. Por favor, intenta de nuevo." })
      } else {
        toast({ title: "Publicación actualizada exitosamente" })
        navigate(`/posts/${post.$id}`)
      }
    } else {
      const newPost = await createPost({
        ...values,
        userId: user.id,
      })

      if (!newPost) {
        toast({ title: "Error al crear la publicación. Por favor, intenta de nuevo." })
      } else {
        toast({ title: "Publicación creada exitosamente" })
        navigate("/")
      }
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-9 w-full max-w-5xl">
        <FormField
          control={form.control}
          name="caption"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Descripción</FormLabel>
              <FormControl>
                <Textarea className="shad-textarea custom-scrollbar" {...field} />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="file"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Agrega la publicación</FormLabel>
              <FormControl>
                <FileUploader
                  fieldChange={field.onChange}
                  mediaUrl={post?.mediaUrl || ""}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <div className="flex flex-col gap-4">
          <h3 className="h3-bold">Generar con IA</h3>
          <AIImageGenerator onImageGenerated={handleAIGeneratedImage} />
          {isProcessingAIImage && <Loader />}
        </div>

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Ubicación</FormLabel>
              <FormControl>
                <Input type="text" className="shad-input" {...field} />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">
                Hashtags (sepáralas con comas " , ")
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  className="shad-input"
                  placeholder="Arte, Expresión, Aprendizaje"
                  {...field}
                />
              </FormControl>
              <FormMessage className="shad-form_message" />
            </FormItem>
          )}
        />

        <div className="flex gap-4 items-center justify-end">
          <Button
            type="button"
            className="shad-button_dark_4"
            onClick={() => navigate(-1)}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            className="shad-button_primary whitespace-nowrap"
            disabled={isLoadingCreate || isLoadingUpdate || isProcessingAIImage}
          >
            {isLoadingCreate || isLoadingUpdate ? (
              <div className="flex-center gap-2">
                <Loader /> {action === "create" ? "Creando..." : "Actualizando..."}
              </div>
            ) : (
              <>{action === "create" ? "Crear" : "Actualizar"} Publicación</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  )
}
