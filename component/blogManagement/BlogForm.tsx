"use client";
import { useSidebar } from "@/lib/SidebarContext";
import Color from "@tiptap/extension-color";
import Image from "@tiptap/extension-image";
import Link from "@tiptap/extension-link";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect, useRef, useState } from "react";
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
  errors?: Record<string, string>;
}

const BlogForm = ({ initialData, onSubmit, onCancel, isEdit = false, errors = {} }: BlogFormProps) => {
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

  const [headingOpen, setHeadingOpen] = useState(false);
  const headingDropdownRef = useRef<HTMLDivElement>(null);
  const [colorOpen, setColorOpen] = useState(false);
  const colorDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (headingDropdownRef.current && !headingDropdownRef.current.contains(e.target as Node)) {
        setHeadingOpen(false);
      }
      if (colorDropdownRef.current && !colorDropdownRef.current.contains(e.target as Node)) {
        setColorOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Initialize Tiptap Editor
  const editor = useEditor({
    immediatelyRender: false, // Fix SSR hydration issues
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5, 6],
        },
      }),
      Underline,
      TextStyle,
      Color,
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

  const MenuButton = ({ onClick, active, children, title }: any) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
        active ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : ''
      }`}
    >
      {children}
    </button>
  );

  const getActiveHeadingLabel = () => {
    for (let i = 1; i <= 6; i++) {
      if (editor.isActive('heading', { level: i })) return `H${i}`;
    }
    return 'P';
  };

  const SPAN_COLORS = [
    { label: 'Default', value: '' },
    { label: 'Red', value: '#ef4444' },
    { label: 'Orange', value: '#f97316' },
    { label: 'Yellow', value: '#eab308' },
    { label: 'Green', value: '#22c55e' },
    { label: 'Blue', value: '#3b82f6' },
    { label: 'Indigo', value: '#6366f1' },
    { label: 'Purple', value: '#a855f7' },
    { label: 'Pink', value: '#ec4899' },
    { label: 'Gray', value: '#6b7280' },
    { label: 'White', value: '#ffffff' },
    { label: 'Black', value: '#111827' },
  ];

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
                  className={`${inputClass} ${errors.title ? 'border-red-500' : ''}`}
                  placeholder="Enter blog title"
                  required
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                )}
              </div>

              <div>
                <label className={labelClass}>Slug *</label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleChange}
                  className={`${inputClass} ${errors.slug ? 'border-red-500' : ''}`}
                  placeholder="blog-post-slug"
                  required
                />
                {errors.slug && (
                  <p className="text-red-500 text-xs mt-1">{errors.slug}</p>
                )}
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
                  className={`${inputClass} ${errors.author ? 'border-red-500' : ''}`}
                  placeholder="Author name"
                  required
                />
                {errors.author && (
                  <p className="text-red-500 text-xs mt-1">{errors.author}</p>
                )}
              </div>

              <div>
                <label className={labelClass}>Excerpt</label>
                <textarea
                  name="excerpt"
                  value={formData.excerpt}
                  onChange={handleChange}
                  className={`${inputClass} ${errors.excerpt ? 'border-red-500' : ''}`}
                  rows={3}
                  placeholder="Short summary of the blog post (minimum 10 characters)"
                  maxLength={500}
                />
                {errors.excerpt && (
                  <p className="text-red-500 text-xs mt-1">{errors.excerpt}</p>
                )}
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
            <h2 className="text-xl font-semibold mb-4">Content <span className="text-red-500">*</span></h2>
            {errors.body && (
              <p className="text-red-500 text-sm mb-3">{errors.body}</p>
            )}
            
            {/* Editor Toolbar */}
            <div className={`flex flex-wrap gap-1 p-2 border rounded-t-lg ${
              isDarkMode ? 'bg-gray-700 border-gray-600' : 'bg-gray-50 border-gray-300'
            }`}>

              {/* Heading / Paragraph Dropdown */}
              <div className="relative" ref={headingDropdownRef}>
                <button
                  type="button"
                  onClick={() => setHeadingOpen((v) => !v)}
                  title="Text style"
                  className={`flex items-center gap-1 px-2 py-1.5 rounded text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors min-w-[52px] ${
                    isDarkMode ? 'text-gray-100' : 'text-gray-800'
                  }`}
                >
                  <span>{getActiveHeadingLabel()}</span>
                  <IoMdArrowDropdown />
                </button>
                {headingOpen && (
                  <div className={`absolute left-0 top-full mt-1 z-50 rounded-lg shadow-lg border min-w-[140px] ${
                    isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
                  }`}>
                    <button
                      type="button"
                      onClick={() => { editor.chain().focus().setParagraph().run(); setHeadingOpen(false); }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-t-lg ${
                        editor.isActive('paragraph') ? 'font-bold text-blue-600 dark:text-blue-400' : ''
                      }`}
                    >
                      <span className="text-sm">Paragraph &lt;p&gt;</span>
                    </button>
                    {([1, 2, 3, 4, 5, 6] as const).map((level) => (
                      <button
                        key={level}
                        type="button"
                        onClick={() => { editor.chain().focus().toggleHeading({ level }).run(); setHeadingOpen(false); }}
                        className={`w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                          level === 6 ? 'rounded-b-lg' : ''
                        } ${editor.isActive('heading', { level }) ? 'font-bold text-blue-600 dark:text-blue-400' : ''}`}
                        style={{ fontSize: `${Math.max(11, 20 - (level - 1) * 2)}px`, fontWeight: level <= 3 ? 700 : 500 }}
                      >
                        H{level} &lt;h{level}&gt;
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1 self-center" />

              <MenuButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
                <FaBold />
              </MenuButton>
              <MenuButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
                <FaItalic />
              </MenuButton>
              <MenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">
                <FaUnderline />
              </MenuButton>
              <MenuButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
                <FaStrikethrough />
              </MenuButton>

              {/* Span / Text Color */}
              <div className="relative" ref={colorDropdownRef}>
                <button
                  type="button"
                  onClick={() => setColorOpen((v) => !v)}
                  title="Text color (span)"
                  className={`flex items-center gap-1 px-2 py-1.5 rounded text-sm font-mono hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
                    isDarkMode ? 'text-gray-100' : 'text-gray-800'
                  }`}
                >
                  <span
                    style={{ color: (editor.getAttributes('textStyle').color as string) || 'currentColor' }}
                    className="font-bold text-base leading-none"
                  >
                    A
                  </span>
                  <div
                    className="w-3 h-1 rounded-sm mt-0.5"
                    style={{ backgroundColor: (editor.getAttributes('textStyle').color as string) || '#6b7280' }}
                  />
                  <IoMdArrowDropdown />
                </button>
                {colorOpen && (
                  <div className={`absolute left-0 top-full mt-1 z-50 rounded-lg shadow-lg border p-2 ${
                    isDarkMode ? 'bg-gray-800 border-gray-600' : 'bg-white border-gray-200'
                  }`}>
                    <p className={`text-xs mb-2 px-1 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                      Text Color &lt;span&gt;
                    </p>
                    <div className="grid grid-cols-4 gap-1.5 min-w-[160px]">
                      {SPAN_COLORS.map(({ label, value }) => (
                        <button
                          key={label}
                          type="button"
                          title={label}
                          onClick={() => {
                            if (value === '') {
                              editor.chain().focus().unsetColor().run();
                            } else {
                              editor.chain().focus().setColor(value).run();
                            }
                            setColorOpen(false);
                          }}
                          className={`w-8 h-8 rounded border-2 hover:scale-110 transition-transform flex items-center justify-center ${
                            (editor.getAttributes('textStyle').color as string) === value
                              ? 'border-blue-500'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                          style={{ backgroundColor: value || (isDarkMode ? '#374151' : '#f3f4f6') }}
                        >
                          {value === '' && (
                            <span className={`text-xs font-bold ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>×</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1 self-center" />
              <MenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet list">
                <FaListUl />
              </MenuButton>
              <MenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered list">
                <FaListOl />
              </MenuButton>
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1 self-center" />
              <MenuButton onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align left">
                <FaAlignLeft />
              </MenuButton>
              <MenuButton onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align center">
                <FaAlignCenter />
              </MenuButton>
              <MenuButton onClick={() => editor.chain().focus().setTextAlign('right').run()} active={editor.isActive({ textAlign: 'right' })} title="Align right">
                <FaAlignRight />
              </MenuButton>
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1 self-center" />
              <MenuButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">
                <FaQuoteLeft />
              </MenuButton>
              <MenuButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code block">
                <FaCode />
              </MenuButton>
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1 self-center" />
              <MenuButton onClick={addLink} title="Add link">
                <FaLink />
              </MenuButton>
              <MenuButton onClick={addImage} title="Add image">
                <FaImage />
              </MenuButton>
              <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1 self-center" />
              <MenuButton onClick={() => editor.chain().focus().undo().run()} title="Undo">
                <FaUndo />
              </MenuButton>
              <MenuButton onClick={() => editor.chain().focus().redo().run()} title="Redo">
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
                  <label className={labelClass}>Category <span className="text-red-500">*</span></label>
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
                {errors.category && (
                  <p className="text-red-500 text-xs mt-1">{errors.category}</p>
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
            {errors.featuredImage && (
              <p className="text-red-500 text-sm mb-3">{errors.featuredImage}</p>
            )}
            
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
                  accept="image/jpeg,image/jpg,image/png,image/webp"
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
                  } ${errors.featuredImage ? 'border-red-500' : ''}`}
                >
                  <FaUpload className="mx-auto text-3xl mb-2 text-gray-400" />
                  <p className="text-sm text-gray-500">Click to upload image</p>
                  <p className="text-xs text-gray-400 mt-2">Max size: 1MB | Formats: JPG, JPEG, PNG, WEBP</p>
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
