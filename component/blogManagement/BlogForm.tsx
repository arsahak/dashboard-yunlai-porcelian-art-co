"use client";
import { useSidebar } from "@/lib/SidebarContext";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useState } from "react";
import {
  FaAlignCenter,
  FaAlignLeft,
  FaAlignRight,
  FaBold,
  FaCode,
  FaImage,
  FaItalic,
  FaLink,
  FaListOl,
  FaListUl,
  FaPlus,
  FaQuoteLeft,
  FaRedo,
  FaSave,
  FaStrikethrough,
  FaTimes,
  FaUnderline,
  FaUndo,
  FaUpload
} from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";

export interface BlogFormData {
  title: string;
  slug: string;
  body: string;
  excerpt: string;
  author: string;
  category: string;
  tags: string[];
  featuredImage?: File | null;
  existingImage?: string;
  status: "draft" | "published" | "archived";
  featured: boolean;
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
}

interface BlogFormProps {
  initialData?: Partial<BlogFormData>;
  onSubmit: (data: BlogFormData) => Promise<void>;
  onCancel: () => void;
  isEdit?: boolean;
}

const BlogForm = ({ initialData, onSubmit, onCancel, isEdit = false }: BlogFormProps) => {
  const { isDarkMode } = useSidebar();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  
  const [formData, setFormData] = useState<BlogFormData>({
    title: "",
    slug: "",
    body: "",
    excerpt: "",
    author: "",
    category: "",
    tags: [],
    featuredImage: null,
    status: "draft",
    featured: false,
    metaTitle: "",
    metaDescription: "",
    metaKeywords: "",
    ...initialData,
  });

  // Initialize Tiptap Editor
  const editor = useEditor({
    immediatelyRender: false, // Fix SSR hydration issues
    extensions: [
      StarterKit.configure({
        // Disable built-in extensions that we're adding separately
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Underline,
      Image.configure({
        inline: true,
        allowBase64: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline',
        },
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: formData.body,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setFormData((prev) => ({ ...prev, body: html }));
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose lg:prose-lg xl:prose-2xl focus:outline-none min-h-[400px] max-w-none ${
          isDarkMode ? 'prose-invert' : ''
        }`,
      },
    },
  });

  useEffect(() => {
    if (initialData?.existingImage) {
      setImagePreview(initialData.existingImage);
    }
  }, [initialData]);

  // Category State
  const [categories, setCategories] = useState<string[]>([]);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/blogs/categories`);
        const result = await response.json();
        if (result.success) {
          setCategories(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  // Update editor content when initialData changes
  useEffect(() => {
    if (editor && initialData?.body && editor.getHTML() !== initialData.body) {
      editor.commands.setContent(initialData.body);
    }
  }, [editor, initialData?.body]);

  const labelClass = `block text-sm font-medium mb-2 ${
    isDarkMode ? "text-gray-300" : "text-gray-700"
  }`;

  const inputClass = `w-full px-4 py-2 rounded-lg border ${
    isDarkMode
      ? "bg-gray-700 border-gray-600 text-gray-100"
      : "bg-white border-gray-300 text-gray-900"
  } focus:outline-none focus:ring-2 focus:ring-blue-500`;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData((prev) => ({ ...prev, [name]: checked }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
      
      // Auto-generate slug from title
      if (name === "title" && !isEdit) {
        const slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");
        setFormData((prev) => ({ ...prev, slug }));
      }
      
      // Auto-generate meta title from title if empty
      if (name === "title" && !formData.metaTitle) {
        setFormData((prev) => ({ ...prev, metaTitle: value }));
      }
    }
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tagsString = e.target.value;
    const tagsArray = tagsString.split(",").map((tag) => tag.trim()).filter(Boolean);
    setFormData((prev) => ({ ...prev, tags: tagsArray }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, featuredImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setFormData((prev) => ({ ...prev, featuredImage: null, existingImage: undefined }));
    setImagePreview("");
  };

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url && editor) {
      editor.chain().focus().setLink({ href: url }).run();
    }
  };

  const addImage = () => {
    const url = window.prompt('Enter image URL:');
    if (url && editor) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  if (!editor) {
    return <div>Loading editor...</div>;
  }

  const MenuButton = ({ onClick, active, children }: any) => (
    <button
      type="button"
      onClick={onClick}
      className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 ${
        active ? 'bg-gray-300 dark:bg-gray-600' : ''
      }`}
    >
      {children}
    </button>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info Card */}
          <div
            className={`p-6 rounded-lg border ${
              isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            <h2 className="text-xl font-semibold mb-4">Blog Information</h2>
            
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Enter blog title"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Slug *</label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="blog-post-slug"
                  required
                />
                <p className={`text-xs mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  URL-friendly version of the title
                </p>
              </div>

              <div>
                <label className={labelClass}>Author *</label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="Author name"
                  required
                />
              </div>

              <div>
                <label className={labelClass}>Excerpt</label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  className={inputClass}
                  rows={3}
                  placeholder="Short summary of the blog post"
                  maxLength={500}
                />
                <p className={`text-xs mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {formData.excerpt.length}/500 characters
                </p>
              </div>
            </div>
          </div>

          {/* Body Content Card with Tiptap Editor */}
          <div
            className={`p-6 rounded-lg border ${
              isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            <h2 className="text-xl font-semibold mb-4">Content *</h2>
            
            {/* Editor Toolbar */}
            <div className={`flex flex-wrap gap-1 p-2 border rounded-t-lg ${
              isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'
            }`}>
              <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')}>
                <FaBold />
              </MenuButton>
              <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')}>
                <FaItalic />
              </MenuButton>
              <MenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')}>
                <FaUnderline />
              </MenuButton>
              <MenuButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')}>
                <FaStrikethrough />
              </MenuButton>
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
              <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')}>
                <FaListUl />
              </MenuButton>
              <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')}>
                <FaListOl />
              </MenuButton>
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
              <MenuButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })}>
                <FaAlignLeft />
              </MenuButton>
              <MenuButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })}>
                <FaAlignCenter />
              </MenuButton>
              <MenuButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })}>
                <FaAlignRight />
              </MenuButton>
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
              <MenuButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')}>
                <FaQuoteLeft />
              </MenuButton>
              <MenuButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')}>
                <FaCode />
              </MenuButton>
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
              <MenuButton onClick={addLink}>
                <FaLink />
              </MenuButton>
              <MenuButton onClick={addImage}>
                <FaImage />
              </MenuButton>
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1" />
              <MenuButton onClick={() => editor.chain().focus().undo().run()}>
                <FaUndo />
              </MenuButton>
              <MenuButton onClick={() => editor.chain().focus().redo().run()}>
                <FaRedo />
              </MenuButton>
            </div>

            {/* Editor Content */}
            <div className={`border border-t-0 rounded-b-lg p-4 ${
              isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'
            }`}>
              <EditorContent editor={editor} />
            </div>
          </div>

          {/* SEO Card */}
          <div
            className={`p-6 rounded-lg border ${
              isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            <h2 className="text-xl font-semibold mb-4">SEO Meta Tags</h2>
            
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Meta Title</label>
                <input
                  type="text"
                  name="metaTitle"
                  value={formData.metaTitle}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="SEO title (recommended: 50-60 characters)"
                  maxLength={60}
                />
                <p className={`text-xs mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {formData.metaTitle.length}/60 characters
                </p>
              </div>

              <div>
                <label className={labelClass}>Meta Description</label>
                <textarea
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleChange}
                  className={inputClass}
                  rows={3}
                  placeholder="SEO description (recommended: 150-160 characters)"
                  maxLength={160}
                />
                <p className={`text-xs mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  {formData.metaDescription.length}/160 characters
                </p>
              </div>

              <div>
                <label className={labelClass}>Meta Keywords</label>
                <input
                  type="text"
                  name="metaKeywords"
                  value={formData.metaKeywords}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="keyword1, keyword2, keyword3"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status Card */}
          <div
            className={`p-6 rounded-lg border ${
              isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            <h2 className="text-xl font-semibold mb-4">Status</h2>
            
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Publish Status</label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="featured"
                  checked={formData.featured}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label className="ml-2 text-sm">
                  Mark as featured
                </label>
              </div>
            </div>
          </div>

          {/* Category & Tags Card */}
          <div
            className={`p-6 rounded-lg border ${
              isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            <h2 className="text-xl font-semibold mb-4">Organization</h2>
            
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className={labelClass}>Category</label>
                  <button
                    type="button"
                    onClick={() => setIsAddingCategory(!isAddingCategory)}
                    className={`text-xs flex items-center gap-1 px-2 py-1 rounded transition-colors ${
                      isDarkMode 
                        ? "bg-gray-700 hover:bg-gray-600 text-blue-400" 
                        : "bg-gray-100 hover:bg-gray-200 text-blue-600"
                    }`}
                  >
                    {isAddingCategory ? (
                      <>
                        <FaTimes /> Select Existing
                      </>
                    ) : (
                      <>
                        <FaPlus /> Add New
                      </>
                    )}
                  </button>
                </div>

                {isAddingCategory ? (
                  <div>
                    <input
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="Type new category name..."
                      autoFocus
                    />
                    <p className={`text-xs mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      Type a new category name to create it.
                    </p>
                  </div>
                ) : (
                  <div className="relative">
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={`${inputClass} appearance-none cursor-pointer`}
                    >
                      <option value="">-- Select Category --</option>
                      {categories.map((cat, idx) => (
                        <option key={idx} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                      <IoMdArrowDropdown size={20} />
                    </div>
                    {categories.length === 0 && !loadingCategories && (
                      <p className="text-xs text-yellow-500 mt-1">
                        No categories found. Click "Add New" to create one.
                      </p>
                    )}
                  </div>
                )}
              </div>

              <div>
                <label className={labelClass}>Tags</label>
                <input
                  type="text"
                  value={formData.tags.join(", ")}
                  onChange={handleTagsChange}
                  className={inputClass}
                  placeholder="tag1, tag2, tag3"
                />
                <p className={`text-xs mt-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  Separate tags with commas
                </p>
              </div>
            </div>
          </div>

          {/* Featured Image Card */}
          <div
            className={`p-6 rounded-lg border ${
              isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            <h2 className="text-xl font-semibold mb-4">Featured Image</h2>
            
            {imagePreview ? (
              <div className="relative">
                <img
                  src={imagePreview}
                  alt="Featured"
                  className="w-full h-48 object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                >
                  <FaTimes />
                </button>
              </div>
            ) : (
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="featured-image"
                />
                <label
                  htmlFor="featured-image"
                  className={`block border-2 border-dashed rounded-lg p-8 text-center cursor-pointer ${
                    isDarkMode
                      ? "border-gray-600 hover:bg-gray-700"
                      : "border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <FaUpload className="mx-auto text-3xl mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">Click to upload image</p>
                </label>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <FaSave />
              {loading ? "Saving..." : isEdit ? "Update Blog" : "Create Blog"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className={`px-4 py-3 rounded-lg border transition-colors ${
                isDarkMode
                  ? "border-gray-700 text-gray-300 hover:bg-gray-700"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </form>
  );
};

export default BlogForm;
