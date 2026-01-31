import { getBlogById } from "@/app/actions/blog";
import BlogDetails from "@/component/blogManagement/BlogDetails";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

interface BlogDetailsPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BlogDetailsPage(props: BlogDetailsPageProps) {
  const params = await props.params;
  const response = await getBlogById(params.id);

  if (!response.success || !response.data) {
    notFound();
  }

  return <BlogDetails blog={response.data as any} />;
}
