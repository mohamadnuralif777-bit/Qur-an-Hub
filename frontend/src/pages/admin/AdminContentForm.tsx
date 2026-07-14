import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../../lib/api";
import { useAuth } from "../../context/AuthContext";
import SafeHtml from "../../components/ui/SafeHtml";
import LoadingSpinner from "../../components/ui/LoadingSpinner";
import ErrorMessage from "../../components/ui/ErrorMessage";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import {
  Bold, Italic, List, ListOrdered, Quote, Heading2, Heading3,
  AlignLeft, AlignCenter, AlignRight, Upload, Eye, EyeOff, ArrowLeft, Save
} from "lucide-react";

const PILLARS = ["quran", "hadith", "tafsir", "sirah"];

export default function AdminContentForm() {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    pillar: "quran",
    category: "",
    title: "",
    slug: "",
    tags: "",
    cover_image: "",
    status: "draft" as "draft" | "published",
  });
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [showPreview, setShowPreview] = useState(false);
  const [uploadMode, setUploadMode] = useState(false);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Link.configure({ openOnClick: false }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: "",
  });

  useEffect(() => {
    document.title = isEdit ? "Edit Content – Admin" : "New Content – Admin";
    if (isEdit) {
      api
        .get(`/api/admin/contents/${id}`)
        .then((r) => {
          const c = r.data;
          setFormData({
            pillar: c.pillar,
            category: c.category || "",
            title: c.title,
            slug: c.slug,
            tags: c.tags?.join(", ") || "",
            cover_image: c.cover_image || "",
            status: c.status,
          });
          editor?.commands.setContent(c.html_body);
        })
        .catch(() => setError("Failed to load content"))
        .finally(() => setLoading(false));
    }
  }, [id, isEdit, editor]);

  const handleTitleChange = (title: string) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: prev.slug || title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""),
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    const form = new FormData();
    form.append("file", file);
    try {
      const { data } = await api.post("/api/admin/upload-html", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      editor?.commands.setContent(data.html);
      setUploadMode(false);
    } catch (err: any) {
      setUploadError(err.response?.data?.detail || "Upload failed");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    const payload = {
      ...formData,
      tags: formData.tags.split(",").map((t) => t.trim()).filter(Boolean),
      html_body: editor?.getHTML() || "",
    };

    try {
      if (isEdit) {
        await api.put(`/api/admin/contents/${id}`, payload);
      } else {
        await api.post("/api/admin/contents", payload);
      }
      navigate("/admin/contents");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Failed to save content");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner className="py-20" />;

  const canPublish = user?.role === "superadmin" || user?.role === "editor";

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <button
          onClick={() => navigate("/admin/contents")}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {isEdit ? "Edit Content" : "New Content"}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Title *</label>
                <input
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  required
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Content title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Slug *</label>
                <input
                  value={formData.slug}
                  onChange={(e) => setFormData((p) => ({ ...p, slug: e.target.value }))}
                  required
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-4 py-2.5 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 font-mono"
                  placeholder="content-slug"
                />
              </div>
            </div>

            {/* Editor */}
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Content Body</div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setUploadMode(!uploadMode)}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary-600 transition-colors"
                  >
                    <Upload className="h-3.5 w-3.5" />
                    Upload HTML
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-primary-600 transition-colors"
                  >
                    {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    {showPreview ? "Editor" : "Preview"}
                  </button>
                </div>
              </div>

              {uploadMode && (
                <div className="px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-gray-100 dark:border-gray-700">
                  <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-blue-300 dark:border-blue-700 rounded-lg p-6 cursor-pointer hover:bg-blue-100/50">
                    <Upload className="h-6 w-6 text-blue-400" />
                    <span className="text-sm text-blue-600 dark:text-blue-400">Click to upload .html file</span>
                    <input type="file" accept=".html" onChange={handleFileUpload} className="hidden" />
                  </label>
                  {uploadError && <p className="text-red-500 text-xs mt-2">{uploadError}</p>}
                </div>
              )}

              {!showPreview ? (
                <>
                  {/* Toolbar */}
                  <div className="flex flex-wrap gap-1 px-3 py-2 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30">
                    {[
                      { icon: <Bold className="h-4 w-4" />, action: () => editor?.chain().focus().toggleBold().run(), active: editor?.isActive("bold") },
                      { icon: <Italic className="h-4 w-4" />, action: () => editor?.chain().focus().toggleItalic().run(), active: editor?.isActive("italic") },
                      { icon: <Heading2 className="h-4 w-4" />, action: () => editor?.chain().focus().toggleHeading({ level: 2 }).run(), active: editor?.isActive("heading", { level: 2 }) },
                      { icon: <Heading3 className="h-4 w-4" />, action: () => editor?.chain().focus().toggleHeading({ level: 3 }).run(), active: editor?.isActive("heading", { level: 3 }) },
                      { icon: <List className="h-4 w-4" />, action: () => editor?.chain().focus().toggleBulletList().run(), active: editor?.isActive("bulletList") },
                      { icon: <ListOrdered className="h-4 w-4" />, action: () => editor?.chain().focus().toggleOrderedList().run(), active: editor?.isActive("orderedList") },
                      { icon: <Quote className="h-4 w-4" />, action: () => editor?.chain().focus().toggleBlockquote().run(), active: editor?.isActive("blockquote") },
                      { icon: <AlignLeft className="h-4 w-4" />, action: () => editor?.chain().focus().setTextAlign("left").run() },
                      { icon: <AlignCenter className="h-4 w-4" />, action: () => editor?.chain().focus().setTextAlign("center").run() },
                      { icon: <AlignRight className="h-4 w-4" />, action: () => editor?.chain().focus().setTextAlign("right").run() },
                    ].map((btn, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={btn.action}
                        className={`p-1.5 rounded transition-colors ${
                          btn.active
                            ? "bg-primary-100 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300"
                            : "text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        {btn.icon}
                      </button>
                    ))}
                  </div>
                  <div className="p-4 min-h-64 prose dark:prose-invert max-w-none">
                    <EditorContent editor={editor} />
                  </div>
                </>
              ) : (
                <div className="p-4 min-h-64">
                  <SafeHtml html={editor?.getHTML() || ""} />
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-100 dark:border-gray-700 shadow-sm space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pillar *</label>
                <select
                  value={formData.pillar}
                  onChange={(e) => setFormData((p) => ({ ...p, pillar: e.target.value }))}
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {PILLARS.map((p) => (
                    <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label>
                <input
                  value={formData.category}
                  onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="e.g. Sahih Bukhari"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</label>
                <input
                  value={formData.tags}
                  onChange={(e) => setFormData((p) => ({ ...p, tags: e.target.value }))}
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="tag1, tag2, tag3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Cover Image URL</label>
                <input
                  value={formData.cover_image}
                  onChange={(e) => setFormData((p) => ({ ...p, cover_image: e.target.value }))}
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData((p) => ({ ...p, status: e.target.value as "draft" | "published" }))}
                  disabled={!canPublish}
                  className="w-full border border-gray-200 dark:border-gray-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-60"
                >
                  <option value="draft">Draft</option>
                  {canPublish && <option value="published">Published</option>}
                </select>
                {!canPublish && (
                  <p className="text-xs text-gray-400 mt-1">Contributors can only save as draft</p>
                )}
              </div>

              {error && <ErrorMessage message={error} />}

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white font-bold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <Save className="h-4 w-4" />
                {saving ? "Saving..." : isEdit ? "Save Changes" : "Create Content"}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
