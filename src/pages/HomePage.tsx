import { Layout } from "@/components/layout/Layout";
import { MenuList } from "@/components/menu/MenuList";
import { Button } from "@/components/ui/button";
import { Coffee, ArrowRight } from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

export function HomePage() {
  const { isDarkMode } = useTheme();

  return (
    <Layout>
      {/* Hero Section */}
      <section className="py-12 md:py-20 mb-12 relative overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl opacity-70"></div>
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-accent/10 rounded-full blur-3xl opacity-70"></div>
        </div>

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
                Discover our unique menu where prices adjust based on popularity and demand.
                The more popular an item, the higher its coefficient - reflecting its true market value.
              </p>

              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="rounded-full shadow-md">
                  <Coffee className="mr-2 h-5 w-5" />
                  Order Now
                </Button>

                <Button variant="outline" size="lg" className="rounded-full group">
                  Learn More
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
              </div>

              <div className="mt-8 flex items-center gap-4">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-muted flex items-center justify-center border border-border">
                      <span className="text-xs">👤</span>
                    </div>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">500+</span> happy customers this week
                </p>
              </div>
            </div>

            <div className="relative animate-fade-in">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-accent/20 rounded-3xl blur-xl opacity-30"></div>
              <div className="relative bg-card border border-border rounded-3xl p-6 shadow-lg">
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { name: "Coffee", emoji: "☕", price: "$2.50", coef: "1.25" },
                    { name: "Tea", emoji: "🍵", price: "$1.80", coef: "0.90" },
                    { name: "Smoothie", emoji: "🥤", price: "$4.20", coef: "1.40" },
                    { name: "Water", emoji: "💧", price: "$1.00", coef: "0.80" }
                  ].map((item, i) => (
                    <div
                      key={i}
                      className="bg-background p-4 rounded-xl border border-border shadow-sm hover:shadow-md transition-all"
                    >
                      <div className="text-3xl mb-2">{item.emoji}</div>
                      <h3 className="font-medium">{item.name}</h3>
                      <div className="flex justify-between mt-2">
                        <span className="text-primary font-bold">{item.price}</span>
                        <span className="text-xs text-muted-foreground">Coef: {item.coef}</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 bg-muted rounded-lg text-sm text-center text-muted-foreground">
                  Prices update in real-time based on demand
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <MenuList />
    </Layout>
  );
}
