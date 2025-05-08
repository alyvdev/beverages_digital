import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { CoefficientLog, ChangeReason } from "@/types";
import { coefficientLogApi } from "@/lib/api";
import { LineChart as LineChartIcon, X, ArrowLeft, Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FullscreenPriceHistoryModalProps {
  itemId: string;
  itemName: string;
  onClose: () => void;
}

export function FullscreenPriceHistoryModal({
  itemId,
  itemName,
  onClose,
}: FullscreenPriceHistoryModalProps) {
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

  // Get reason color
  const getReasonColor = (reason: ChangeReason) => {
    switch (reason) {
      case ChangeReason.ORDERED:
        return "#22c55e"; // green
      case ChangeReason.DECAYED:
        return "#f59e0b"; // amber
      case ChangeReason.MANUAL_UPDATE:
        return "#3b82f6"; // blue
      case ChangeReason.CREATED:
        return "#8b5cf6"; // purple
      default:
        return "#6b7280"; // gray
    }
  };

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
        <div className="bg-background p-4 border border-border rounded-md shadow-md">
          <p className="font-medium text-sm mb-1">
            {data.formattedDate} {data.formattedTime}
          </p>
          <p className="text-xl font-bold text-primary">${finalPrice}</p>
          <div className="mt-2 text-sm">
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
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Price History</h1>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-pulse-slow">Loading price history...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-background z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <Button variant="ghost" size="icon" onClick={onClose}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">Price History</h1>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>
        <div className="flex-1 flex justify-center items-center">
          <div className="bg-destructive/10 border border-destructive text-destructive p-6 rounded-lg max-w-md">
            <h3 className="text-lg font-medium mb-2">Error</h3>
            <p>{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <Button variant="ghost" size="icon" onClick={onClose}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-lg font-semibold">Price History: {itemName}</h1>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setShowInfo(!showInfo)}
        >
          <Info className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex-1 p-4 overflow-auto">
        {showInfo && (
          <div className="mb-4 p-4 bg-muted/30 rounded-lg text-sm">
            <h3 className="font-medium mb-2">About Price History</h3>
            <p className="mb-2">
              Our prices change dynamically based on demand and other factors.
              This graph shows how the final price has changed over time.
            </p>
            <p>
              The percentage change indicates how much the price has increased
              or decreased compared to the previous price point.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => setShowInfo(false)}
            >
              Close
            </Button>
          </div>
        )}

        <div className="h-[60vh] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
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
                  return index % 2 === 0 ? value : "";
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
                domain={["dataMin - 0.5", "dataMax + 0.5"]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="finalPrice"
                name="Price"
                stroke="var(--primary)"
                strokeWidth={2.5}
                dot={{
                  stroke: "var(--primary)",
                  strokeWidth: 2,
                  r: 4,
                  fill: "var(--background)",
                }}
                activeDot={{ r: 8, fill: "var(--primary)" }}
                connectNulls={true}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {chartData.length > 0 ? (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Price history from {chartData[0].formattedDate} to{" "}
              {chartData[chartData.length - 1].formattedDate}
            </p>
          </div>
        ) : (
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              No price history available
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
