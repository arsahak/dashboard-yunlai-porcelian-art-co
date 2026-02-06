import { Category, getCategories } from "@/app/actions/category";
import CategoryManagement from "@/component/categoryManagement/CategoryManagement";
import { Suspense } from "react";
import CategoryLoading from "./loading";

export const dynamic = 'force-dynamic';

async function CategoryData() {
  const response = await getCategories({ limit: 100 });
  const initialCategories = (response.success && response.data ? response.data : []) as Category[];
  const pagination = response.pagination;

  return <CategoryManagement initialCategories={initialCategories} pagination={pagination} />;
}

export default function CategoryPage() {
  return (
    <Suspense fallback={<CategoryLoading />}>
      <CategoryData />
    </Suspense>
  );
}
