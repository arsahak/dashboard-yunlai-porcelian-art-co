import { LanguageProvider } from "@/lib/LanguageContext";
import "../globals.css";

export const metadata = {
  metadataBase: new URL("https://yunlai-porcelian-art-co.vercel.app"),
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <LanguageProvider>
      {/* Simple auth layout - no sidebar or topbar; uses root html/body from main layout */}
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </LanguageProvider>
  );
}
