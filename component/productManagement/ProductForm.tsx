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
import { useRouter } from "next/navigation";
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
  FaTrash,
  FaUnderline,
  FaUndo,
  FaUpload,
} from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";
import { ValidationErrors } from "./ProductAdd";

// Color Variant Interface
export interface ColorVariant {
  color: string;
  colorCode?: string;
  images: File[];
  existingImages?: string[];
}

// Size Variant Interface
export interface SizeVariant {
  size: string;
  price: number;
  stock: number;
  sku?: string;
}

export interface ProductFormData {
  name: string;
  sku: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  category?: string; // Simple text field for category
  status: "active" | "draft" | "archived";
  description: string;
  images: File[];
  existingImages?: string[];
  featured: boolean;
  badges: string[];  // Array of badges: featured, best-seller, new-arrival, offer, trending
  colorVariants?: ColorVariant[];
  sizeVariants?: SizeVariant[];
}

interface ProductFormProps {
  initialData?: ProductFormData;
  onSubmit: (data: ProductFormData) => void;
  title: string;
  isSubmitting?: boolean;
  errors?: ValidationErrors;
}

const ProductForm = ({
  initialData,
  onSubmit,
  title,
  isSubmitting = false,
  errors = {},
}: ProductFormProps) => {
  const { isDarkMode } = useSidebar();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Category State (from Category model)
  const [categories, setCategories] = useState<Array<{ _id: string; title: string }>>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/categories?status=active`);
        const result = await response.json();
        if (result.success && result.data) {
          setCategories(result.data.map((c: any) => ({ _id: c._id, title: c.title })));
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const [formData, setFormData] = useState<ProductFormData>(
    initialData || {
      name: "",
      sku: "",
      price: 0,
      compareAtPrice: 0,
      stock: 0,
      category: "",
      status: "draft",
      description: "",
      images: [],
      existingImages: [],
      featured: false,
      badges: [],
      colorVariants: [],
      sizeVariants: [],
    }
  );

  const [activeVariantTab, setActiveVariantTab] = useState<"colors" | "sizes">("colors");

  // --- Tiptap editor for description ---
  const [headingOpen, setHeadingOpen] = useState(false);
  const headingDropdownRef = useRef<HTMLDivElement>(null);
  const [colorOpen, setColorOpen] = useState(false);
  const colorDropdownRef = useRef<HTMLDivElement>(null);

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

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3, 4, 5, 6] } }),
      Underline,
      TextStyle,
      Color,
      Image.configure({ inline: true, allowBase64: true }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-blue-500 underline" },
      }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: formData.description,
    onUpdate: ({ editor }) => {
      setFormData((prev) => ({ ...prev, description: editor.getHTML() }));
    },
    editorProps: {
      attributes: {
        class: `prose prose-sm sm:prose lg:prose-lg focus:outline-none min-h-[200px] max-w-none ${
          isDarkMode ? "prose-invert" : ""
        }`,
      },
    },
  });

  // Sync editor when editing existing product
  useEffect(() => {
    if (editor && initialData?.description && editor.getHTML() !== initialData.description) {
      editor.commands.setContent(initialData.description);
    }
  }, [editor, initialData?.description]);

  const addDescriptionLink = () => {
    const url = window.prompt("Enter URL:");
    if (url && editor) editor.chain().focus().setLink({ href: url }).run();
  };

  const addDescriptionImage = () => {
    const url = window.prompt("Enter image URL:");
    if (url && editor) editor.chain().focus().setImage({ src: url }).run();
  };

  const getActiveHeadingLabel = () => {
    if (!editor) return "P";
    for (let i = 1; i <= 6; i++) {
      if (editor.isActive("heading", { level: i })) return `H${i}`;
    }
    return "P";
  };

  const SPAN_COLORS = [
    { label: "Default", value: "" },
    { label: "Red", value: "#ef4444" },
    { label: "Orange", value: "#f97316" },
    { label: "Yellow", value: "#eab308" },
    { label: "Green", value: "#22c55e" },
    { label: "Blue", value: "#3b82f6" },
    { label: "Indigo", value: "#6366f1" },
    { label: "Purple", value: "#a855f7" },
    { label: "Pink", value: "#ec4899" },
    { label: "Gray", value: "#6b7280" },
    { label: "White", value: "#ffffff" },
    { label: "Black", value: "#111827" },
  ];

  const EditorMenuButton = ({ onClick, active, children, title }: any) => (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
        active ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300" : ""
      }`}
    >
      {children}
    </button>
  );
  // --- end editor helpers ---

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number"
          ? parseFloat(value)
          : type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFormData((prev) => ({
        ...prev,
        images: [...prev.images, ...newFiles],
      }));
    }
  };

  const removeFile = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
    }));
  };

  const removeExistingImage = (url: string) => {
    setFormData((prev) => ({
      ...prev,
      existingImages: prev.existingImages?.filter((img) => img !== url) || [],
    }));
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  // Color Variant Handlers
  const addColorVariant = () => {
    setFormData((prev) => ({
      ...prev,
      colorVariants: [
        ...(prev.colorVariants || []),
        { color: "", colorCode: "", images: [], existingImages: [] },
      ],
    }));
  };

  const removeColorVariant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      colorVariants: prev.colorVariants?.filter((_, i) => i !== index) || [],
    }));
  };

  const updateColorVariant = (index: number, field: keyof ColorVariant, value: any) => {
    setFormData((prev) => ({
      ...prev,
      colorVariants: prev.colorVariants?.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant
      ) || [],
    }));
  };

  const handleColorVariantImageChange = (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const currentVariant = formData.colorVariants?.[index];
      if (currentVariant) {
        updateColorVariant(index, "images", [...currentVariant.images, ...newFiles]);
      }
    }
  };

  const removeColorVariantImage = (variantIndex: number, imageIndex: number) => {
    const currentVariant = formData.colorVariants?.[variantIndex];
    if (currentVariant) {
      updateColorVariant(
        variantIndex,
        "images",
        currentVariant.images.filter((_, i) => i !== imageIndex)
      );
    }
  };

  // Size Variant Handlers
  const addSizeVariant = () => {
    setFormData((prev) => ({
      ...prev,
      sizeVariants: [
        ...(prev.sizeVariants || []),
        { size: "", price: 0, stock: 0, sku: "" },
      ],
    }));
  };

  const removeSizeVariant = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      sizeVariants: prev.sizeVariants?.filter((_, i) => i !== index) || [],
    }));
  };

  const updateSizeVariant = (index: number, field: keyof SizeVariant, value: any) => {
    setFormData((prev) => ({
      ...prev,
      sizeVariants: prev.sizeVariants?.map((variant, i) =>
        i === index ? { ...variant, [field]: value } : variant
      ) || [],
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const inputClass = `w-full px-4 py-2 rounded-lg border ${
    isDarkMode
      ? "bg-gray-800 border-gray-700 text-gray-100"
      : "bg-white border-gray-300 text-gray-900"
  } focus:outline-none focus:ring-2 focus:ring-blue-500`;

  const labelClass = `block text-sm font-medium mb-1 ${
    isDarkMode ? "text-gray-400" : "text-gray-700"
  }`;

  return (
    <div
      className={`min-h-screen p-6 ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-2">{title}</h1>
          <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
            {initialData ? "Update product information" : "Add a new product to your inventory"}
          </p>
        </div>
        <div className="flex gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                 isDarkMode
                  ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                  : "border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <FaTimes /> Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              <FaSave /> {isSubmitting ? "Saving..." : "Save Product"}
            </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* General Information Card */}
          <div
            className={`p-6 rounded-lg border ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <h2 className="text-xl font-semibold mb-4">
              General Information
            </h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>Product Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`${inputClass} ${errors.name ? 'border-red-500' : ''}`}
                  placeholder="e.g. Ceramic Vase"
                  required
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">{errors.name}</p>
                )}
              </div>
              <div>
                <label className={labelClass}>
                  Description <span className="text-red-500">*</span>
                </label>
                {errors.description && (
                  <p className="text-red-500 text-sm mb-2">{errors.description}</p>
                )}
                {/* Toolbar */}
                <div
                  className={`flex flex-wrap gap-1 p-2 border rounded-t-lg ${
                    isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"
                  } ${errors.description ? "border-red-500" : ""}`}
                >
                  {/* Heading / Paragraph Dropdown */}
                  <div className="relative" ref={headingDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setHeadingOpen((v) => !v)}
                      title="Text style"
                      className={`flex items-center gap-1 px-2 py-1.5 rounded text-sm font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors min-w-[52px] ${
                        isDarkMode ? "text-gray-100" : "text-gray-800"
                      }`}
                    >
                      <span>{getActiveHeadingLabel()}</span>
                      <IoMdArrowDropdown />
                    </button>
                    {headingOpen && editor && (
                      <div
                        className={`absolute left-0 top-full mt-1 z-50 rounded-lg shadow-lg border min-w-[140px] ${
                          isDarkMode ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => { editor.chain().focus().setParagraph().run(); setHeadingOpen(false); }}
                          className={`w-full text-left px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors rounded-t-lg ${
                            editor.isActive("paragraph") ? "font-bold text-blue-600 dark:text-blue-400" : ""
                          }`}
                        >
                          Paragraph &lt;p&gt;
                        </button>
                        {([1, 2, 3, 4, 5, 6] as const).map((level) => (
                          <button
                            key={level}
                            type="button"
                            onClick={() => { editor.chain().focus().toggleHeading({ level }).run(); setHeadingOpen(false); }}
                            className={`w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                              level === 6 ? "rounded-b-lg" : ""
                            } ${editor.isActive("heading", { level }) ? "font-bold text-blue-600 dark:text-blue-400" : ""}`}
                            style={{ fontSize: `${Math.max(11, 20 - (level - 1) * 2)}px`, fontWeight: level <= 3 ? 700 : 500 }}
                          >
                            H{level} &lt;h{level}&gt;
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1 self-center" />

                  {editor && (
                    <>
                      <EditorMenuButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive("bold")} title="Bold"><FaBold /></EditorMenuButton>
                      <EditorMenuButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive("italic")} title="Italic"><FaItalic /></EditorMenuButton>
                      <EditorMenuButton onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive("underline")} title="Underline"><FaUnderline /></EditorMenuButton>
                      <EditorMenuButton onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive("strike")} title="Strikethrough"><FaStrikethrough /></EditorMenuButton>
                    </>
                  )}

                  {/* Text Color / Span */}
                  <div className="relative" ref={colorDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setColorOpen((v) => !v)}
                      title="Text color (span)"
                      className={`flex items-center gap-1 px-2 py-1.5 rounded text-sm hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors ${
                        isDarkMode ? "text-gray-100" : "text-gray-800"
                      }`}
                    >
                      <span
                        style={{ color: (editor?.getAttributes("textStyle").color as string) || "currentColor" }}
                        className="font-bold text-base leading-none"
                      >A</span>
                      <div
                        className="w-3 h-1 rounded-sm mt-0.5"
                        style={{ backgroundColor: (editor?.getAttributes("textStyle").color as string) || "#6b7280" }}
                      />
                      <IoMdArrowDropdown />
                    </button>
                    {colorOpen && editor && (
                      <div
                        className={`absolute left-0 top-full mt-1 z-50 rounded-lg shadow-lg border p-2 ${
                          isDarkMode ? "bg-gray-800 border-gray-600" : "bg-white border-gray-200"
                        }`}
                      >
                        <p className={`text-xs mb-2 px-1 font-medium ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                          Text Color &lt;span&gt;
                        </p>
                        <div className="grid grid-cols-4 gap-1.5 min-w-[160px]">
                          {SPAN_COLORS.map(({ label, value }) => (
                            <button
                              key={label}
                              type="button"
                              title={label}
                              onClick={() => {
                                if (value === "") { editor.chain().focus().unsetColor().run(); }
                                else { editor.chain().focus().setColor(value).run(); }
                                setColorOpen(false);
                              }}
                              className={`w-8 h-8 rounded border-2 hover:scale-110 transition-transform flex items-center justify-center ${
                                (editor.getAttributes("textStyle").color as string) === value
                                  ? "border-blue-500"
                                  : "border-gray-300 dark:border-gray-600"
                              }`}
                              style={{ backgroundColor: value || (isDarkMode ? "#374151" : "#f3f4f6") }}
                            >
                              {value === "" && (
                                <span className={`text-xs font-bold ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>×</span>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1 self-center" />

                  {editor && (
                    <>
                      <EditorMenuButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive("bulletList")} title="Bullet list"><FaListUl /></EditorMenuButton>
                      <EditorMenuButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive("orderedList")} title="Ordered list"><FaListOl /></EditorMenuButton>
                      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1 self-center" />
                      <EditorMenuButton onClick={() => editor.chain().focus().setTextAlign("left").run()} active={editor.isActive({ textAlign: "left" })} title="Align left"><FaAlignLeft /></EditorMenuButton>
                      <EditorMenuButton onClick={() => editor.chain().focus().setTextAlign("center").run()} active={editor.isActive({ textAlign: "center" })} title="Align center"><FaAlignCenter /></EditorMenuButton>
                      <EditorMenuButton onClick={() => editor.chain().focus().setTextAlign("right").run()} active={editor.isActive({ textAlign: "right" })} title="Align right"><FaAlignRight /></EditorMenuButton>
                      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1 self-center" />
                      <EditorMenuButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive("blockquote")} title="Blockquote"><FaQuoteLeft /></EditorMenuButton>
                      <EditorMenuButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive("codeBlock")} title="Code block"><FaCode /></EditorMenuButton>
                      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1 self-center" />
                      <EditorMenuButton onClick={addDescriptionLink} title="Add link"><FaLink /></EditorMenuButton>
                      <EditorMenuButton onClick={addDescriptionImage} title="Add image"><FaImage /></EditorMenuButton>
                      <div className="w-px h-6 bg-gray-300 dark:bg-gray-600 mx-1 self-center" />
                      <EditorMenuButton onClick={() => editor.chain().focus().undo().run()} title="Undo"><FaUndo /></EditorMenuButton>
                      <EditorMenuButton onClick={() => editor.chain().focus().redo().run()} title="Redo"><FaRedo /></EditorMenuButton>
                    </>
                  )}
                </div>

                {/* Editor Content */}
                <div
                  className={`border border-t-0 rounded-b-lg p-4 ${
                    isDarkMode ? "bg-gray-700 border-gray-600" : "bg-white border-gray-300"
                  } ${errors.description ? "border-red-500" : ""}`}
                >
                  {editor ? (
                    <EditorContent editor={editor} />
                  ) : (
                    <div className="min-h-[200px] text-gray-400 text-sm">Loading editor...</div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Media Card */}
          <div
            className={`p-6 rounded-lg border ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <h2 className="text-xl font-semibold mb-4">Media <span className="text-red-500">*</span></h2>
            <div
              onClick={handleUploadClick}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-opacity-50 transition-colors ${
                isDarkMode
                  ? "border-gray-700 bg-gray-900 hover:bg-gray-800"
                  : "border-gray-300 bg-gray-50 hover:bg-gray-100"
              } ${errors.images ? 'border-red-500' : ''}`}
            >
              <FaUpload className="mx-auto text-4xl mb-2 text-gray-400" />
              <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                Drag and drop images here, or click to upload
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Max size: 1MB | Formats: JPG, JPEG, PNG, WEBP
              </p>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden" 
                multiple 
                accept="image/jpeg,image/jpg,image/png,image/webp"
              />
            </div>
            {errors.images && (
              <p className="text-red-500 text-xs mt-2">{errors.images}</p>
            )}
             {/* Preview Images */}
            {(formData.existingImages?.length || 0) > 0 || formData.images.length > 0 ? (
              <div className="mt-4 grid grid-cols-4 gap-4">
                {/* Existing Images */}
                {formData.existingImages?.map((url, idx) => (
                  <div key={`existing-${idx}`} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                    <img
                      src={url}
                      alt={`existing ${idx}`}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removeExistingImage(url)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FaTrash size={12} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 text-center">
                        Existing
                    </div>
                  </div>
                ))}
                {/* New Files */}
                {formData.images.map((file, idx) => (
                  <div key={`new-${idx}`} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`preview ${idx}`}
                      className="w-full h-full object-cover"
                    />
                     <button
                      type="button"
                      onClick={() => removeFile(idx)}
                      className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <FaTrash size={12} />
                    </button>
                    <div className="absolute bottom-0 left-0 right-0 bg-green-600 bg-opacity-70 text-white text-xs p-1 text-center">
                        New
                    </div>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          {/* Variants Card */}
          <div
            className={`p-6 rounded-lg border ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <h2 className="text-xl font-semibold mb-4">Product Variants</h2>
            
            {/* Variant Tabs */}
            <div className="flex gap-2 mb-4">
              <button
                type="button"
                onClick={() => setActiveVariantTab("colors")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeVariantTab === "colors"
                    ? "bg-blue-600 text-white"
                    : isDarkMode
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Colors ({formData.colorVariants?.length || 0})
              </button>
              <button
                type="button"
                onClick={() => setActiveVariantTab("sizes")}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  activeVariantTab === "sizes"
                    ? "bg-blue-600 text-white"
                    : isDarkMode
                    ? "bg-gray-700 text-gray-300 hover:bg-gray-600"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                Sizes ({formData.sizeVariants?.length || 0})
              </button>
            </div>
            {errors.colorVariants && activeVariantTab === "colors" && (
              <p className="text-red-500 text-sm mb-3">{errors.colorVariants}</p>
            )}
            {errors.sizeVariants && activeVariantTab === "sizes" && (
              <p className="text-red-500 text-sm mb-3">{errors.sizeVariants}</p>
            )}

            {/* Color Variants */}
            {activeVariantTab === "colors" && (
              <div className="space-y-4">
                {formData.colorVariants?.map((variant, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">Color {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeColorVariant(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className={`${labelClass} text-xs`}>Color Name</label>
                        <input
                          type="text"
                          value={variant.color}
                          onChange={(e) => updateColorVariant(index, "color", e.target.value)}
                          className={`${inputClass} text-sm`}
                          placeholder="e.g. Red"
                        />
                      </div>
                      <div>
                        <label className={`${labelClass} text-xs`}>Color Code (Optional)</label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={variant.colorCode || "#000000"}
                            onChange={(e) => updateColorVariant(index, "colorCode", e.target.value)}
                            className="w-12 h-10 rounded cursor-pointer"
                          />
                          <input
                            type="text"
                            value={variant.colorCode || ""}
                            onChange={(e) => updateColorVariant(index, "colorCode", e.target.value)}
                            className={`${inputClass} text-sm flex-1`}
                            placeholder="#FF0000"
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Color Images */}
                    <div className="mt-3">
                      <label className={`${labelClass} text-xs`}>Images for this color</label>
                      <div className="mt-2">
                        <input
                          type="file"
                          multiple
                          accept="image/*"
                          onChange={(e) => handleColorVariantImageChange(index, e)}
                          className="hidden"
                          id={`color-images-${index}`}
                        />
                        <label
                          htmlFor={`color-images-${index}`}
                          className={`block border-2 border-dashed rounded-lg p-4 text-center cursor-pointer ${
                            isDarkMode
                              ? "border-gray-600 hover:bg-gray-600"
                              : "border-gray-300 hover:bg-gray-100"
                          }`}
                        >
                          <FaUpload className="mx-auto text-xl mb-1 text-gray-400" />
                          <p className="text-xs text-gray-500">Click to upload images</p>
                        </label>
                        
                        {/* Existing Images */}
                        {variant.existingImages && variant.existingImages.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-500 mb-2">Existing Images</p>
                            <div className="grid grid-cols-4 gap-2">
                              {variant.existingImages.map((url, imgIndex) => (
                                <div key={`existing-${imgIndex}`} className="relative aspect-square rounded overflow-hidden border">
                                  <img
                                    src={url}
                                    alt={`${variant.color} existing ${imgIndex}`}
                                    className="w-full h-full object-cover"
                                  />
                                  <div className="absolute bottom-0 left-0 right-0 bg-blue-600 bg-opacity-70 text-white text-xs p-1 text-center">
                                    Existing
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* New Images */}
                        {variant.images.length > 0 && (
                          <div className="mt-3">
                            <p className="text-xs text-gray-500 mb-2">New Images</p>
                            <div className="grid grid-cols-4 gap-2">
                              {variant.images.map((file, imgIndex) => (
                                <div key={imgIndex} className="relative aspect-square rounded overflow-hidden border group">
                                  <img
                                    src={URL.createObjectURL(file)}
                                    alt={`color ${index} image ${imgIndex}`}
                                    className="w-full h-full object-cover"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => removeColorVariantImage(index, imgIndex)}
                                    className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <FaTrash size={10} />
                                  </button>
                                  <div className="absolute bottom-0 left-0 right-0 bg-green-600 bg-opacity-70 text-white text-xs p-1 text-center">
                                    New
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addColorVariant}
                  className={`w-full p-3 border-2 border-dashed rounded-lg flex items-center justify-center gap-2 transition-colors ${
                    isDarkMode
                      ? "border-gray-600 text-gray-400 hover:bg-gray-700"
                      : "border-gray-300 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <FaPlus /> Add Color Variant
                </button>
              </div>
            )}

            {/* Size Variants */}
            {activeVariantTab === "sizes" && (
              <div className="space-y-4">
                {formData.sizeVariants?.map((variant, index) => (
                  <div
                    key={index}
                    className={`p-4 rounded-lg border ${
                      isDarkMode ? "bg-gray-700 border-gray-600" : "bg-gray-50 border-gray-300"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium">Size {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeSizeVariant(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FaTrash />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <label className={`${labelClass} text-xs`}>Size</label>
                        <input
                          type="text"
                          value={variant.size}
                          onChange={(e) => updateSizeVariant(index, "size", e.target.value)}
                          className={`${inputClass} text-sm`}
                          placeholder="e.g. Medium"
                        />
                      </div>
                      <div>
                        <label className={`${labelClass} text-xs`}>Price</label>
                        <input
                          type="number"
                          value={variant.price}
                          onChange={(e) => updateSizeVariant(index, "price", parseFloat(e.target.value))}
                          className={`${inputClass} text-sm`}
                          min="0"
                          step="0.01"
                        />
                      </div>
                      <div>
                        <label className={`${labelClass} text-xs`}>Stock</label>
                        <input
                          type="number"
                          value={variant.stock}
                          onChange={(e) => updateSizeVariant(index, "stock", parseInt(e.target.value))}
                          className={`${inputClass} text-sm`}
                          min="0"
                        />
                      </div>
                      <div>
                        <label className={`${labelClass} text-xs`}>SKU (Optional)</label>
                        <input
                          type="text"
                          value={variant.sku || ""}
                          onChange={(e) => updateSizeVariant(index, "sku", e.target.value)}
                          className={`${inputClass} text-sm`}
                          placeholder="SIZE-001"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addSizeVariant}
                  className={`w-full p-3 border-2 border-dashed rounded-lg flex items-center justify-center gap-2 transition-colors ${
                    isDarkMode
                      ? "border-gray-600 text-gray-400 hover:bg-gray-700"
                      : "border-gray-300 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  <FaPlus /> Add Size Variant
                </button>
              </div>
            )}
          </div>

          {/* Pricing Card */}
          <div
            className={`p-6 rounded-lg border ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <h2 className="text-xl font-semibold mb-4">Base Pricing</h2>
            <p className="text-sm text-gray-500 mb-4">Base price (individual sizes can have different prices)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Base Price <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className={`${inputClass} ${errors.price ? 'border-red-500' : ''}`}
                  min="0"
                  step="0.01"
                  required
                />
                {errors.price && (
                  <p className="text-red-500 text-xs mt-1">{errors.price}</p>
                )}
              </div>
              <div>
                <label className={labelClass}>Compare at Price</label>
                <input
                  type="number"
                  name="compareAtPrice"
                  value={formData.compareAtPrice}
                  onChange={handleChange}
                  className={inputClass}
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          {/* Status Card */}
          <div
            className={`p-6 rounded-lg border ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <h2 className="text-xl font-semibold mb-4">Status</h2>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="draft">Draft</option>
              <option value="active">Active</option>
              <option value="archived">Archived</option>
            </select>
          </div>

          {/* Product Badges Card */}
          <div
            className={`p-6 rounded-lg border ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <h2 className="text-xl font-semibold mb-4">Product Badges</h2>
            <p className={`text-sm mb-4 ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
              Select all that apply to highlight your product
            </p>
            <div className="space-y-3">
              {[
                { value: "featured", label: "Featured", icon: "⭐", color: "text-yellow-600" },
                { value: "best-seller", label: "Best Seller", icon: "🔥", color: "text-orange-600" },
                { value: "new-arrival", label: "New Arrival", icon: "✨", color: "text-blue-600" },
                { value: "offer", label: "Special Offer", icon: "💰", color: "text-green-600" },
                { value: "trending", label: "Trending", icon: "📈", color: "text-purple-600" },
              ].map((badge) => (
                <div key={badge.value} className="flex items-center">
                  <input
                    type="checkbox"
                    id={badge.value}
                    checked={formData.badges.includes(badge.value)}
                    onChange={(e) => {
                      const newBadges = e.target.checked
                        ? [...formData.badges, badge.value]
                        : formData.badges.filter((b) => b !== badge.value);
                      setFormData((prev) => ({ ...prev, badges: newBadges }));
                      // Keep featured in sync with featured badge
                      if (badge.value === "featured") {
                        setFormData((prev) => ({ ...prev, featured: e.target.checked }));
                      }
                    }}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor={badge.value}
                    className={`ml-2 text-sm flex items-center gap-2 cursor-pointer ${
                      isDarkMode ? "text-gray-300" : "text-gray-700"
                    }`}
                  >
                    <span className={badge.color}>{badge.icon}</span>
                    {badge.label}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Inventory Card */}
          <div
            className={`p-6 rounded-lg border ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <h2 className="text-xl font-semibold mb-4">Inventory</h2>
            <div className="space-y-4">
              <div>
                <label className={labelClass}>SKU (Stock Keeping Unit) <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  className={`${inputClass} ${errors.sku ? 'border-red-500' : ''}`}
                  placeholder="e.g. PROD-001"
                  required
                />
                {errors.sku && (
                  <p className="text-red-500 text-xs mt-1">{errors.sku}</p>
                )}
              </div>
              <div>
                <label className={labelClass}>Quantity <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className={`${inputClass} ${errors.stock ? 'border-red-500' : ''}`}
                  min="0"
                  required
                />
                {errors.stock && (
                  <p className="text-red-500 text-xs mt-1">{errors.stock}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">Base stock (sizes can have individual stock)</p>
              </div>
            </div>
          </div>

          {/* Category Card */}
          <div
            className={`p-6 rounded-lg border ${
              isDarkMode
                ? "bg-gray-800 border-gray-700"
                : "bg-white border-gray-200"
            }`}
          >
            <h2 className="text-xl font-semibold mb-4">Category</h2>
            <div>
              <label className={labelClass}>Product Category <span className="text-red-500">*</span></label>
              <div className="relative">
                <select
                  name="category"
                  value={formData.category || ""}
                  onChange={handleChange}
                  className={`${inputClass} appearance-none cursor-pointer ${errors.category ? 'border-red-500' : ''}`}
                  required
                >
                  <option value="">-- Select Category --</option>
                  {categories.map((cat) => (
                    <option key={cat._id} value={cat.title}>
                      {cat.title}
                    </option>
                  ))}
                </select>
                <div className={`absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                  <IoMdArrowDropdown size={20} />
                </div>
                {errors.category && (
                  <p className="text-red-500 text-xs mt-1">{errors.category}</p>
                )}
                {loadingCategories && (
                  <p className="text-xs text-gray-500 mt-1">Loading categories...</p>
                )}
                {categories.length === 0 && !loadingCategories && (
                  <p className={`text-xs mt-1 ${isDarkMode ? "text-yellow-400" : "text-yellow-600"}`}>
                    No categories available. Please create categories first.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ProductForm;
