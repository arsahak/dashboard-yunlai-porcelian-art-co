"use client";
import { createProduct } from "@/app/actions/product";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import ProductForm, { ProductFormData } from "./ProductForm";

// Validation error interface
export interface ValidationErrors {
  name?: string;
  sku?: string;
  price?: string;
  stock?: string;
  description?: string;
  category?: string;
  images?: string;
  colorVariants?: string;
  sizeVariants?: string;
}

// Image validation constants
const MAX_IMAGE_SIZE = 1 * 1024 * 1024; // 1MB in bytes
const ALLOWED_IMAGE_FORMATS = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const ProductAdd = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Validate image file
  const validateImage = (file: File): string | null => {
    // Check file size
    if (file.size > MAX_IMAGE_SIZE) {
      return `${file.name} exceeds maximum size of 1MB (${(file.size / 1024 / 1024).toFixed(2)}MB)`;
    }
    
    // Check file format
    if (!ALLOWED_IMAGE_FORMATS.includes(file.type)) {
      return `${file.name} has invalid format. Allowed: JPG, JPEG, PNG, WEBP`;
    }
    
    return null;
  };

  // Validate all form fields
  const validateForm = (data: ProductFormData): ValidationErrors => {
    const newErrors: ValidationErrors = {};

    // Validate product name
    if (!data.name || data.name.trim() === "") {
      newErrors.name = "Product name is required";
    } else if (data.name.trim().length < 3) {
      newErrors.name = "Product name must be at least 3 characters";
    }

    // Validate SKU
    if (!data.sku || data.sku.trim() === "") {
      newErrors.sku = "SKU is required";
    } else if (data.sku.trim().length < 2) {
      newErrors.sku = "SKU must be at least 2 characters";
    }

    // Validate price
    if (!data.price || data.price <= 0) {
      newErrors.price = "Price must be greater than 0";
    }

    // Validate stock
    if (data.stock < 0) {
      newErrors.stock = "Stock cannot be negative";
    }

    // Validate description
    if (!data.description || data.description.trim() === "") {
      newErrors.description = "Product description is required";
    } else if (data.description.trim().length < 10) {
      newErrors.description = "Description must be at least 10 characters";
    }

    // Validate category
    if (!data.category || data.category.trim() === "") {
      newErrors.category = "Category is required";
    }

    // Validate main product images
    const totalImages = (data.images?.length || 0) + (data.existingImages?.length || 0);
    if (totalImages === 0) {
      newErrors.images = "At least one product image is required";
    }

    // Validate image files (size and format)
    if (data.images && data.images.length > 0) {
      for (const file of data.images) {
        const imageError = validateImage(file);
        if (imageError) {
          newErrors.images = imageError;
          break;
        }
      }
    }

    // Validate color variant images if color variants exist
    if (data.colorVariants && data.colorVariants.length > 0) {
      for (let i = 0; i < data.colorVariants.length; i++) {
        const variant = data.colorVariants[i];
        
        // Check if color name is provided
        if (!variant.color || variant.color.trim() === "") {
          newErrors.colorVariants = `Color variant ${i + 1} requires a color name`;
          break;
        }

        // Validate color variant images
        if (variant.images && variant.images.length > 0) {
          for (const file of variant.images) {
            const imageError = validateImage(file);
            if (imageError) {
              newErrors.colorVariants = `Color variant ${i + 1}: ${imageError}`;
              break;
            }
          }
          if (newErrors.colorVariants) break;
        }
      }
    }

    // Validate size variants if they exist
    if (data.sizeVariants && data.sizeVariants.length > 0) {
      for (let i = 0; i < data.sizeVariants.length; i++) {
        const variant = data.sizeVariants[i];
        
        if (!variant.size || variant.size.trim() === "") {
          newErrors.sizeVariants = `Size variant ${i + 1} requires a size name`;
          break;
        }
        
        if (!variant.price || variant.price <= 0) {
          newErrors.sizeVariants = `Size variant ${i + 1} requires a valid price`;
          break;
        }
        
        if (variant.stock < 0) {
          newErrors.sizeVariants = `Size variant ${i + 1} stock cannot be negative`;
          break;
        }
      }
    }

    return newErrors;
  };

  const handleSubmit = async (data: ProductFormData) => {
    // Clear previous errors
    setErrors({});

    // Validate form
    const validationErrors = validateForm(data);
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      
      // Show first error as toast
      const firstError = Object.values(validationErrors)[0];
      toast.error(firstError);
      
      return;
    }

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
      errors={errors}
    />
  );
};

export default ProductAdd;
