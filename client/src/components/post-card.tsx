import { memo, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, X, Trash2 } from "lucide-react";
import type { Post } from "@shared/schema";
import { useDeletePost } from "@/hooks/use-posts";

interface PostCardProps {
  post: Post;
  index: number;
}

const STICKY_COLORS = [
  "bg-viola-iride text-white", "bg-rosso-rossetto text-white",
  "bg-grigio-fumo text-white", "bg-bianco-sporco text-slate-900",
  "bg-rosa-shock text-white", "bg-verde-fluo text-green-950",
  "bg-giallo-fluo text-amber-950", "bg-arancio-fluo text-white",
];

function getPseudoRandomRotation(id: number | string): number {
  let seed = 0;
  const idStr = id.toString();
  for (let i = 0; i < idStr.length; i++) {
    seed = (seed << 5) - seed + idStr.charCodeAt(i);
    seed |= 0;
  }
  const x = Math.sin(seed) * 10000;
  const random = x - Math.floor(x);
  return (random * 6) - 3;
}

export const PostCard = memo(function PostCard({ post, index }: PostCardProps) {
  const [isZoomed, setIsZoomed] = useState(false);
  const deletePost = useDeletePost();

  const urlParams = new URLSearchParams(window.location.search);
  const adminPass = urlParams.get('admin');
  const isAdmin = adminPass === "admin123";

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Vuoi eliminare questo post?")) {
      deletePost.mutate({ id: post.id, password: adminPass || "" });
    }
  };

  const { colorClass, rotation } = useMemo(() => {
    const colorIndex = typeof post.id === 'number' ? post.id : index;
    return {
      colorClass: STICKY_COLORS[colorIndex % STICKY_COLORS.length],
      rotation: getPseudoRandomRotation(post.id),
    };
  }, [post.id, index]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1, rotate: rotation }}
        className={`sticky-note relative w-full max-w-sm mx-auto p-5 sm:p-6 ${colorClass} flex flex-col gap-4 aspect-square shadow-xl`}
      >
        {isAdmin && (
          <button onClick={handleDelete} className="absolute -top-3 -right-3 bg-red-600 text-white rounded-full p-2 shadow-2xl z-50 hover:scale-110 transition-transform">
            <Trash2 className="w-4 h-4" />
          </button>
        )}
        <div className="thumbtack" />
        {post.imageUrl && (
          <div className="w-full relative h-1/2 rounded overflow-hidden cursor-zoom-in group" onClick={() => setIsZoomed(true)}>
            <img src={post.imageUrl} className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <Maximize2 className="text-white w-6 h-6" />
            </div>
          </div>
        )}
        <div className="flex-1 flex flex-col overflow-hidden pt-2">
          <p className="font-handwriting text-2xl sm:text-3xl leading-snug break-words overflow-y-auto no-scrollbar pb-2">
            {post.message}
          </p>
          <div className="mt-auto pt-3 border-t border-current/20 flex items-center justify-between opacity-90 text-sm">
            <span className="font-display font-bold">~ {post.nickname}</span>
            <span className="text-xs">{new Date(post.createdAt!).toLocaleDateString()}</span>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {isZoomed && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setIsZoomed(false)}>
            <motion.div initial={{ scale: 0.5 }} animate={{ scale: 1 }} exit={{ scale: 0.5 }} className="relative max-w-full max-h-full flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
              <img src={post.imageUrl!} className="max-w-full max-h-[85vh] rounded-lg border-4 border-white shadow-2xl" />
              <button className="absolute -top-12 right-0 text-white" onClick={() => setIsZoomed(false)}><X className="w-10 h-10" /></button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});
