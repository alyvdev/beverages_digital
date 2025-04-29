import { useState, useEffect, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { CoefficientLog, ChangeReason } from "@/types";
import { coefficientLogApi } from "@/lib/api";
import { LineChart as LineChartIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PriceHistoryGraphProps {
  itemId: string;
  onClose: () => void;
}

export function PriceHistoryGraph({ itemId, onClose }: PriceHistoryGraphProps) {
  const [logs, setLogs] = useState<CoefficientLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generate mock data for demonstration
  const generateMockData = useCallback(() => {
    const mockData: CoefficientLog[] = [];
    const now = new Date();
    const basePrice = 5.0;

    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);

      const coefficient = 0.8 + Math.random() * 0.4; // Random between 0.8 and 1.2

      mockData.push({
        id: `mock-${i}`,
        item_id: itemId,
        timestamp: date.toISOString(),
        previous_coefficient:
          i === 30 ? 1.0 : mockData[mockData.length - 1].new_coefficient,
        new_coefficient: coefficient,
        change_reason:
          i % 3 === 0
            ? ChangeReason.ORDERED
            : i % 3 === 1
            ? ChangeReason.DECAYED
            : ChangeReason.MANUAL_UPDATE,
        menu_item: {
          id: itemId,
          name: "Mock Item",
          category: "Mock Category",
          base_price: basePrice,
          coefficient: coefficient,
          final_price: basePrice * coefficient,
        },
      });
    }

    setLogs(mockData);
  }, [itemId]);

  useEffect(() => {
    const fetchLogs = async () => {
      setIsLoading(true);
      try {
        const data = await coefficientLogApi.getHistoryByItemId(itemId);
        setLogs(data);
      } catch (err) {
        console.error("Error fetching price history:", err);
        setError("Failed to load price history");

        // For demonstration, generate mock data if API fails
        if (
          err instanceof Error &&
          (err.message.includes("401") || err.message.includes("credentials"))
        ) {
          generateMockData();
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [itemId, generateMockData]);

  // Process data for the chart
  const chartData = logs.map((log) => {
    const date = new Date(log.timestamp);
    const finalPrice = log.menu_item.base_price * log.new_coefficient;

    return {
      date: date,
      formattedDate: date.toLocaleDateString(),
      finalPrice: finalPrice,
    };
  });

  // Custom tooltip component
  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      value: number;
      payload: {
        formattedDate: string;
      };
    }>;
    label?: string;
  }

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background p-3 border border-border rounded-md shadow-md">
          <p className="font-medium text-sm mb-1">
            {payload[0].payload.formattedDate}
          </p>
          <p className="text-lg font-bold text-primary">
            ${payload[0].value.toFixed(2)}
          </p>
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
            Price History
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
            Price History
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
          Price History
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

      <div className="h-60 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 10, right: 10, left: 10, bottom: 20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis
              dataKey="formattedDate"
              tick={{ fontSize: 12 }}
              tickMargin={10}
              tickFormatter={(value, index) => {
                // Show fewer ticks for better readability
                return index % 5 === 0 ? value : "";
              }}
            />
            <YAxis
              tickFormatter={(value) => `$${value.toFixed(1)}`}
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
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <p className="text-sm text-muted-foreground mt-4 text-center">
        Price history over the last 30 days
      </p>
    </div>
  );
}
