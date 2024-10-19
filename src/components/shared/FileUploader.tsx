import React, { useState, useCallback } from 'react'
import { FileWithPath, useDropzone } from 'react-dropzone'
import { Button } from '@/components/ui/button'

type FileUploaderProps = {
  fieldChange: (files: File[]) => void;
  mediaUrl: string;
}

const FileUploader = ({ fieldChange, mediaUrl }: FileUploaderProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [fileUrl, setFileUrl] = useState(mediaUrl)

  const onDrop = useCallback((acceptedFiles: FileWithPath[]) => {
    setFiles(acceptedFiles);
    fieldChange(acceptedFiles);
    setFileUrl(URL.createObjectURL(acceptedFiles[0]))
  }, [fieldChange])

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpeg', '.jpg'],
      'video/*': ['.mp4', '.mov', '.avi']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    maxFiles: 1
  })

  return (
    <div {...getRootProps()} className="flex flex-col items-center justify-center bg-dark-3 rounded-xl cursor-pointer overflow-hidden">
      <input {...getInputProps()} className="cursor-pointer" />
      {fileUrl ? (
        <div className="w-full h-full flex flex-col items-center justify-center">
          <div className="relative w-full pt-[100%]">
            {files[0]?.type.startsWith('video/') ? (
              <video src={fileUrl} className="absolute inset-0 w-full h-full object-cover" controls />
            ) : (
              <img 
                src={fileUrl}
                alt="uploaded file"
                className="absolute inset-0 w-full h-full object-contain" 
              />
            )}
          </div>
          <p className="text-light-4 small-regular mt-4 mb-2 text-center px-4">
            Haga clic o arrastre la foto para reemplazarla
          </p>
        </div>
      ) : (
        <div className="file_uploader-box p-8 flex flex-col items-center justify-center">
          <img 
            src="/assets/icons/file-upload.svg"
            width={96}
            height={77}
            alt="file upload"
            className="mb-4"
          />
          <h3 className="base-medium text-light-2 mb-2 mt-6">Arrastra la imagen aquí</h3>
          <p className="text-light-4 small-regular mb-6 text-center">SVG, PNG, JPG y MP4(proximamente)</p>
          <Button className="shad-button_dark_4">
            Seleccionar Archivo
          </Button>
        </div>
      )}
    </div>
  )
}

export default FileUploader