import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { menuItemsApi, coefficientLogApi } from "@/lib/api";
import { MenuItem, CoefficientLog } from "@/types";

interface TickerItem {
  id: string;
  name: string;
  currentPrice: number;
  priceChange: number;
  percentageChange: number;
  isPositive: boolean;
}

interface TickerTapeProps {
  className?: string;
  speed?: number; // Animation speed in seconds
  height?: string;
  compact?: boolean; // Compact mode for smaller displays
}

export function TickerTape({
  className = "",
  speed = 60,
  height = "h-12",
  compact = false,
}: TickerTapeProps) {
  const [tickerItems, setTickerItems] = useState<TickerItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch menu items and calculate price changes
  const fetchTickerData = async () => {
    try {
      setIsLoading(true);
      const menuResponse = await menuItemsApi.getAll();
      const menuItems = menuResponse.items;

      // Get price history for each item to calculate changes
      const tickerData: TickerItem[] = [];

      for (const item of menuItems) {
        try {
          // Get coefficient history for price change calculation
          const history = await coefficientLogApi.getPublicHistoryByItemId(
            item.id
          );

          let priceChange = 0;
          let percentageChange = 0;

          if (history.length >= 2) {
            // Calculate change from the last two entries
            const latest = history[0];
            const previous = history[1];

            const basePrice =
              typeof item.base_price === "string"
                ? parseFloat(item.base_price)
                : item.base_price;
            const latestCoeff =
              typeof latest.new_coefficient === "string"
                ? parseFloat(latest.new_coefficient)
                : latest.new_coefficient;
            const previousCoeff =
              typeof previous.new_coefficient === "string"
                ? parseFloat(previous.new_coefficient)
                : previous.new_coefficient;

            const latestPrice = basePrice * latestCoeff;
            const previousPrice = basePrice * previousCoeff;

            priceChange = latestPrice - previousPrice;
            percentageChange =
              ((latestPrice - previousPrice) / previousPrice) * 100;
          } else {
            // If no history, simulate some change based on coefficient
            const basePrice =
              typeof item.base_price === "string"
                ? parseFloat(item.base_price)
                : item.base_price;
            const coefficient =
              typeof item.coefficient === "string"
                ? parseFloat(item.coefficient)
                : item.coefficient;
            const baseChange = (coefficient - 1) * basePrice;
            priceChange = baseChange;
            percentageChange = (coefficient - 1) * 100;
          }

          const currentPrice =
            typeof item.final_price === "string"
              ? parseFloat(item.final_price)
              : item.final_price;
          const safePriceChange =
            typeof priceChange === "string"
              ? parseFloat(priceChange)
              : priceChange;
          const safePercentageChange =
            typeof percentageChange === "string"
              ? parseFloat(percentageChange)
              : percentageChange;

          tickerData.push({
            id: item.id,
            name: item.name,
            currentPrice: isNaN(currentPrice) ? 0 : currentPrice,
            priceChange: isNaN(safePriceChange) ? 0 : safePriceChange,
            percentageChange: isNaN(safePercentageChange)
              ? 0
              : safePercentageChange,
            isPositive: safePriceChange >= 0,
          });
        } catch (itemError) {
          // If we can't get history for an item, add it with zero change
          const fallbackPrice =
            typeof item.final_price === "string"
              ? parseFloat(item.final_price)
              : item.final_price;

          tickerData.push({
            id: item.id,
            name: item.name,
            currentPrice: isNaN(fallbackPrice) ? 0 : fallbackPrice,
            priceChange: 0,
            percentageChange: 0,
            isPositive: true,
          });
        }
      }

      setTickerItems(tickerData);
      setError(null);
    } catch (err) {
      console.error("Error fetching ticker data:", err);
      setError("Failed to load ticker data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTickerData();

    // Refresh data every 30 seconds
    const interval = setInterval(fetchTickerData, 30000);

    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value: number | string): string => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(numValue)) return "$0.00";
    return `$${numValue.toFixed(2)}`;
  };

  const formatPercentage = (value: number | string): string => {
    const numValue = typeof value === "string" ? parseFloat(value) : value;
    if (isNaN(numValue)) return "0.00%";
    const sign = numValue > 0 ? "+" : "";
    return `${sign}${numValue.toFixed(2)}%`;
  };

  const renderTickerItem = (item: TickerItem, index: number) => {
    return (
      <div
        key={`${item.id}-${index}`}
        className="flex items-center space-x-6 px-8 whitespace-nowrap"
      >
        {/* Symbol/Name */}
        <span
          className={`font-bold font-mono text-sm ${
            item.isPositive ? "text-price-up" : "text-price-down"
          }`}
        >
          {item.name.toUpperCase()}
        </span>

        {/* Current Price */}
        <span
          className={`font-mono text-sm font-bold ${
            item.isPositive ? "text-price-up" : "text-price-down"
          }`}
        >
          {formatCurrency(item.currentPrice)}
        </span>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className={`w-full ${className}`}>
        <div
          className={`${height} bg-card border-y border-border flex items-center justify-center w-full`}
        >
          <div className="animate-pulse text-muted-foreground font-mono text-sm">
            Loading market data...
          </div>
        </div>
      </div>
    );
  }

  if (error || tickerItems.length === 0) {
    return (
      <div className={`w-full ${className}`}>
        <div
          className={`${height} bg-card border-y border-border flex items-center justify-center w-full`}
        >
          <div className="text-muted-foreground font-mono text-sm">
            {error || "No market data available"}
          </div>
        </div>
      </div>
    );
  }

  // Triple items for smoother seamless loop
  const tripleItems = [...tickerItems, ...tickerItems, ...tickerItems];

  return (
    <div className={`w-full ${className}`}>
      <div
        ref={containerRef}
        className={`${height} bg-card border-y border-border overflow-hidden relative w-full`}
      >
        {/* Left fade */}
        <div className="absolute left-0 top-0 w-20 h-full bg-gradient-to-r from-card to-transparent pointer-events-none z-10"></div>

        {/* Right fade */}
        <div className="absolute right-0 top-0 w-20 h-full bg-gradient-to-l from-card to-transparent pointer-events-none z-10"></div>

        {/* Scrolling content */}
        <motion.div
          className="flex items-center h-full will-change-transform"
          animate={{
            x: ["0%", "-33.333%"],
          }}
          transition={{
            duration: 30, // Slower, more readable speed
            ease: "linear",
            repeat: Infinity,
          }}
          style={{
            width: "300%", // Triple width for seamless loop
            transform: "translateZ(0)", // Hardware acceleration
          }}
        >
          {tripleItems.map((item, index) => renderTickerItem(item, index))}
        </motion.div>

        {/* Live indicator */}
        <div className="absolute top-2 right-6 z-20">
          <div className="flex items-center space-x-1">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-xs font-mono text-muted-foreground font-bold">
              LIVE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
