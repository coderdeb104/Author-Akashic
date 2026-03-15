
"use client";

import { useState, ChangeEvent, ClipboardEvent, DragEvent } from 'react';
import { uploadFictionImage } from '@/app/fictions/actions';
import { useToast } from '@/hooks/use-toast';
import { UploadCloud, Loader2, X, BookImage } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function FictionImageUploader({
  onUpload,
  initialImageUrl
}: {
  onUpload: (url: string) => void;
  initialImageUrl?: string | null;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(initialImageUrl || null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (files: FileList | null) => {
    if (files && files.length > 0) {
      handleUpload(files[0]);
    }
  };

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setIsDragging(false);
    const formData = new FormData();
    formData.append('file', file);
    
    const result = await uploadFictionImage(formData);

    if (result.error) {
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: result.error,
      });
    } else if (result.url) {
      setImageUrl(result.url);
      onUpload(result.url);
      toast({
        title: 'Image Uploaded',
        description: 'Your fiction cover image is ready.',
      });
    }
    setIsUploading(false);
  };

  const onPaste = (event: ClipboardEvent<HTMLDivElement>) => {
    const items = event.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const file = items[i].getAsFile();
        if (file) {
          handleUpload(file);
        }
        break;
      }
    }
  };

  const handleDrag = (e: DragEvent<HTMLDivElement>, dragging: boolean) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isUploading) {
      setIsDragging(dragging);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    handleDrag(e, false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleUpload(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };


  return (
    <div
      className={`relative aspect-[2/3] w-full max-w-sm rounded-lg border-2 border-dashed p-4 text-center transition-colors ${isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary'}`}
      onPaste={onPaste}
      onDragEnter={(e) => handleDrag(e, true)}
      onDragLeave={(e) => handleDrag(e, false)}
      onDragOver={(e) => handleDrag(e, true)}
      onDrop={handleDrop}
    >
      {imageUrl ? (
        <>
          <Image src={imageUrl} alt="Fiction cover" fill className="rounded-md object-cover" />
          <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8 rounded-full" onClick={() => { setImageUrl(null); onUpload(''); }}>
            <X className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <label htmlFor="file-upload" className="flex h-full w-full cursor-pointer flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center">
            {isUploading ? (
              <>
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="mt-2 text-sm text-muted-foreground">Uploading...</p>
              </>
            ) : (
              <>
                <BookImage className="h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  <span className="font-semibold text-primary">Upload a cover</span> or drag and drop
                </p>
                <p className="text-xs text-muted-foreground">You can also paste an image</p>
              </>
            )}
          </div>
          <input id="file-upload" name="file-upload" type="file" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e.target.files)} disabled={isUploading} />
        </label>
      )}
    </div>
  );
}
