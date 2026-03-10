import { useState, useRef } from "react";
import { Plus, ImagePlus, X, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCreatePost, useUploadImage } from "@/hooks/use-posts";

export function CreatePostDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [nickname, setNickname] = useState("");
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const createPost = useCreatePost();
  const uploadImage = useUploadImage();

  const isSubmitting = createPost.isPending || uploadImage.isPending;

  const resetForm = () => {
    setNickname("");
    setMessage("");
    setFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl(null);
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      // Delay reset slightly to allow dialog close animation to finish
      setTimeout(resetForm, 300);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        alert("Image must be less than 5MB");
        return;
      }
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const clearFile = () => {
    setFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nickname.trim() || !message.trim()) return;

    try {
      let imageUrl: string | undefined = undefined;
      
      // 1. Upload image if present
      if (file) {
        const uploadResult = await uploadImage.mutateAsync(file);
        imageUrl = uploadResult.imageUrl;
      }

      // 2. Create the post
      await createPost.mutateAsync({
        nickname: nickname.trim(),
        message: message.trim(),
        imageUrl,
      });

      // 3. Close dialog on success
      setIsOpen(false);
      resetForm();
    } catch (error) {
      console.error("Failed to post:", error);
      // Error handling is managed by the mutation hooks via toasts
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <button
          className="
            fixed bottom-6 right-6 sm:bottom-10 sm:right-10 z-50
            flex items-center justify-center
            w-16 h-16 rounded-full
            bg-gradient-to-tr from-primary to-orange-400
            text-white shadow-2xl shadow-primary/40
            hover:scale-110 hover:-translate-y-1 hover:shadow-primary/60
            active:scale-95 active:translate-y-0
            transition-all duration-300 ease-out
          "
          aria-label="Create new post"
        >
          <Plus className="w-8 h-8" />
        </button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[500px] border-none shadow-2xl shadow-black/20 overflow-hidden bg-card/95 backdrop-blur-xl">
        {/* Decorative header accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-primary via-orange-400 to-yellow-400" />
        
        <DialogHeader className="pt-4">
          <DialogTitle className="text-2xl font-display font-bold text-foreground">
            Pin a new note
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="nickname" className="text-muted-foreground font-medium">Nickname</Label>
            <Input
              id="nickname"
              placeholder="Who are you?"
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              className="text-lg bg-background/50 border-border/50 focus-visible:ring-primary/20 h-12"
              maxLength={50}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message" className="text-muted-foreground font-medium">Message</Label>
            <Textarea
              id="message"
              placeholder="What's on your mind?"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="text-lg bg-background/50 border-border/50 focus-visible:ring-primary/20 min-h-[120px] resize-none"
              maxLength={500}
              required
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-muted-foreground font-medium">Attach an image (Optional)</Label>
            
            {!previewUrl ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSubmitting}
                className="w-full h-32 rounded-xl border-2 border-dashed border-border/60 bg-background/30 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:bg-background/80 hover:border-primary/50 hover:text-primary transition-all duration-200"
              >
                <ImagePlus className="w-8 h-8 opacity-70" />
                <span className="font-medium text-sm">Click to upload picture</span>
              </button>
            ) : (
              <div className="relative w-full h-48 rounded-xl overflow-hidden shadow-md group">
                <img 
                  src={previewUrl} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="sm"
                    onClick={clearFile}
                    disabled={isSubmitting}
                    className="font-bold shadow-xl"
                  >
                    <X className="w-4 h-4 mr-1" /> Remove
                  </Button>
                </div>
              </div>
            )}
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          <div className="pt-2 flex justify-end">
            <Button 
              type="submit" 
              size="lg" 
              disabled={isSubmitting || !nickname.trim() || !message.trim()}
              className="w-full sm:w-auto font-bold px-8 shadow-lg shadow-primary/20"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Pinning...
                </>
              ) : (
                "Publish Note"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
