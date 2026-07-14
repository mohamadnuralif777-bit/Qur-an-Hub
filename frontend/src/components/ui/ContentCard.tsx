import { Link } from "react-router-dom";
import type { ContentSummary } from "../../types";

interface ContentCardProps {
  content: ContentSummary;
  basePath: string;
}

export default function ContentCard({ content, basePath }: ContentCardProps) {
  const pillars: Record<string, string> = {
    quran: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300",
    hadith: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    tafsir: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300",
    sirah: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  };

  return (
    <Link to={`${basePath}/${content.slug}`} className="block group">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
        {content.cover_image && (
          <img
            src={content.cover_image}
            alt={content.title}
            className="w-full h-40 object-cover"
          />
        )}
        <div className="p-5">
          <div className="flex items-center gap-2 mb-2">
            {content.category && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${pillars[content.pillar] || ""}`}>
                {content.category}
              </span>
            )}
          </div>
          <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-gold transition-colors line-clamp-2">
            {content.title}
          </h3>
          {content.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {content.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-0.5 rounded-full">
                  #{tag}
                </span>
              ))}
            </div>
          )}
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
            {new Date(content.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </Link>
  );
}
