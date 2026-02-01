import SigninPage from "@/component/auth/SigninPage";
import { Suspense } from "react";

export const metadata = {
   title: "Yunlai Porcelain Art Co.",
  description: "Beautiful collection of Yunlai porcelain art",
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/en-USA",
    },
  },
  openGraph: {
    images: "/opengraph-image.png",
  },
};

const page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SigninPage />
    </Suspense>
  );
};

export default page;
