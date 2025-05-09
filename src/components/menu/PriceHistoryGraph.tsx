import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CoefficientLog } from "@/types";
import { coefficientLogApi } from "@/lib/api";
import { LineChart as LineChartIcon, X, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PriceHistoryGraphProps {
  itemId: string;
  itemName?: string;
  onClose: () => void;
}

export function PriceHistoryGraph({
  itemId,
  itemName = "Item",
  onClose,
}: PriceHistoryGraphProps) {
  const [logs, setLogs] = useState<CoefficientLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showInfo, setShowInfo] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        // Use the public endpoint that doesn't require authentication
        const data = await coefficientLogApi.getPublicHistoryByItemId(itemId);
        setLogs(data);
      } catch (err) {
        console.error("Error fetching price history:", err);
        setError("Failed to load price history");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [itemId]);

  // Process data for the chart
  const chartData = logs.map((log) => {
    const date = new Date(log.timestamp);

    // Ensure values are numbers
    const basePrice =
      typeof log.menu_item.base_price === "number"
        ? log.menu_item.base_price
        : parseFloat(String(log.menu_item.base_price) || "0");

    const newCoefficient =
      typeof log.new_coefficient === "number"
        ? log.new_coefficient
        : parseFloat(String(log.new_coefficient) || "1");

    const prevCoefficient =
      typeof log.previous_coefficient === "number"
        ? log.previous_coefficient
        : parseFloat(String(log.previous_coefficient) || "1");

    // Calculate final prices
    const finalPrice = basePrice * newCoefficient;
    const prevFinalPrice = basePrice * prevCoefficient;

    // Format date and time separately for better display
    const formattedDate = date.toLocaleDateString();
    const formattedTime = date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    // Calculate percentage change safely - based on final price change, not coefficient
    let priceChangePercent = "0.0";
    if (!isNaN(prevFinalPrice) && prevFinalPrice > 0) {
      priceChangePercent = (
        ((finalPrice - prevFinalPrice) / prevFinalPrice) *
        100
      ).toFixed(1);
    }

    return {
      date: date,
      formattedDate: formattedDate,
      formattedTime: formattedTime,
      finalPrice: finalPrice,
      priceChangePercent: priceChangePercent,
      // Include changeReason for potential color coding
      changeReason: log.change_reason,
    };
  });

  // Sort data chronologically
  chartData.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Custom tooltip component
  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      value: number;
      payload: {
        formattedDate: string;
        formattedTime: string;
        finalPrice: number;
        priceChangePercent: string;
        changeReason: string;
      };
    }>;
    label?: string;
  }

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isPositiveChange = parseFloat(data.priceChangePercent) >= 0;

      // Ensure values are numbers before using toFixed
      const finalPrice =
        typeof data.finalPrice === "number"
          ? data.finalPrice.toFixed(2)
          : "0.00";

      return (
        <div className="bg-background p-3 border border-border rounded-md shadow-md">
          <p className="font-medium text-sm mb-1">
            {data.formattedDate} {data.formattedTime}
          </p>
          <p className="text-lg font-bold text-primary">${finalPrice}</p>
          <div className="mt-2 text-xs">
            <p className={isPositiveChange ? "text-green-600" : "text-red-600"}>
              Change: {isPositiveChange ? "+" : ""}
              {data.priceChangePercent}%
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  if (isLoading) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <LineChartIcon className="h-5 w-5 text-primary" />
            Price History: {itemName}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex justify-center items-center h-60 bg-muted/10 rounded-lg">
          <div className="animate-pulse-slow">Loading price history...</div>
        </div>
      </div>
    );
  }

  if (error && logs.length === 0) {
    return (
      <div>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <LineChartIcon className="h-5 w-5 text-primary" />
            Price History: {itemName}
          </h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex justify-center items-center h-60 bg-muted/10 rounded-lg">
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <LineChartIcon className="h-5 w-5 text-primary" />
          Price History: {itemName}
        </h3>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowInfo(!showInfo)}
            className="rounded-full"
          >
            <Info className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {showInfo && (
        <div className="mb-4 p-3 bg-muted/30 rounded-lg text-xs">
          <p className="mb-2">
            Our prices change dynamically based on demand and other factors.
            This graph shows how the price has changed over time.
          </p>
          <p>
            The percentage change indicates how much the price has increased or
            decreased compared to the previous price point.
          </p>
        </div>
      )}

      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="var(--border)"
              opacity={0.5}
            />
            <XAxis
              dataKey="formattedDate"
              tick={{ fontSize: 12 }}
              tickMargin={10}
              tickFormatter={(value, index) => {
                // Show fewer ticks for better readability
                return index % 3 === 0 ? value : "";
              }}
            />
            <YAxis
              tickFormatter={(value) => {
                // Ensure value is a number before using toFixed
                return `$${
                  typeof value === "number" ? value.toFixed(1) : "0.0"
                }`;
              }}
              tick={{ fontSize: 12 }}
              tickMargin={10}
              domain={["dataMin - 0.1", "dataMax + 0.1"]}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="finalPrice"
              name="Price"
              stroke="var(--primary)"
              strokeWidth={2.5}
              dot={{
                stroke: "var(--primary)",
                strokeWidth: 2,
                r: 3,
                fill: "var(--background)",
              }}
              activeDot={{ r: 6, fill: "var(--primary)" }}
              connectNulls={true}
              animationDuration={1000}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {chartData.length > 0 ? (
        <div className="mt-3 text-center">
          <p className="text-xs text-muted-foreground">
            Price history from {chartData[0].formattedDate} to{" "}
            {chartData[chartData.length - 1].formattedDate}
          </p>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground mt-3 text-center">
          No price history available
        </p>
      )}
    </div>
  );
}
