import { getProducts, Product } from "@/app/actions/product";
import ProductManagement from "@/component/productManagement/ProductManagement";
import { Suspense } from "react";
import ProductsLoading from "./loading";

export const dynamic = 'force-dynamic';

// Separate async component for data fetching
async function ProductsData() {
  const response = await getProducts(1, 20); // Default page 1, limit 20
  const initialProducts = (response.success && response.data ? response.data : []) as Product[];
  const pagination = response.pagination;

  return <ProductManagement initialProducts={initialProducts} pagination={pagination} />;
}

const ProductsPage = () => {
  return (
    <Suspense fallback={<ProductsLoading />}>
      <ProductsData />
    </Suspense>
  );
};

export default ProductsPage;