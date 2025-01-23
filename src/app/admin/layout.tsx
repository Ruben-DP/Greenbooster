import Header from "@/modules/header/Header";
import { Toaster } from "sonner";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      {children}
      <Toaster position="bottom-right" expand={false} richColors closeButton />
    </>
  );
}
