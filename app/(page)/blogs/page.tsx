import { Blog, getBlogs } from "@/app/actions/blog";
import BlogManagement from "@/component/blogManagement/BlogManagement";

export const dynamic = "force-dynamic";

export default async function BlogsPage() {
  const response = await getBlogs(1, 20);

  const blogs = (response.data as Blog[]) || [];
  const pagination = response.pagination;

  return <BlogManagement initialBlogs={blogs} pagination={pagination} />;
}
