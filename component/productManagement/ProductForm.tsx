"use client";
import { useSidebar } from "@/lib/SidebarContext";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FaPlus, FaSave, FaTimes, FaTrash, FaUpload } from "react-icons/fa";
import { IoMdArrowDropdown } from "react-icons/io";

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
}

const ProductForm = ({
  initialData,
  onSubmit,
  title,
  isSubmitting = false,
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
                <label className={labelClass}>Product Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={inputClass}
                  placeholder="e.g. Ceramic Vase"
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className={`${inputClass} h-32`}
                  placeholder="Product description..."
                />
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
            <h2 className="text-xl font-semibold mb-4">Media</h2>
            <div
              onClick={handleUploadClick}
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-opacity-50 transition-colors ${
                isDarkMode
                  ? "border-gray-700 bg-gray-900 hover:bg-gray-800"
                  : "border-gray-300 bg-gray-50 hover:bg-gray-100"
              }`}
            >
              <FaUpload className="mx-auto text-4xl mb-2 text-gray-400" />
              <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
                Drag and drop images here, or click to upload
              </p>
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden" 
                multiple 
                accept="image/*"
              />
            </div>
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
                <label className={labelClass}>Base Price</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className={inputClass}
                  min="0"
                  step="0.01"
                  required
                />
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
                <label className={labelClass}>SKU (Stock Keeping Unit)</label>
                <input
                  type="text"
                  name="sku"
                  value={formData.sku}
                  onChange={handleChange}
                  className={inputClass}
                  required
                />
              </div>
              <div>
                <label className={labelClass}>Quantity</label>
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleChange}
                  className={inputClass}
                  min="0"
                  required
                />
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
              <label className={labelClass}>Product Category</label>
              <div className="relative">
                <select
                  name="category"
                  value={formData.category || ""}
                  onChange={handleChange}
                  className={`${inputClass} appearance-none cursor-pointer`}
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
