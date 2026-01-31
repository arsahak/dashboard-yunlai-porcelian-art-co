import { getProductById, Product } from "@/app/actions/product";
import ProductEdit from "@/component/productManagement/ProductEdit";
import { redirect } from "next/navigation";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  
  const productRes = await getProductById(resolvedParams.id);
  
  if (!productRes.success || !productRes.data) {
      redirect("/products");
  }

  const product = productRes.data as Product;

  return <ProductEdit product={product} />;
}
