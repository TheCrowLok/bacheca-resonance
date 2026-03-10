import { memo, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Maximize2, X } from "lucide-react";
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

// Funzione pseudo-casuale aggressiva basata sul seno per variare molto le rotazioni
function getPseudoRandomRotation(id: number | string): number {
  let seed = 0;
  const idStr = id.toString();
  for (let i = 0; i < idStr.length; i++) {
    seed = (seed << 5) - seed + idStr.charCodeAt(i);
    seed |= 0;
  }
  // Algoritmo deterministico che produce grandi variazioni anche tra numeri vicini
  const x = Math.sin(seed) * 10000;
  const random = x - Math.floor(x);
  return (random * 6) - 3; // Range da -3 a +3
}

export const PostCard = memo(function PostCard({ post, index }: PostCardProps) {
  const [isZoomed, setIsZoomed] = useState(false);

  const { colorClass, rotation } = useMemo(() => {
    // Ritorna alla logica automatica dell'array per i colori
    const colorIndex = typeof post.id === 'number' ? post.id : index;
    return {
      colorClass: STICKY_COLORS[colorIndex % STICKY_COLORS.length],
      rotation: getPseudoRandomRotation(post.id),
    };
  }, [post.id, index]);

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20, rotate: 0 }}
        animate={{ 
          opacity: 1, 
          scale: 1, 
          y: 0,
          rotate: rotation // Rotazione casuale ripristinata
        }}
        transition={{
          duration: 0.4,
          delay: Math.min(index * 0.05, 0.5),
          type: "spring",
          stiffness: 150,
          damping: 12,
        }}
        className={`sticky-note w-full max-w-sm mx-auto p-5 sm:p-6 ${colorClass} flex flex-col gap-4 aspect-square max-h-[400px] shadow-xl`}
        style={{ transformOrigin: "center center" }}
      >
        <div className="thumbtack" />

        {post.imageUrl && (
          <div 
            className="w-full relative h-1/2 mt-2 rounded overflow-hidden shadow-inner bg-black/10 flex-shrink-0 cursor-zoom-in group"
            onClick={() => setIsZoomed(true)}
          >
            <img
              src={post.imageUrl}
              alt={`Attached by ${post.nickname}`}
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Maximize2 className="text-white w-6 h-6 drop-shadow-md" />
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col overflow-hidden pt-2">
          <p className="font-handwriting text-2xl sm:text-3xl leading-snug whitespace-pre-wrap break-words flex-1 overflow-y-auto no-scrollbar pb-2">
            {post.message}
          </p>

          <div className="mt-auto pt-3 border-t border-current/20 flex items-center justify-between opacity-90">
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

      {/* MODALE PER L'IMMAGINE INGRANDITA - LOGICA ZOOM RIMASTA IDENTICA */}
      <AnimatePresence>
        {isZoomed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-10 cursor-zoom-out"
            onClick={() => setIsZoomed(false)}
          >
            <motion.div
              initial={{ scale: 0.5, rotate: -2 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="relative max-w-full max-h-full flex flex-col items-center"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={post.imageUrl!}
                className="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain border-4 border-white"
                alt="Zoomed"
              />

              <div className="mt-4 bg-white/10 px-6 py-2 rounded-full backdrop-blur-xl border border-white/20 shadow-xl">
                <p className="text-white font-handwriting text-2xl">
                  {post.message} <span className="opacity-50 text-lg"> — {post.nickname}</span>
                </p>
              </div>

              <button 
                className="absolute -top-12 right-0 sm:-right-12 text-white/70 hover:text-white transition-colors"
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
