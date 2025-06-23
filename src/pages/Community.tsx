
import Navigation from "@/components/Navigation";
import { Heart, Bookmark } from "lucide-react";

const Community = () => {
  const posts = [
    {
      id: 1,
      title: "5 Investment Tips for Beginners",
      content: "Lorem ipsum dolor sit amet, consectetur adipiring elit, sed diam nonummy nibh euismod tincidunt ut aus.",
      likes: 24,
      bookmarks: 8
    },
    {
      id: 2,
      title: "How to Build an Emergency Fund",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonummy nibh euismod tincidunt ut aus.",
      likes: 18,
      bookmarks: 5
    },
    {
      id: 3,
      title: "Women Share Their Investing Stories",
      content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed diam nonummy nibh euismod tincidunt ut.",
      likes: 32,
      bookmarks: 12
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="px-4 pb-20">
        <div className="max-w-md mx-auto">
          <div className="py-6">
            <h1 className="text-2xl font-bold text-gray-900">Community</h1>
          </div>

          <div className="space-y-6">
            {posts.map((post) => (
              <div key={post.id} className="bg-white rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">
                  {post.title}
                </h3>
                <p className="text-gray-600 mb-4 leading-relaxed">
                  {post.content}
                </p>
                
                <div className="flex items-center gap-6 text-gray-500">
                  <div className="flex items-center gap-2">
                    <Heart size={18} />
                    <span>{post.likes}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Bookmark size={18} />
                    <span>{post.bookmarks}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Community;
