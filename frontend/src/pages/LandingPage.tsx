import { Link } from "react-router-dom";
import { BookOpen, MessageCircle, Star, BookMarked, Feather, Users } from "lucide-react";
import { useEffect } from "react";

const pillars = [
  {
    icon: <BookOpen className="h-8 w-8" />,
    label: "Quran",
    desc: "Explore the words of Allah with Arabic text and translations",
    to: "/quran",
    color: "from-emerald-500 to-emerald-700",
  },
  {
    icon: <Star className="h-8 w-8" />,
    label: "Hadith",
    desc: "Sayings and actions of the Prophet Muhammad ﷺ",
    to: "/hadith",
    color: "from-blue-500 to-blue-700",
  },
  {
    icon: <BookMarked className="h-8 w-8" />,
    label: "Tafsir",
    desc: "Deep interpretation and commentary of Quranic verses",
    to: "/tafsir",
    color: "from-purple-500 to-purple-700",
  },
  {
    icon: <Users className="h-8 w-8" />,
    label: "Sirah",
    desc: "Biography and history of the Prophet and early Islam",
    to: "/sirah",
    color: "from-amber-500 to-amber-700",
  },
];

export default function LandingPage() {
  useEffect(() => {
    document.title = "Quran Hub – Calm, Immersive Islamic Learning";
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-ui">
      {/* Hero */}
      <section className="relative bg-primary-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuMyIvPjwvc3ZnPg==')] bg-repeat" />
        </div>
        <div className="relative max-w-7xl mx-auto px-6 py-24 md:py-36 text-center">
          <div className="inline-flex items-center gap-2 bg-gold/20 text-gold px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Feather className="h-4 w-4" />
            Islamic Education Platform
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Calm, Immersive<br />
            <span className="text-gold">Islamic Learning</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10">
            Explore the Quran, Hadith, Tafsir, and Sirah through a beautifully designed platform built for deep reflection and understanding.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/quran"
              className="bg-gold hover:bg-gold-light text-primary-900 font-bold px-8 py-3.5 rounded-full transition-all shadow-lg hover:shadow-xl"
            >
              Start Reading
            </Link>
            <Link
              to="/ai-tutor"
              className="bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold px-8 py-3.5 rounded-full transition-all flex items-center justify-center gap-2"
            >
              <MessageCircle className="h-5 w-5" />
              AI Tutor
            </Link>
          </div>
        </div>
      </section>

      {/* 4 Pillars */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-primary-900 dark:text-white mb-3">
            Four Pillars of Knowledge
          </h2>
          <p className="text-gray-500 dark:text-gray-400 max-w-xl mx-auto">
            A comprehensive Islamic education experience across four essential domains
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((p) => (
            <Link
              key={p.label}
              to={p.to}
              className="group bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200"
            >
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${p.color} flex items-center justify-center text-white mb-4`}>
                {p.icon}
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-gold mb-2">
                {p.label}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{p.desc}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* AI Tutor CTA */}
      <section className="bg-primary-900 dark:bg-primary-900 text-white py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <MessageCircle className="h-12 w-12 text-gold mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">Ask the AI Tutor</h2>
          <p className="text-gray-300 mb-8 max-w-xl mx-auto">
            Get instant answers about Islamic topics. Our AI Tutor understands context from the content you're reading.
          </p>
          <Link
            to="/ai-tutor"
            className="bg-gold hover:bg-gold-light text-primary-900 font-bold px-8 py-3.5 rounded-full transition-all shadow-lg"
          >
            Start Conversation
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center text-gray-400 text-sm">
          <p>© {new Date().getFullYear()} Quran Hub — Built with love for the Muslim community</p>
        </div>
      </footer>
    </div>
  );
}
