import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../lib/api";
import type { ContentSummary, PaginatedResponse } from "../types";
import ContentCard from "../components/ui/ContentCard";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ErrorMessage from "../components/ui/ErrorMessage";
import { Search } from "lucide-react";

export default function SearchPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const q = searchParams.get("q") || "";
  const [query, setQuery] = useState(q);
  const [data, setData] = useState<PaginatedResponse<ContentSummary> | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    document.title = q ? `Search: "${q}" – Quran Hub` : "Search – Quran Hub";
  }, [q]);

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    setError("");
    api
      .get("/api/contents", { params: { q, limit: 40 } })
      .then((r) => setData(r.data))
      .catch(() => setError("Search failed. Please try again."))
      .finally(() => setLoading(false));
  }, [q]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) setSearchParams({ q: query.trim() });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-ui">
      <div className="bg-primary-900 text-white py-12 px-6">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Search</h1>
          <form onSubmit={handleSearch}>
            <div className="relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search across Quran, Hadith, Tafsir, Sirah..."
                className="w-full bg-white text-gray-900 rounded-full px-6 py-4 pr-14 text-lg focus:outline-none focus:ring-4 focus:ring-gold/30"
              />
              <button type="submit" className="absolute right-4 top-1/2 -translate-y-1/2 bg-primary-600 text-white p-2 rounded-full hover:bg-primary-500 transition-colors">
                <Search className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {loading && <LoadingSpinner className="py-20" />}
        {error && <ErrorMessage message={error} />}
        {!loading && !error && q && data && (
          <>
            <p className="text-gray-500 dark:text-gray-400 mb-6 text-sm">
              {data.total} result{data.total !== 1 ? "s" : ""} for "<strong>{q}</strong>"
            </p>
            {data.items.length === 0 ? (
              <div className="text-center py-20 text-gray-400">
                <Search className="h-16 w-16 mx-auto mb-4 opacity-30" />
                <p className="text-lg">No results found</p>
                <p className="text-sm mt-2">Try different keywords</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {data.items.map((item) => (
                  <ContentCard key={item.id} content={item} basePath={`/${item.pillar}`} />
                ))}
              </div>
            )}
          </>
        )}
        {!q && (
          <div className="text-center py-20 text-gray-400">
            <Search className="h-16 w-16 mx-auto mb-4 opacity-30" />
            <p className="text-lg">Enter a search term above</p>
          </div>
        )}
      </div>
    </div>
  );
}
