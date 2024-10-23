
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

interface AIImageGeneratorProps {
  onImageGenerated: (imageBase64: string) => void;
}

export default function Component({ onImageGenerated }: AIImageGeneratorProps = { onImageGenerated: () => {} }) {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const { toast } = useToast()

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Error",
        description: "Por favor, ingresa una descripción para generar la imagen.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      const formattedPrompt = encodeURIComponent(prompt)
      const response = await fetch(`http://192.168.2.41:9080/generate/image/prompt=${formattedPrompt}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor')
      }

      const data = await response.json()
      if (data && data.image) {
        // Ensure the image data is in the correct format
        const imageDataUrl = `data:image/png;base64,${data.image}`
        onImageGenerated(imageDataUrl)
        toast({
          title: "Éxito",
          description: "Imagen generada con éxito.",
        })
      } else {
        throw new Error('La respuesta del servidor no contiene una imagen válida')
      }
    } catch (error) {
      console.error('Error al generar la imagen:', error)
      toast({
        title: "Error",
        description: "No se pudo generar la imagen. Por favor, intenta de nuevo.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        type="text"
        placeholder="Describe la imagen que desees"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        className="shad-input"
      />
      <Button 
        onClick={handleGenerate} 
        disabled={isGenerating}
        className="shad-button_primary"
      >
        {isGenerating ? 'Generando...' : 'Crear con IA'}
      </Button>
    </div>
  );
}
