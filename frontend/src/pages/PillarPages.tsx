import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../lib/api";
import type { ContentSummary, Content, PaginatedResponse } from "../types";
import ContentCard from "../components/ui/ContentCard";
import SafeHtml from "../components/ui/SafeHtml";
import LoadingSpinner from "../components/ui/LoadingSpinner";
import ErrorMessage from "../components/ui/ErrorMessage";
import { ArrowLeft, MessageCircle, Tag } from "lucide-react";

interface PillarPageProps {
  pillar: "quran" | "hadith" | "tafsir" | "sirah";
  title: string;
  description: string;
  color: string;
}

export function PillarListPage({ pillar, title, description, color }: PillarPageProps) {
  const [data, setData] = useState<PaginatedResponse<ContentSummary> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  useEffect(() => {
    document.title = `${title} – Quran Hub`;
  }, [title]);

  useEffect(() => {
    setLoading(true);
    api
      .get("/api/contents", { params: { pillar, page, limit: 20 } })
      .then((r) => setData(r.data))
      .catch(() => setError("Failed to load content"))
      .finally(() => setLoading(false));
  }, [pillar, page]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-ui">
      <div className={`${color} text-white py-12 px-6`}>
        <div className="max-w-7xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-2 text-white/70 hover:text-white mb-4 text-sm transition-colors">
            <ArrowLeft className="h-4 w-4" /> Home
          </Link>
          <h1 className="text-4xl font-bold mb-2">{title}</h1>
          <p className="text-white/80">{description}</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        {loading && <LoadingSpinner className="py-20" />}
        {error && <ErrorMessage message={error} />}
        {!loading && !error && data?.items.length === 0 && (
          <div className="text-center py-20 text-gray-400">
            <p className="text-lg">No content available yet.</p>
            <p className="text-sm mt-2">Check back soon!</p>
          </div>
        )}
        {!loading && !error && data && data.items.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {data.items.map((item) => (
                <ContentCard key={item.id} content={item} basePath={`/${pillar}`} />
              ))}
            </div>

            {data.pages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: data.pages }, (_, i) => (
                  <button
                    key={i + 1}
                    onClick={() => setPage(i + 1)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                      page === i + 1
                        ? "bg-primary-600 text-white"
                        : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export function PillarDetailPage({ pillar }: { pillar: string }) {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    api
      .get(`/api/contents/${slug}`)
      .then((r) => {
        setContent(r.data);
        document.title = `${r.data.title} – Quran Hub`;
      })
      .catch((e) => {
        if (e.response?.status === 404) {
          setError("Content not found");
        } else {
          setError("Failed to load content");
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <LoadingSpinner className="py-40" size="lg" />;
  if (error) return (
    <div className="max-w-3xl mx-auto px-6 py-20">
      <ErrorMessage message={error} />
      <button onClick={() => navigate(-1)} className="mt-4 text-primary-600 hover:underline flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" /> Go back
      </button>
    </div>
  );
  if (!content) return null;

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 font-ui">
      <div className="max-w-3xl mx-auto px-6 py-10">
        <Link to={`/${pillar}`} className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-6 text-sm transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to {pillar.charAt(0).toUpperCase() + pillar.slice(1)}
        </Link>

        {content.cover_image && (
          <img src={content.cover_image} alt={content.title} className="w-full h-56 object-cover rounded-xl mb-6" />
        )}

        <div className="mb-6">
          {content.category && (
            <span className="text-sm text-primary-600 dark:text-gold font-medium">{content.category}</span>
          )}
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mt-1 mb-3">
            {content.title}
          </h1>
          <p className="text-sm text-gray-400">
            {new Date(content.created_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
          </p>

          {content.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {content.tags.map((tag) => (
                <span key={tag} className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 dark:text-gray-400 px-2 py-0.5 rounded-full">
                  <Tag className="h-3 w-3" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        <hr className="border-gray-100 dark:border-gray-800 mb-8" />

        <SafeHtml html={content.html_body} className="text-gray-700 dark:text-gray-300 leading-relaxed" />

        {/* AI Tutor CTA */}
        <div className="mt-12 bg-primary-900 dark:bg-primary-900 text-white rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-lg">Have a question?</h3>
            <p className="text-gray-300 text-sm">Ask the AI Tutor about this content</p>
          </div>
          <Link
            to={`/ai-tutor?context=${content.id}`}
            className="bg-gold hover:bg-gold-light text-primary-900 font-bold px-6 py-2.5 rounded-full transition-all flex items-center gap-2 whitespace-nowrap"
          >
            <MessageCircle className="h-4 w-4" />
            Ask AI Tutor
          </Link>
        </div>
      </div>
    </div>
  );
}
