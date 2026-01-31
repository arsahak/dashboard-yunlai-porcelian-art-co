"use client";
import { Product, updateProduct } from "@/app/actions/product";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import ProductForm, { ColorVariant, ProductFormData, SizeVariant } from "./ProductForm";

interface ProductEditProps {
  product: Product;
}

const ProductEdit = ({ product }: ProductEditProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Map Product to ProductFormData
  const initialData: ProductFormData = {
    name: product.name,
    sku: product.sku,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    stock: product.stock,
    category: product.category as string || "",
    status: product.status,
    description: product.description,
    images: [], // New files are empty
    existingImages: product.images?.map(img => img.url) || [],
    featured: product.featured,
    badges: product.badges || [],
    colorVariants: product.colorVariants?.map(v => ({
      color: v.color,
      colorCode: v.colorCode,
      images: [],
      existingImages: v.images || []
    })) as ColorVariant[] || [],
    sizeVariants: product.sizeVariants as SizeVariant[] || [],
  };

  const handleSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    
    try {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("sku", data.sku);
        formData.append("price", data.price.toString());
        if (data.compareAtPrice) formData.append("compareAtPrice", data.compareAtPrice.toString());
        formData.append("stock", data.stock.toString());
        if (data.category) formData.append("category", data.category);
        formData.append("status", data.status);
        formData.append("description", data.description);
        formData.append("featured", data.featured.toString());

        // Append badges
        if (data.badges && data.badges.length > 0) {
          formData.append("badges", JSON.stringify(data.badges));
        }

        // Append kept existing images
        if (data.existingImages && data.existingImages.length > 0) {
            data.existingImages.forEach(url => {
                 formData.append("keptImages", url);
            });
        }

        // Append new images
        data.images.forEach((file) => {
            formData.append("images", file);
        });

        // Append color variants
        if (data.colorVariants && data.colorVariants.length > 0) {
          formData.append("colorVariants", JSON.stringify(
            data.colorVariants.map(v => ({
              color: v.color,
              colorCode: v.colorCode,
              images: v.existingImages || [] // Keep existing images
            }))
          ));
          
          // Append new color variant images
          data.colorVariants.forEach((variant, index) => {
            variant.images.forEach((file) => {
              formData.append(`colorVariant_${index}_images`, file);
            });
          });
        }

        // Append size variants
        if (data.sizeVariants && data.sizeVariants.length > 0) {
          formData.append("sizeVariants", JSON.stringify(data.sizeVariants));
        }

        const response = await updateProduct(product._id, formData);

        if (response.success) {
            toast.success("Product updated successfully!");
            router.push("/products");
            router.refresh();
        } else {
            toast.error(response.error || "Failed to update product");
        }
    } catch (error) {
         toast.error("An unexpected error occurred");
         console.error(error);
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <ProductForm
      title="Edit Product"
      initialData={initialData}
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
};

export default ProductEdit;