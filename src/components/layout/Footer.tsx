import { Instagram, Twitter, Facebook } from "lucide-react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border py-8 mt-auto transition-colors duration-300">
      <div className="container-responsive">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Beverates Digital
            </h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Enjoy our premium selection of beverates with dynamic pricing based on popularity and demand.
            </p>
            <div className="flex gap-4 mt-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Instagram">
                <Instagram size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Twitter">
                <Twitter size={20} />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Facebook">
                <Facebook size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-base font-medium mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  About Us
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Our Menu
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Pricing Model
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-base font-medium mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-6 text-center">
          <p className="text-sm text-muted-foreground">
            &copy; {currentYear} Beverates Digital. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
