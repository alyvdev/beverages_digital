import { useMemo } from "react";
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

interface CoefficientHistoryGraphProps {
  logs: CoefficientLog[];
}

export function CoefficientHistoryGraph({
  logs,
}: CoefficientHistoryGraphProps) {
  // Process data for the chart
  const chartData = useMemo(() => {
    // Sort logs by timestamp (oldest first)
    return [...logs]
      .sort(
        (a, b) =>
          new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
      )
      .map((log) => {
        const date = new Date(log.timestamp);
        const coefficient =
          typeof log.new_coefficient === "number"
            ? log.new_coefficient
            : parseFloat(String(log.new_coefficient));
        // Ensure base_price is a number, fallback to 10 if not available
        const basePrice =
          typeof log.menu_item.base_price === "number" &&
          log.menu_item.base_price > 0
            ? log.menu_item.base_price
            : typeof log.menu_item.base_price === "string" &&
              parseFloat(log.menu_item.base_price) > 0
            ? parseFloat(log.menu_item.base_price)
            : 10; // Fallback value
        const finalPrice = basePrice * coefficient;

        return {
          timestamp: date,
          formattedDate: date.toLocaleDateString(),
          formattedTime: date.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          coefficient,
          finalPrice,
          basePrice,
          reason: log.change_reason,
        };
      });
  }, [logs]);

  // Get color based on change reason
  const getReasonColor = (reason: ChangeReason) => {
    switch (reason) {
      case ChangeReason.ORDERED:
        return "#16a34a"; // green-600
      case ChangeReason.DECAYED:
        return "#d97706"; // amber-600
      case ChangeReason.MANUAL_UPDATE:
        return "#2563eb"; // blue-600
      case ChangeReason.CREATED:
        return "#9333ea"; // purple-600
      default:
        return "#4b5563"; // gray-600
    }
  };

  // Custom tooltip component
  interface TooltipProps {
    active?: boolean;
    payload?: Array<{
      payload: {
        formattedDate: string;
        formattedTime: string;
        coefficient: number;
        finalPrice: number;
        basePrice: number;
        reason: ChangeReason;
      };
    }>;
  }

  const CustomTooltip = ({ active, payload }: TooltipProps) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card p-3 border border-border rounded-md shadow-md">
          <p className="font-medium">{`${data.formattedDate} ${data.formattedTime}`}</p>
          <p className="text-sm">
            Coefficient:{" "}
            <span className="font-medium">{data.coefficient.toFixed(2)}</span>
          </p>
          <p className="text-sm">
            Final Price:{" "}
            <span className="font-medium">${data.finalPrice.toFixed(2)}</span>
          </p>
          <p className="text-xs mt-1">
            Base Price: ${data.basePrice.toFixed(2)}
          </p>
          <p className="text-xs mt-1">
            Change: {((data.coefficient - 1) * 100).toFixed(2)}% from base
            coefficient
          </p>
          <p className="text-xs mt-1">
            Reason:{" "}
            <span
              className="px-1.5 py-0.5 rounded-full"
              style={{
                backgroundColor: `${getReasonColor(data.reason)}20`,
                color: getReasonColor(data.reason),
              }}
            >
              {data.reason}
            </span>
          </p>
        </div>
      );
    }
    return null;
  };

  // If no data, show a message
  if (chartData.length === 0) {
    return (
      <div className="flex justify-center items-center h-64 bg-muted/20 rounded-lg">
        <p className="text-muted-foreground">No coefficient data available</p>
      </div>
    );
  }

  // Calculate min and max for Y axis with some padding
  const minCoefficient = Math.max(
    0.7,
    Math.min(...chartData.map((d) => d.coefficient)) - 0.1
  );
  const maxCoefficient = Math.min(
    2.1,
    Math.max(...chartData.map((d) => d.coefficient)) + 0.1
  );

  // Calculate min and max for final price Y axis
  const minFinalPrice = Math.max(
    0,
    Math.min(...chartData.map((d) => d.finalPrice)) - 1
  );
  const maxFinalPrice = Math.max(...chartData.map((d) => d.finalPrice)) + 1;

  return (
    <div className="w-full h-64 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="formattedDate"
            tick={{ fontSize: 12 }}
            tickMargin={10}
          />
          <YAxis
            yAxisId="left"
            domain={[minCoefficient, maxCoefficient]}
            tick={{ fontSize: 12 }}
            tickMargin={10}
            tickFormatter={(value) => value.toFixed(2)}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[minFinalPrice, maxFinalPrice]}
            tick={{ fontSize: 12 }}
            tickMargin={10}
            tickFormatter={(value) => `$${value.toFixed(2)}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend />
          <Line
            type="monotone"
            dataKey="coefficient"
            name="Coefficient"
            stroke="#2563eb"
            strokeWidth={2}
            yAxisId="left"
            dot={{
              stroke: "#2563eb",
              strokeWidth: 2,
              r: 4,
              fill: "#fff",
            }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="finalPrice"
            name="Final Price ($)"
            stroke="#10b981"
            strokeWidth={2}
            yAxisId="right"
            dot={{
              stroke: "#10b981",
              strokeWidth: 2,
              r: 4,
              fill: "#fff",
            }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
