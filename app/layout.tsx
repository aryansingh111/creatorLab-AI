import "./globals.css";
import type { Metadata, Viewport } from "next";
import { StoreProvider } from "@/lib/store";
import Shell from "@/components/Shell";

export const metadata: Metadata = {
  title: { default: "CreatorLab AI — plan, create, test, improve", template: "%s · CreatorLab AI" },
  description: "Plan, create, test, and improve a content project with AI — while learning the process.",
  applicationName: "CreatorLab AI",
  openGraph: { title: "CreatorLab AI", description: "Learn by running a real, measurable content experiment.", siteName: "CreatorLab AI", type: "website" },
};
export const viewport: Viewport = { themeColor: "#1D4ED8" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <html lang="en"><body><StoreProvider><Shell>{children}</Shell></StoreProvider></body></html>;
}
