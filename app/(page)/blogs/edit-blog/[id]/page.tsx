import { getBlogById } from "@/app/actions/blog";
import BlogEdit from "@/component/blogManagement/BlogEdit";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface EditBlogPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditBlogPage(props: EditBlogPageProps) {
  const params = await props.params;
  const response = await getBlogById(params.id);

  if (!response.success || !response.data) {
    notFound();
  }

  return <BlogEdit blog={response.data as any} />;
}
