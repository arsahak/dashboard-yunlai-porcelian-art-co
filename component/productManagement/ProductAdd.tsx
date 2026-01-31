"use client";
import { createProduct } from "@/app/actions/product";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import ProductForm, { ProductFormData } from "./ProductForm";

const ProductAdd = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

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
      
      // Append main images
      data.images.forEach((file) => {
          formData.append("images", file);
      });

      // Append color variants
      if (data.colorVariants && data.colorVariants.length > 0) {
        formData.append("colorVariants", JSON.stringify(
          data.colorVariants.map(v => ({
            color: v.color,
            colorCode: v.colorCode,
            images: [] // URLs will be populated after upload
          }))
        ));
        
        // Append color variant images
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

      const response = await createProduct(formData);

      if (response.success) {
          toast.success("Product created successfully!");
          router.push("/products");
      } else {
          toast.error(response.error || "Failed to create product");
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
      title="Add New Product"
      onSubmit={handleSubmit}
      isSubmitting={isSubmitting}
    />
  );
};

export default ProductAdd;
