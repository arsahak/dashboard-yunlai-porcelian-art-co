import SignupPage from "@/component/auth/SignupPage";

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
  return <SignupPage />;
};

export default page;
