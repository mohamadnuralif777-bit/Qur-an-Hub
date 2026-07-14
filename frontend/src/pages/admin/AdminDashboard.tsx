import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../../lib/api";
import { BookOpen, Star, BookMarked, Users, Plus, Activity } from "lucide-react";
import LoadingSpinner from "../../components/ui/LoadingSpinner";

interface DashboardData {
  content_counts: Record<string, number>;
  total_contents: number;
  recent_activity: Array<{
    user_id: string;
    action: string;
    resource_type: string;
    resource_id: string;
    timestamp: string;
  }>;
}

const pillarIcons: Record<string, React.ReactNode> = {
  quran: <BookOpen className="h-6 w-6" />,
  hadith: <Star className="h-6 w-6" />,
  tafsir: <BookMarked className="h-6 w-6" />,
  sirah: <Users className="h-6 w-6" />,
};

const pillarColors: Record<string, string> = {
  quran: "bg-emerald-500",
  hadith: "bg-blue-500",
  tafsir: "bg-purple-500",
  sirah: "bg-amber-500",
};

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = "Dashboard – Quran Hub Admin";
    api
      .get("/api/admin/dashboard")
      .then((r) => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingSpinner className="py-20" />;
  if (!data) return null;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <Link
          to="/admin/contents/new"
          className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <Plus className="h-4 w-4" /> New Content
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Object.entries(data.content_counts).map(([pillar, count]) => (
          <Link
            key={pillar}
            to={`/admin/contents?pillar=${pillar}`}
            className="bg-white dark:bg-gray-800 rounded-xl p-5 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all group"
          >
            <div className={`w-10 h-10 ${pillarColors[pillar]} rounded-xl flex items-center justify-center text-white mb-3`}>
              {pillarIcons[pillar]}
            </div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{count}</div>
            <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">{pillar} entries</div>
          </Link>
        ))}
      </div>

      {/* Recent activity */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 p-6">
        <h2 className="font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
          <Activity className="h-5 w-5 text-primary-600" />
          Recent Activity
        </h2>
        {data.recent_activity.length === 0 ? (
          <p className="text-gray-400 text-sm">No activity yet</p>
        ) : (
          <div className="space-y-3">
            {data.recent_activity.map((log, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                  <Activity className="h-4 w-4 text-primary-600" />
                </div>
                <div className="flex-1">
                  <span className="font-medium capitalize">{log.action}</span>{" "}
                  <span className="text-gray-500">{log.resource_type}</span>
                </div>
                <span className="text-gray-400 text-xs">
                  {new Date(log.timestamp).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
