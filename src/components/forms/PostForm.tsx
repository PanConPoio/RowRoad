import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import FileUploader from "../shared/FileUploader";
import AIImageGenerator from "../ia/AIImageGenerator";
import { PostValidation } from "@/lib/validation";
import { Models } from "appwrite";
import { useCreatePost, useUpdatePost } from "@/lib/appwrite/react-query/queriesAndMutations";
import { useUserContext } from "@/context/AuthContext";
import { useToast } from "../ui/use-toast";
import Loader from "../shared/Loader";
import { storage, appwriteConfig } from "@/lib/appwrite/config";
import { ID } from "appwrite";

type PostFormProps = {
  post?: Models.Document;
  action: "create" | "update";
};

export default function PostForm({ post, action }: PostFormProps) {
  const navigate = useNavigate();
  const { user } = useUserContext();
  const { toast } = useToast();
  const { mutateAsync: createPost, isPending: isLoadingCreate } = useCreatePost();
  const { mutateAsync: updatePost, isPending: isLoadingUpdate } = useUpdatePost();

  const form = useForm<z.infer<typeof PostValidation>>({
    resolver: zodResolver(PostValidation),
    defaultValues: {
      caption: post?.caption || "",
      file: [],
      location: post?.location || "",
      tags: post?.tags ? post.tags.join(", ") : "",
    },
  });

  const handleAIGeneratedImage = async (imageBase64: string) => {
    try {
      const byteString = atob(imageBase64.split(',')[1]);
      const mimeString = imageBase64.split(',')[0].split(':')[1].split(';')[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      const file = new File([blob], "ai-generated-image.png", { type: mimeString });

      const uploadedFile = await storage.createFile(
        appwriteConfig.storageId,
        ID.unique(),
        file
      );

      const fileUrl = storage.getFileView(appwriteConfig.storageId, uploadedFile.$id);
      form.setValue("file", [file]);
      
      toast({
        title: "Success",
        description: "Image generated and uploaded successfully.",
      });
    } catch (error) {
      console.error('Error processing generated image:', error);
      toast({
        title: "Error",
        description: "Failed to process the generated image. Please try again.",
        variant: "destructive",
      });
    }
  };

  async function onSubmit(values: z.infer<typeof PostValidation>) {
    if (post && action === "update") {
      const updatedPost = await updatePost({
        ...values,
        postId: post.$id,
        mediaId: post.mediaId,
        mediaUrl: post.mediaUrl,
        mediaType: post.mediaType,
      });

      if (!updatedPost) {
        toast({ title: "Error updating post. Please try again." });
      } else {
        toast({ title: "Post updated successfully" });
        navigate(`/posts/${post.$id}`);
      }
    } else {
      const newPost = await createPost({
        ...values,
        userId: user.id,
      });

      if (!newPost) {
        toast({ title: "Error creating post. Please try again." });
      } else {
        toast({ title: "Post created successfully" });
        navigate("/");
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
              <FormLabel className="shad-form_label">Descripcion</FormLabel>
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
              <FormLabel className="shad-form_label">Agrega la publicacion</FormLabel>
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
        </div>

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="shad-form_label">Locacion</FormLabel>
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
                Hashtags (separalas con comas " , ")
              </FormLabel>
              <FormControl>
                <Input
                  type="text"
                  className="shad-input"
                  placeholder="Art, Expression, Learn"
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
            disabled={isLoadingCreate || isLoadingUpdate}
          >
            {isLoadingCreate || isLoadingUpdate ? (
              <div className="flex-center gap-2">
                <Loader /> {action === "create" ? "Creating..." : "Updating..."}
              </div>
            ) : (
              <>{action === "create" ? "Crear" : "Actualizar"} Publicacion</>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}