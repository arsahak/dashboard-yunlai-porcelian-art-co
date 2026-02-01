import LayoutWrapper from "@/component/layout/LayoutWrapper";
import "../globals.css";

export const metadata = {
  metadataBase: new URL("https://dashboard-yunlai-porcelian-art-co.vercel.app"),
};

export default function PageLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {/* Full layout with Sidebar and Topbar */}
      <LayoutWrapper>{children}</LayoutWrapper>
    </>
  );
}
