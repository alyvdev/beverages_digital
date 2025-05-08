import { Layout } from "@/components/layout/Layout";
import { MenuList } from "@/components/menu/MenuList";
import { Button } from "@/components/ui/button";
import { Coffee, ArrowRight } from "lucide-react";
import { StockChangeTable } from "@/components/home/StockChangeTable";
import { useNavigate } from "react-router-dom";
import { useCustomers } from "@/contexts/CustomerContext";

export function HomePage() {
  const navigate = useNavigate();
  const { happyCustomers } = useCustomers();

  const handleOrderNow = () => {
    navigate("/cart");
  };

  const handleLearnMore = () => {
    // Sayfanın menü bölümüne kaydır
    const menuSection = document.getElementById("menu-section");
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-12 md:py-20 mb-12 relative overflow-hidden">
        <div className="container-responsive relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Dynamic Pricing
                </span>{" "}
                for a Perfect Beverage Experience
              </h1>

              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                Discover our unique menu where prices adjust based on popularity
                and demand. The more popular an item, the higher its coefficient
                - reflecting its true market value.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  className="rounded-full shadow-md"
                  onClick={handleOrderNow}
                >
                  <Coffee className="mr-2 h-5 w-5" />
                  Order Now
                </Button>

                <Button
                  variant="outline"
                  size="lg"
                  className="rounded-full group text-foreground"
                  onClick={handleLearnMore}
                >
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>

              <div className="mt-8 flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border border-border"
                    >
                      <span className="text-xs">👤</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {happyCustomers}
                  </span>{" "}
                  happy customers this week
                </p>
              </div>
            </div>

            <div className="relative animate-fade-in h-auto">
              {/* Fixed size container to prevent layout shifts */}
              <div className="w-full h-full" style={{ minHeight: "424px" }}>
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-xl opacity-30"></div>
                <StockChangeTable />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section id="menu-section">
        <MenuList />
      </section>
    </Layout>
  );
}
