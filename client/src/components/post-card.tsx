import { memo, useMemo, useState } from "react"; // Aggiunto useState
import { motion, AnimatePresence } from "framer-motion"; // Aggiunto AnimatePresence
import { Maximize2, X } from "lucide-react"; // Icone per lo zoom
import type { Post } from "@shared/schema";

interface PostCardProps {
  post: Post;
  index: number;
}

const STICKY_COLORS = [
  "bg-viola-iride text-white",
  "bg-rosso-rossetto text-white",
  "bg-grigio-fumo text-white",
  "bg-bianco-sporco text-slate-900",
  "bg-rosa-shock text-white",
  "bg-verde-fluo text-green-950",
  "bg-giallo-fluo text-amber-950",
  "bg-arancio-fluo text-white",
];

const ROTATIONS = [
  "-rotate-3",
  "-rotate-2",
  "-rotate-1",
  "rotate-0",
  "rotate-1",
  "rotate-2",
  "rotate-3",
];

function getStringHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export const PostCard = memo(function PostCard({ post, index }: PostCardProps) {
  const [isZoomed, setIsZoomed] = useState(false); // Stato per lo zoom

  const { colorClass, rotationClass } = useMemo(() => {
    const idString = post.id.toString();
    const hash = getStringHash(idString);
    return {
      colorClass: STICKY_COLORS[hash % STICKY_COLORS.length],
      rotationClass: ROTATIONS[hash % ROTATIONS.length],
    };
  }, [post.id]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{
          duration: 0.4,
          delay: Math.min(index * 0.05, 0.5),
          type: "spring",
          stiffness: 150,
          damping: 12,
        }}
        className={`sticky-note w-full max-w-sm mx-auto p-5 sm:p-6 ${colorClass} ${rotationClass} flex flex-col gap-4 aspect-square max-h-[400px] shadow-xl`}
      >
        <div className="thumbtack" />

        {post.imageUrl && (
          <div
            className="w-full relative h-1/2 mt-2 rounded overflow-hidden shadow-inner bg-black/5 flex-shrink-0 cursor-zoom-in group"
            onClick={() => setIsZoomed(true)} // Apre lo zoom al click
          >
            <img
              src={post.imageUrl}
              alt="attachment"
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
              loading="lazy"
            />
            {/* Overlay che appare al passaggio del mouse */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Maximize2 className="text-white w-6 h-6" />
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col overflow-hidden pt-2">
          <p className="font-handwriting text-2xl sm:text-3xl leading-snug whitespace-pre-wrap break-words flex-1 overflow-y-auto no-scrollbar pb-2">
            {post.message}
          </p>

          <div className="mt-auto pt-3 border-t border-current/10 flex items-center justify-between opacity-80">
            <span className="font-display font-bold text-sm tracking-wide">
              ~ {post.nickname}
            </span>
            {post.createdAt && (
              <span className="font-display text-xs opacity-75">
                {new Date(post.createdAt).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* MODALE PER L'IMMAGINE INGRANDITA */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setIsZoomed(false)} // Chiude al click fuori
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -5 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="relative max-w-5xl max-h-[90vh] flex flex-col items-center"
              onClick={(e) => e.stopPropagation()} // Impedisce la chiusura cliccando l'immagine
            >
              <img
                src={post.imageUrl!}
                className="max-w-full max-h-[80vh] rounded-lg shadow-2xl object-contain border-4 border-white"
                alt="Zoomed attachment"
              />

              <div className="mt-4 bg-white/10 px-6 py-2 rounded-full backdrop-blur-md border border-white/20">
                <p className="text-white font-handwriting text-2xl">
                  {post.message}{" "}
                  <span className="opacity-60 text-lg"> ~ {post.nickname}</span>
                </p>
              </div>

              <button
                className="absolute -top-12 right-0 text-white hover:text-red-400 transition-colors"
                onClick={() => setIsZoomed(false)}
              >
                <X className="w-10 h-10" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
});
