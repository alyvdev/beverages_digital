import { useState, useEffect, useCallback } from "react";
import {
  Minimize2,
  Maximize2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { menuItemsApi, coefficientLogApi } from "@/lib/api";
import { Button } from "@/components/ui/button";

interface StockChange {
  id: string;
  name: string;
  currentPrice: number;
  priceChange: number;
  percentageChange: number;
  openPrice: number; // İlk fiyat
  highPrice: number; // En yüksek fiyat
  lowPrice: number; // En düşük fiyat
}

interface StockChangeTableProps {
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

// Yardımcı Formatlama Fonksiyonları
const formatCurrency = (value: number): string => {
  return `$${value.toFixed(2)}`;
};

const formatPercentage = (value: number): string => {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
};

export function StockChangeTable({
  isFullscreen = false,
  onToggleFullscreen,
}: StockChangeTableProps = {}) {
  const [stockChanges, setStockChanges] = useState<StockChange[]>([]);
  const [displayedChanges, setDisplayedChanges] = useState<StockChange[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovering, setIsHovering] = useState(false);
  const maxDisplayItems = 8;

  const fetchLatestChanges = useCallback(async () => {
    try {
      const menuResponse = await menuItemsApi.getAll();
      if (!menuResponse.items || !Array.isArray(menuResponse.items)) {
        throw new Error("Invalid response format from menu API");
      }

      const activeMenuItems = menuResponse.items.filter(
        (item) => item.is_active !== false
      );
      const newChanges: StockChange[] = [];

      for (const item of activeMenuItems) {
        try {
          const logs = await coefficientLogApi.getPublicHistoryByItemId(
            item.id
          );

          if (logs && logs.length >= 2) {
            logs.sort(
              (a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
            );

            const latestLog = logs[0];
            const previousLog = logs[1];

            const basePrice = Number(item.base_price) || 0;
            const latestCoef = Number(latestLog.new_coefficient) || 1;
            const prevCoef = Number(previousLog.new_coefficient) || 1;

            const currentPrice = basePrice * latestCoef;
            const previousPrice = basePrice * prevCoef;

            const priceChange = currentPrice - previousPrice;
            const percentageChange =
              previousPrice === 0 ? 0 : (priceChange / previousPrice) * 100;

            const allPrices = logs.map(
              (log) => basePrice * Number(log.new_coefficient)
            );
            const openPrice = allPrices[allPrices.length - 1] || currentPrice;
            const highPrice = Math.max(...allPrices);
            const lowPrice = Math.min(...allPrices);

            newChanges.push({
              id: item.id,
              name: item.name,
              currentPrice,
              priceChange,
              percentageChange,
              openPrice,
              highPrice,
              lowPrice,
            });
          } else {
            const currentPrice = Number(item.final_price) || 0;

            newChanges.push({
              id: item.id,
              name: item.name,
              currentPrice,
              priceChange: 0,
              percentageChange: 0,
              openPrice: currentPrice,
              highPrice: currentPrice,
              lowPrice: currentPrice,
            });
          }
        } catch (err) {
          console.error(`Error processing menu item ${item.id}:`, err);

          const currentPrice = Number(item.final_price) || 0;

          newChanges.push({
            id: item.id,
            name: item.name,
            currentPrice,
            priceChange: 0,
            percentageChange: 0,
            openPrice: currentPrice,
            highPrice: currentPrice,
            lowPrice: currentPrice,
          });
        }
      }

      newChanges.sort((a, b) => a.name.localeCompare(b.name));
      setStockChanges(newChanges);

      if (newChanges.length > 0) {
        const currentDisplay = [];
        for (let i = 0; i < Math.min(newChanges.length, maxDisplayItems); i++) {
          currentDisplay.push(
            newChanges[(currentIndex + i) % newChanges.length]
          );
        }
        setDisplayedChanges(currentDisplay);
      } else {
        setDisplayedChanges([]);
      }
    } catch (err) {
      console.error("Error fetching stock changes:", err);
      setError("Failed to load stock changes");
    } finally {
      setIsLoading(false);
    }
  }, [currentIndex]);

  useEffect(() => {
    fetchLatestChanges();
  }, [fetchLatestChanges]);

  useEffect(() => {
    if (
      isLoading ||
      error ||
      stockChanges.length <= maxDisplayItems ||
      isHovering
    ) {
      return;
    }

    const scrollItems = () => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = (prevIndex + 1) % stockChanges.length;
        const newDisplayed: StockChange[] = [];
        for (let i = 0; i < maxDisplayItems; i++) {
          const itemIndex = (nextIndex + i) % stockChanges.length;
          newDisplayed.push(stockChanges[itemIndex]);
        }
        setDisplayedChanges(newDisplayed);
        return nextIndex;
      });
    };

    const scrollInterval = 3000 + Math.random() * 2000;
    const intervalId = setInterval(scrollItems, scrollInterval);

    return () => clearInterval(intervalId);
  }, [isLoading, error, stockChanges, maxDisplayItems, isHovering]);

  const renderPriceChangeIcon = (change: number) => {
    if (change > 0) {
      return <div className="triangle-up flex-shrink-0" />;
    }
    if (change < 0) {
      return <div className="triangle-down flex-shrink-0" />;
    }
    return <div className="triangle-neutral flex-shrink-0" />;
  };

  const getChangeTextColor = (change: number) => {
    if (change > 0) return "text-price-up";
    if (change < 0) return "text-price-down";
    return "text-price-neutral";
  };

  if (isLoading) {
    return (
      <div
        className="p-6 stock-table-bg rounded-xl shadow-md border border-border h-full"
        style={{ position: "relative", isolation: "isolate" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold font-mono text-yellow-400 tracking-wider">
            LIVE MARKET PRICES
          </h2>
          {onToggleFullscreen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleFullscreen}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title={isFullscreen ? "Minimize table" : "Expand table"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
        <div className="overflow-x-auto stock-table-scroll">
          <div className="grid grid-cols-12 stock-header border-b-2 border-yellow-400 mb-2 min-w-[800px]">
            <div className="col-span-3 text-left py-2 px-3 font-bold font-mono text-xs">
              SYMBOL
            </div>
            <div className="col-span-2 text-right py-2 px-2 font-bold font-mono text-xs">
              LAST
            </div>
            <div className="col-span-2 text-right py-2 px-2 font-bold font-mono text-xs">
              CHANGE
            </div>
            <div className="col-span-2 text-right py-2 px-2 font-bold font-mono text-xs">
              % CHG
            </div>
            <div className="col-span-1 text-right py-2 px-2 font-bold font-mono text-xs">
              HIGH
            </div>
            <div className="col-span-1 text-right py-2 px-2 font-bold font-mono text-xs">
              LOW
            </div>
            <div className="col-span-1 text-right py-2 px-2 font-bold font-mono text-xs">
              OPEN
            </div>
          </div>
          <div
            className="animate-pulse"
            style={{ minHeight: `${maxDisplayItems * 53}px` }}
          >
            {Array.from({ length: maxDisplayItems }).map((_, i) => (
              <div
                key={i}
                className="grid grid-cols-12 border-b border-border/50 py-3"
              >
                <div className="col-span-5 px-4">
                  <div className="h-6 bg-muted/50 rounded w-3/4"></div>
                </div>
                <div className="col-span-3 px-4 flex justify-end">
                  <div className="h-6 bg-muted/50 rounded w-1/2"></div>
                </div>
                <div className="col-span-2 px-4 hidden sm:flex justify-end">
                  <div className="h-6 bg-muted/50 rounded w-1/2"></div>
                </div>
                <div className="col-span-2 px-4 flex justify-end">
                  <div className="h-6 bg-muted/50 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="p-6 stock-table-bg rounded-xl shadow-md border border-border h-full"
        style={{ position: "relative", isolation: "isolate" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold font-mono text-price-neutral tracking-wider">
            LIVE MARKET PRICES
          </h2>
          {onToggleFullscreen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleFullscreen}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title={isFullscreen ? "Minimize table" : "Expand table"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
        <div className="overflow-x-auto stock-table-scroll">
          <div className="grid grid-cols-12 stock-header border-b-2 border-yellow-400 mb-2 min-w-[800px]">
            <div className="col-span-3 text-left py-2 px-3 font-bold font-mono text-xs">
              SYMBOL
            </div>
            <div className="col-span-2 text-right py-2 px-2 font-bold font-mono text-xs">
              LAST
            </div>
            <div className="col-span-2 text-right py-2 px-2 font-bold font-mono text-xs">
              CHANGE
            </div>
            <div className="col-span-2 text-right py-2 px-2 font-bold font-mono text-xs">
              % CHG
            </div>
            <div className="col-span-1 text-right py-2 px-2 font-bold font-mono text-xs">
              HIGH
            </div>
            <div className="col-span-1 text-right py-2 px-2 font-bold font-mono text-xs">
              LOW
            </div>
            <div className="col-span-1 text-right py-2 px-2 font-bold font-mono text-xs">
              OPEN
            </div>
          </div>
          <div
            className="text-center text-price-up"
            style={{
              minHeight: `${maxDisplayItems * 53}px`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (stockChanges.length === 0) {
    return (
      <div
        className="p-6 stock-table-bg rounded-xl shadow-md border border-border h-full"
        style={{ position: "relative", isolation: "isolate" }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold font-mono text-price-neutral tracking-wider">
            LIVE MARKET PRICES
          </h2>
          {onToggleFullscreen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleFullscreen}
              className="h-8 w-8 text-muted-foreground hover:text-foreground"
              title={isFullscreen ? "Minimize table" : "Expand table"}
            >
              {isFullscreen ? (
                <Minimize2 className="h-4 w-4" />
              ) : (
                <Maximize2 className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
        <div className="overflow-x-auto stock-table-scroll">
          <div className="grid grid-cols-12 stock-header border-b-2 border-yellow-400 mb-2 min-w-[800px]">
            <div className="col-span-3 text-left py-2 px-3 font-bold font-mono text-xs">
              SYMBOL
            </div>
            <div className="col-span-2 text-right py-2 px-2 font-bold font-mono text-xs">
              LAST
            </div>
            <div className="col-span-2 text-right py-2 px-2 font-bold font-mono text-xs">
              CHANGE
            </div>
            <div className="col-span-2 text-right py-2 px-2 font-bold font-mono text-xs">
              % CHG
            </div>
            <div className="col-span-1 text-right py-2 px-2 font-bold font-mono text-xs">
              HIGH
            </div>
            <div className="col-span-1 text-right py-2 px-2 font-bold font-mono text-xs">
              LOW
            </div>
            <div className="col-span-1 text-right py-2 px-2 font-bold font-mono text-xs">
              OPEN
            </div>
          </div>
          <div
            className="text-center text-price-neutral"
            style={{
              minHeight: `${maxDisplayItems * 53}px`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            No price changes to display.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="p-6 stock-table-bg rounded-xl shadow-md border border-border h-full"
      style={{ position: "relative", isolation: "isolate" }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold font-mono text-price-neutral tracking-wider">
          LIVE MARKET PRICES
        </h2>
        {onToggleFullscreen && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleFullscreen}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
            title={isFullscreen ? "Minimize table" : "Expand table"}
          >
            {isFullscreen ? (
              <Minimize2 className="h-4 w-4" />
            ) : (
              <Maximize2 className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>

      <div
        className="overflow-x-auto overflow-y-hidden stock-table-scroll"
        style={{ height: `${maxDisplayItems * 53}px` }}
      >
        <div className="min-w-full">
          <div className="grid grid-cols-12 stock-header border-b-2 border-yellow-400 mb-2 min-w-[800px]">
            <div className="col-span-3 text-left py-2 px-3 font-bold font-mono text-xs">
              SYMBOL
            </div>
            <div className="col-span-2 text-right py-2 px-2 font-bold font-mono text-xs">
              LAST
            </div>
            <div className="col-span-2 text-right py-2 px-2 font-bold font-mono text-xs">
              CHANGE
            </div>
            <div className="col-span-2 text-right py-2 px-2 font-bold font-mono text-xs">
              % CHG
            </div>
            <div className="col-span-1 text-right py-2 px-2 font-bold font-mono text-xs">
              HIGH
            </div>
            <div className="col-span-1 text-right py-2 px-2 font-bold font-mono text-xs">
              LOW
            </div>
            <div className="col-span-1 text-right py-2 px-2 font-bold font-mono text-xs">
              OPEN
            </div>
          </div>

          <div
            className="relative"
            style={{ height: `${maxDisplayItems * 53}px` }}
          >
            <AnimatePresence initial={false}>
              {displayedChanges.map((item, index) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{
                    duration: 0.5,
                    type: "spring",
                    stiffness: 150,
                    damping: 20,
                  }}
                  className="grid grid-cols-12 border-b border-border/50 stock-row-hover absolute min-w-[800px]"
                  style={{
                    height: "53px",
                    top: `${index * 53}px`,
                    width: "100%",
                  }}
                >
                  <div className="col-span-3 py-3 px-3 flex items-center">
                    <div className="flex-shrink-0 w-4">
                      {renderPriceChangeIcon(item.priceChange)}
                    </div>
                    <span
                      className="font-bold font-mono text-xs truncate text-price-value ml-1"
                      title={item.name}
                    >
                      {item.name.toUpperCase()}
                    </span>
                  </div>

                  <div className="col-span-2 py-3 px-2 text-right">
                    <span className="font-bold font-mono text-xs text-price-value">
                      {formatCurrency(item.currentPrice)}
                    </span>
                  </div>

                  <div
                    className={`col-span-2 py-3 px-2 text-right font-bold font-mono text-xs ${getChangeTextColor(
                      item.priceChange
                    )}`}
                  >
                    {item.priceChange > 0 ? "+" : ""}
                    {item.priceChange.toFixed(2)}
                  </div>

                  <div
                    className={`col-span-2 py-3 px-2 text-right font-bold font-mono text-xs ${getChangeTextColor(
                      item.percentageChange
                    )}`}
                  >
                    {formatPercentage(item.percentageChange)}
                  </div>

                  <div className="col-span-1 py-3 px-2 text-right font-bold font-mono text-xs text-price-value">
                    {formatCurrency(item.highPrice)}
                  </div>

                  <div className="col-span-1 py-3 px-2 text-right font-bold font-mono text-xs text-price-value">
                    {formatCurrency(item.lowPrice)}
                  </div>

                  <div className="col-span-1 py-3 px-2 text-right font-bold font-mono text-xs text-price-value">
                    {formatCurrency(item.openPrice)}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <p className="text-xs mt-4 text-center text-price-neutral font-mono">
        REAL-TIME MARKET DATA • HOVER TO PAUSE
      </p>
    </div>
  );
}
