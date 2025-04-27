import { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface LayoutProps {
  children: ReactNode;
  fullWidth?: boolean;
}

export function Layout({ children, fullWidth = false }: LayoutProps) {

  return (
    <div className="flex flex-col min-h-screen bg-background transition-colors duration-300">
      <Header />
      <main className={`flex-1 ${fullWidth ? 'w-full' : 'container-responsive'} py-6 animate-fade-in`}>
        {children}
      </main>
      <Footer />
    </div>
  );
}
