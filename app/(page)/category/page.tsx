import { Category, getCategories } from "@/app/actions/category";
import CategoryManagement from "@/component/categoryManagement/CategoryManagement";

export const dynamic = 'force-dynamic';

const CategoryPage = async () => {
  const response = await getCategories({ limit: 100 });

  const initialCategories = (response.success && response.data ? response.data : []) as Category[];
  const pagination = response.pagination;

  return <CategoryManagement initialCategories={initialCategories} pagination={pagination} />;
};

export default CategoryPage;
