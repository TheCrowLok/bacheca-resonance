import { usePosts } from "@/hooks/use-posts";
import { PostCard } from "@/components/post-card";
import { CreatePostDialog } from "@/components/create-post-dialog";
import { Loader2, AlertCircle } from "lucide-react";

export default function Home() {
  const { data: posts, isLoading, error } = usePosts();

  return (
    <div className="min-h-screen w-full corkboard-bg overflow-x-hidden">
      {/* Decorative Title Area */}
      <header className="pt-12 pb-8 px-6 text-center relative z-10">
        <div className="inline-block relative">
          {/* Paper backing for the title */}
          <div className="absolute inset-0 bg-white shadow-md transform -rotate-1 rounded" />
          <h1 className="relative z-10 text-5xl md:text-7xl font-handwriting font-bold text-gray-800 px-8 py-4 transform rotate-1">
            Community Board
          </h1>
          <div className="thumbtack -top-1" />
        </div>
        <p className="text-white/90 font-display font-medium text-lg md:text-xl mt-6 drop-shadow-md">
          Leave a note, share a photo, say hello!
        </p>
      </header>

      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pb-32 pt-4 relative z-10">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-white/80">
            <Loader2 className="w-12 h-12 animate-spin mb-4 drop-shadow-md" />
            <p className="font-display font-medium text-xl drop-shadow-md">Loading notes...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="bg-white/90 backdrop-blur-sm p-8 rounded-2xl shadow-xl flex flex-col items-center text-center max-w-md border border-red-100">
              <AlertCircle className="w-16 h-16 text-red-500 mb-4" />
              <h2 className="text-2xl font-display font-bold text-gray-900 mb-2">Oops! Something went wrong</h2>
              <p className="text-gray-600 font-display">
                {error instanceof Error ? error.message : "Failed to load the board. Please try refreshing."}
              </p>
            </div>
          </div>
        ) : posts?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="bg-white/10 backdrop-blur-md p-10 rounded-3xl border border-white/20 shadow-2xl text-center max-w-lg transform -rotate-1">
              <h2 className="text-4xl font-handwriting font-bold text-white mb-4 drop-shadow-md">
                The board is empty!
              </h2>
              <p className="text-white/90 font-display text-lg drop-shadow-md">
                Be the first to pin a note. Click the + button in the bottom right corner to get started.
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8 items-start justify-items-center">
            {posts?.map((post, index) => (
              <PostCard key={post.id} post={post} index={index} />
            ))}
          </div>
        )}
      </main>

      {/* Floating Action Button & Form Modal */}
      <CreatePostDialog />
    </div>
  );
}
