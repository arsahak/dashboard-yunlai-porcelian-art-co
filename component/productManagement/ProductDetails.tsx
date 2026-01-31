"use client";
import { Product } from "@/app/actions/product";
import { useSidebar } from "@/lib/SidebarContext";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaArrowLeft, FaBarcode, FaBox, FaDollarSign, FaEdit, FaLayerGroup, FaPalette, FaRuler, FaStar } from "react-icons/fa";

interface ProductDetailsProps {
  product: Product;
}

const ProductDetails = ({ product }: ProductDetailsProps) => {
  const { isDarkMode } = useSidebar();
  const router = useRouter();
  const [selectedImage, setSelectedImage] = useState<string>(
    product.images?.find(i => i.isPrimary)?.url || product.images?.[0]?.url || ""
  );

  if (!product) {
    return (
        <div className={`min-h-screen p-6 ${isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"}`}>
            <div className="text-center py-10">
                <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
                <button
                    onClick={() => router.back()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Go Back
                </button>
            </div>
        </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return `৳${amount.toFixed(2)}`;
  };

  const categoryName = product.category || "Uncategorized";
  const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount 
    ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
    : 0;

  return (
    <div
      className={`min-h-screen p-6 ${
        isDarkMode ? "bg-gray-900 text-gray-100" : "bg-gray-50 text-gray-900"
      }`}
    >
      {/* Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
           <h1 className="text-3xl font-bold mb-2">Product Details</h1>
           <p className={isDarkMode ? "text-gray-400" : "text-gray-600"}>
             Complete product information and variants
           </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.back()}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
              isDarkMode
                ? "border-gray-700 text-gray-300 hover:bg-gray-800"
                : "border-gray-300 text-gray-700 hover:bg-gray-50"
            }`}
          >
            <FaArrowLeft /> Back
          </button>
          <button
            onClick={() => router.push(`/products/edit-product/${product._id}`)}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaEdit /> Edit Product
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Images */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Image Display */}
          <div
            className={`p-6 rounded-lg border ${
              isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            <div className="aspect-video rounded-lg overflow-hidden bg-gray-100 mb-4 relative">
              {selectedImage ? (
                <img src={selectedImage} alt={product.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-400 to-purple-500">
                  <span className="text-white text-6xl font-bold">{product.name[0]}</span>
                </div>
              )}
              {/* Display all badges */}
              {product.badges && product.badges.length > 0 && (
                <div className="absolute top-4 left-4 flex flex-wrap gap-2">
                  {product.badges.map((badge, idx) => {
                    const badgeConfig: Record<string, { icon: string; bgColor: string; textColor: string; label: string }> = {
                      "featured": { icon: "⭐", bgColor: "bg-yellow-400", textColor: "text-gray-900", label: "Featured" },
                      "best-seller": { icon: "🔥", bgColor: "bg-orange-500", textColor: "text-white", label: "Best Seller" },
                      "new-arrival": { icon: "✨", bgColor: "bg-blue-500", textColor: "text-white", label: "New" },
                      "offer": { icon: "💰", bgColor: "bg-green-500", textColor: "text-white", label: "Offer" },
                      "trending": { icon: "📈", bgColor: "bg-purple-500", textColor: "text-white", label: "Trending" },
                    };
                    const config = badgeConfig[badge] || { icon: "", bgColor: "bg-gray-500", textColor: "text-white", label: badge };
                    return (
                      <div key={idx} className={`${config.bgColor} ${config.textColor} px-3 py-1 rounded-full flex items-center gap-1 font-bold text-sm shadow-lg`}>
                        <span>{config.icon}</span>
                        <span>{config.label}</span>
                      </div>
                    );
                  })}
                </div>
              )}
              {hasDiscount && (
                <div className="absolute top-4 right-4 bg-red-500 text-white px-3 py-1 rounded-full font-bold">
                  -{discountPercent}%
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {product.images && product.images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img.url)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImage === img.url
                        ? "border-blue-500 ring-2 ring-blue-300"
                        : isDarkMode 
                        ? "border-gray-600 hover:border-gray-500"
                        : "border-gray-300 hover:border-gray-400"
                    }`}
                  >
                    <img src={img.url} alt={`${product.name} ${idx + 1}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info Card */}
          <div
            className={`p-6 rounded-lg border ${
              isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
                <div className="flex items-center gap-3 flex-wrap">
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      product.status === "active"
                        ? "bg-green-100 text-green-800"
                        : product.status === "draft"
                        ? "bg-gray-100 text-gray-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {product.status.toUpperCase()}
                  </span>
                  <span className={`flex items-center gap-1 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                    <FaBarcode /> {product.sku}
                  </span>
                  {/* Display badges in product info */}
                  {product.badges && product.badges.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {product.badges.map((badge, idx) => {
                        const badgeConfig: Record<string, { icon: string; color: string; label: string }> = {
                          "featured": { icon: "⭐", color: "text-yellow-600", label: "Featured" },
                          "best-seller": { icon: "🔥", color: "text-orange-600", label: "Best Seller" },
                          "new-arrival": { icon: "✨", color: "text-blue-600", label: "New Arrival" },
                          "offer": { icon: "💰", color: "text-green-600", label: "Special Offer" },
                          "trending": { icon: "📈", color: "text-purple-600", label: "Trending" },
                        };
                        const config = badgeConfig[badge] || { icon: "", color: "", label: badge };
                        return (
                          <span key={idx} className={`flex items-center gap-1 ${config.color} font-medium text-sm`}>
                            <span>{config.icon}</span>
                            <span>{config.label}</span>
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-blue-600">
                  {formatCurrency(product.price)}
                </div>
                {hasDiscount && (
                  <div className="text-lg text-gray-400 line-through">
                    {formatCurrency(product.compareAtPrice!)}
                  </div>
                )}
              </div>
            </div>

            <div className="prose max-w-none">
              <h3 className={`text-lg font-semibold mb-2 ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>
                Description
              </h3>
              <p className={`leading-relaxed ${isDarkMode ? "text-gray-300" : "text-gray-600"}`}>
                {product.description || "No description available"}
              </p>
            </div>
          </div>

          {/* Color Variants */}
          {product.colorVariants && product.colorVariants.length > 0 && (
            <div
              className={`p-6 rounded-lg border ${
                isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              }`}
            >
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <FaPalette className="text-blue-500" /> Color Variants
              </h2>
              <div className="space-y-6">
                {product.colorVariants.map((variant, idx) => (
                  <div key={idx} className={`p-4 rounded-lg border ${isDarkMode ? "border-gray-600 bg-gray-700/50" : "border-gray-200 bg-gray-50"}`}>
                    <div className="flex items-center gap-3 mb-4">
                      {variant.colorCode && (
                        <div
                          className="w-12 h-12 rounded-full border-4 border-white shadow-lg"
                          style={{ backgroundColor: variant.colorCode }}
                        />
                      )}
                      <div>
                        <h3 className="font-bold text-xl">{variant.color}</h3>
                        {variant.colorCode && (
                          <span className={`text-sm font-mono ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                            {variant.colorCode}
                          </span>
                        )}
                      </div>
                    </div>
                    {variant.images && variant.images.length > 0 && (
                      <div>
                        <p className={`text-sm mb-2 ${isDarkMode ? "text-gray-400" : "text-gray-500"}`}>
                          {variant.images.length} {variant.images.length === 1 ? "Image" : "Images"}
                        </p>
                        <div className="grid grid-cols-4 gap-3">
                          {variant.images.map((img, imgIdx) => (
                            <button
                              key={imgIdx}
                              onClick={() => setSelectedImage(img)}
                              className="aspect-square rounded-lg overflow-hidden bg-gray-100 hover:ring-2 hover:ring-blue-400 transition-all"
                            >
                              <img src={img} alt={`${variant.color} ${imgIdx + 1}`} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Size Variants */}
          {product.sizeVariants && product.sizeVariants.length > 0 && (
            <div
              className={`p-6 rounded-lg border ${
                isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              }`}
            >
              <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
                <FaRuler className="text-green-500" /> Size Variants
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className={`border-b-2 ${isDarkMode ? "border-gray-600" : "border-gray-300"}`}>
                    <tr>
                      <th className="text-left p-4 font-semibold">Size</th>
                      <th className="text-left p-4 font-semibold">Price</th>
                      <th className="text-left p-4 font-semibold">Stock</th>
                      <th className="text-left p-4 font-semibold">SKU</th>
                      <th className="text-left p-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {product.sizeVariants.map((variant, idx) => (
                      <tr key={idx} className={`border-b ${isDarkMode ? "border-gray-700" : "border-gray-200"}`}>
                        <td className="p-4">
                          <span className="font-bold text-lg">{variant.size}</span>
                        </td>
                        <td className="p-4">
                          <span className="text-blue-600 font-semibold">{formatCurrency(variant.price)}</span>
                        </td>
                        <td className="p-4">
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            variant.stock === 0 
                              ? "bg-red-100 text-red-800"
                              : variant.stock <= 10
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}>
                            {variant.stock} units
                          </span>
                        </td>
                        <td className="p-4">
                          <span className={`font-mono text-sm ${isDarkMode ? "text-gray-400" : "text-gray-600"}`}>
                            {variant.sku || "-"}
                          </span>
                        </td>
                        <td className="p-4">
                          {variant.stock === 0 ? (
                            <span className="text-red-600 font-medium">Out of Stock</span>
                          ) : variant.stock <= 10 ? (
                            <span className="text-yellow-600 font-medium">Low Stock</span>
                          ) : (
                            <span className="text-green-600 font-medium">In Stock</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar - Quick Info */}
        <div className="space-y-6">
          {/* Inventory Card */}
          <div
            className={`p-6 rounded-lg border ${
              isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            <h2 className="text-xl font-semibold mb-4">Inventory & Details</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center">
                        <FaBox className="text-blue-600 dark:text-blue-400" />
                      </div>
                      <span className={isDarkMode ? "text-gray-300" : "text-gray-700"}>Stock</span>
                  </div>
                  <span className="font-bold text-lg">{product.stock} units</span>
              </div>
              
              <div className="flex items-center justify-between p-3 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center">
                        <FaLayerGroup className="text-purple-600 dark:text-purple-400" />
                      </div>
                      <span className={isDarkMode ? "text-gray-300" : "text-gray-700"}>Category</span>
                  </div>
                  <span className="font-semibold">{categoryName}</span>
              </div>
               
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-900/20">
                  <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-800 flex items-center justify-center">
                        <FaDollarSign className="text-green-600 dark:text-green-400" />
                      </div>
                      <span className={isDarkMode ? "text-gray-300" : "text-gray-700"}>Base Price</span>
                  </div>
                  <span className="font-bold text-lg">{formatCurrency(product.price)}</span>
              </div>

              {product.featured && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-yellow-100 dark:bg-yellow-800 flex items-center justify-center">
                          <FaStar className="text-yellow-600 dark:text-yellow-400" />
                        </div>
                        <span className={isDarkMode ? "text-gray-300" : "text-gray-700"}>Featured</span>
                    </div>
                    <span className="font-semibold text-yellow-600">Yes</span>
                </div>
              )}
            </div>
          </div>

          {/* Summary Card */}
          <div
            className={`p-6 rounded-lg border ${
              isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
            }`}
          >
            <h2 className="text-xl font-semibold mb-4">Variant Summary</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Color Options</span>
                <span className="font-semibold">{product.colorVariants?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Size Options</span>
                <span className="font-semibold">{product.sizeVariants?.length || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Total Images</span>
                <span className="font-semibold">
                  {(product.images?.length || 0) + (product.colorVariants?.reduce((acc, v) => acc + (v.images?.length || 0), 0) || 0)}
                </span>
              </div>
            </div>
          </div>

          {/* Meta Info */}
          {(product.createdAt || product.updatedAt) && (
            <div
              className={`p-6 rounded-lg border ${
                isDarkMode ? "bg-gray-800 border-gray-700" : "bg-white border-gray-200"
              }`}
            >
              <h2 className="text-xl font-semibold mb-4">Metadata</h2>
              <div className="space-y-2 text-sm">
                {product.createdAt && (
                  <div>
                    <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Created: </span>
                    <span className="font-medium">{new Date(product.createdAt).toLocaleString()}</span>
                  </div>
                )}
                {product.updatedAt && (
                  <div>
                    <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>Updated: </span>
                    <span className="font-medium">{new Date(product.updatedAt).toLocaleString()}</span>
                  </div>
                )}
                {product.createdBy && (
                  <div>
                    <span className={isDarkMode ? "text-gray-400" : "text-gray-600"}>By: </span>
                    <span className="font-medium">{product.createdBy.name}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;