import { Blog, getBlogs } from "@/app/actions/blog";
import BlogManagement from "@/component/blogManagement/BlogManagement";
import { Suspense } from "react";
import BlogsLoading from "./loading";

export const dynamic = "force-dynamic";

async function BlogsData() {
  const response = await getBlogs(1, 20);
  const blogs = (response.data as Blog[]) || [];
  const pagination = response.pagination;

  return <BlogManagement initialBlogs={blogs} pagination={pagination} />;
}

export default function BlogsPage() {
  return (
    <Suspense fallback={<BlogsLoading />}>
      <BlogsData />
    </Suspense>
  );
}
