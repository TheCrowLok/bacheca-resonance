import { memo, useMemo } from "react";
import { motion } from "framer-motion";
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

// Funzione migliorata per generare un numero "caotico" basato su un ID
function getPseudoRandomRotation(id: number | string): number {
  // Trasformiamo l'id in un numero se è una stringa
  let seed = 0;
  if (typeof id === "string") {
    for (let i = 0; i < id.length; i++) {
      seed = (seed << 5) - seed + id.charCodeAt(i);
      seed |= 0;
    }
  } else {
    seed = id;
  }

  // Algoritmo per sparpagliare i valori (seno deterministico)
  // Questo assicura che ID 1 e ID 2 abbiano rotazioni completamente diverse
  const x = Math.sin(seed) * 10000;
  const random = x - Math.floor(x); // Otteniamo un valore tra 0 e 1
  
  // Trasformiamo in un range tra -3 e +3
  return (random * 6) - 3;
}

export const PostCard = memo(function PostCard({ post, index }: PostCardProps) {
  // Calcolo del colore e della rotazione
  const { colorClass, rotation } = useMemo(() => {
    // Per il colore usiamo l'index o l'id per variare
    const colorIndex = typeof post.id === 'number' ? post.id : index;
    
    return {
      colorClass: STICKY_COLORS[colorIndex % STICKY_COLORS.length],
      rotation: getPseudoRandomRotation(post.id),
    };
  }, [post.id, index]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20, rotate: 0 }}
      animate={{ 
        opacity: 1, 
        scale: 1, 
        y: 0,
        rotate: rotation // Applicazione rotazione casuale spinta
      }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        type: "spring",
        stiffness: 150,
        damping: 12,
      }}
      className={`sticky-note w-full max-w-sm mx-auto p-5 sm:p-6 ${colorClass} flex flex-col gap-4 aspect-square max-h-[400px] shadow-xl`}
      style={{ transformOrigin: "center center" }}
    >
      {/* Puntina da disegno */}
      <div className="thumbtack" />

      {post.imageUrl && (
        <div className="w-full relative h-1/2 mt-2 rounded overflow-hidden shadow-inner bg-black/10 flex-shrink-0">
          <img
            src={post.imageUrl}
            alt={`Attached by ${post.nickname}`}
            className="absolute inset-0 w-full h-full object-cover"
            loading="lazy"
          />
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
  );
});
