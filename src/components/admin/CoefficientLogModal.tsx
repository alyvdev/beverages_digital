import { useState, useEffect } from "react";
import { X, LineChart, ScrollText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CoefficientLog, ChangeReason } from "@/types";
import { coefficientLogApi } from "@/lib/api";
import { CoefficientHistoryGraph } from "./CoefficientHistoryGraph";

interface CoefficientLogModalProps {
  itemId: string;
  onClose: () => void;
}

export function CoefficientLogModal({
  itemId,
  onClose,
}: CoefficientLogModalProps) {
  const [logs, setLogs] = useState<CoefficientLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"list" | "graph">("graph");
  const [isAuthError, setIsAuthError] = useState(false);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await coefficientLogApi.getHistoryByItemId(itemId);
        setLogs(data);
        setIsAuthError(false);
      } catch (err) {
        console.error("Error fetching coefficient logs:", err);

        // Check if it's an authentication error
        if (
          err instanceof Error &&
          (err.message.includes("401") ||
            err.message.includes("auth") ||
            err.message.includes("token") ||
            err.message.includes("Server error"))
        ) {
          setIsAuthError(true);

          // Generate mock data for demonstration
          const generateMockData = (): CoefficientLog[] => {
            const now = new Date();
            const mockLogs: CoefficientLog[] = [];

            // Create a series of mock logs with different timestamps and reasons
            for (let i = 0; i < 5; i++) {
              const date = new Date(now);
              date.setDate(date.getDate() - i);

              const prevCoef = 1 + i * 0.05;
              const newCoef = prevCoef + (i % 2 === 0 ? 0.05 : -0.03);

              mockLogs.push({
                id: `mock-${i}`,
                item_id: itemId,
                timestamp: date.toISOString(),
                previous_coefficient: prevCoef,
                new_coefficient: newCoef,
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
                  base_price: 10,
                  coefficient: newCoef,
                  final_price: 10 * newCoef,
                },
              });
            }

            return mockLogs;
          };

          // Use mock data for demonstration
          setLogs(generateMockData());
          setError(
            "Authentication required. Showing sample data for demonstration."
          );
        } else {
          setError("Failed to load coefficient logs");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [itemId]);

  const getReasonLabel = (reason: ChangeReason) => {
    switch (reason) {
      case ChangeReason.ORDERED:
        return "Ordered";
      case ChangeReason.DECAYED:
        return "Decayed";
      case ChangeReason.MANUAL_UPDATE:
        return "Manual Update";
      case ChangeReason.CREATED:
        return "Created";
      default:
        return reason;
    }
  };

  const getReasonColor = (reason: ChangeReason) => {
    switch (reason) {
      case ChangeReason.ORDERED:
        return "text-green-600 bg-green-100";
      case ChangeReason.DECAYED:
        return "text-amber-600 bg-amber-100";
      case ChangeReason.MANUAL_UPDATE:
        return "text-blue-600 bg-blue-100";
      case ChangeReason.CREATED:
        return "text-purple-600 bg-purple-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-card rounded-lg shadow-lg max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold">Coefficient History</h2>
            {isAuthError && (
              <span className="px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-800 rounded-full">
                Demo Mode
              </span>
            )}
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border">
          <button
            className={`flex items-center gap-2 px-4 py-3 font-medium text-sm ${
              activeTab === "graph"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("graph")}
          >
            <LineChart className="h-4 w-4" />
            Graph View
          </button>
          <button
            className={`flex items-center gap-2 px-4 py-3 font-medium text-sm ${
              activeTab === "list"
                ? "border-b-2 border-primary text-primary"
                : "text-muted-foreground hover:text-foreground"
            }`}
            onClick={() => setActiveTab("list")}
          >
            <span className="h-4 w-4 flex items-center justify-center">
              <ScrollText />
            </span>
            List View
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <p>Loading coefficient logs...</p>
            </div>
          ) : error ? (
            <div
              className={`p-4 rounded-md ${
                isAuthError
                  ? "bg-amber-100/50 border border-amber-300 text-amber-800"
                  : "bg-destructive/10 border border-destructive text-destructive"
              }`}
            >
              <p>{error}</p>
              {isAuthError && (
                <p className="text-sm mt-2">
                  Note: The data shown is simulated for demonstration purposes.
                  Please log in with admin credentials to view actual
                  coefficient history.
                </p>
              )}
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No coefficient logs found</p>
            </div>
          ) : (
            <>
              {/* Graph View */}
              {activeTab === "graph" && (
                <div className="mb-4">
                  <CoefficientHistoryGraph logs={logs} />
                  <div className="mt-4 p-3 bg-muted/20 rounded-md text-sm text-muted-foreground">
                    <p>
                      This graph shows how the coefficient has changed over
                      time. Each point represents a change, with colors
                      indicating the reason for the change.
                    </p>
                    {isAuthError && (
                      <p className="mt-2 text-amber-600 font-medium">
                        Note: Currently displaying simulated data for
                        demonstration purposes.
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* List View */}
              {activeTab === "list" && (
                <div className="space-y-4">
                  {logs.map((log) => (
                    <div
                      key={log.id}
                      className="border border-border rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <span
                            className={`inline-block px-2 py-1 rounded-full text-xs ${getReasonColor(
                              log.change_reason
                            )}`}
                          >
                            {getReasonLabel(log.change_reason)}
                          </span>
                          <p className="text-sm text-muted-foreground mt-1">
                            {new Date(log.timestamp).toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="mb-2">
                            <p className="text-sm font-medium">Coefficient</p>
                            {/* Calculate coefficient values and change */}
                            {(() => {
                              // Ensure coefficients are numbers
                              const prevCoef =
                                typeof log.previous_coefficient === "number"
                                  ? log.previous_coefficient
                                  : parseFloat(
                                      String(log.previous_coefficient)
                                    );

                              const newCoef =
                                typeof log.new_coefficient === "number"
                                  ? log.new_coefficient
                                  : parseFloat(String(log.new_coefficient));

                              // Calculate percentage change
                              const percentChange =
                                prevCoef > 0
                                  ? ((newCoef - prevCoef) / prevCoef) * 100
                                  : 0;

                              return (
                                <>
                                  <p className="text-sm">
                                    {prevCoef.toFixed(2)} →{" "}
                                    <span className="font-medium">
                                      {newCoef.toFixed(2)}
                                    </span>
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {percentChange.toFixed(2)}% change
                                  </p>
                                </>
                              );
                            })()}
                          </div>

                          <div>
                            <p className="text-sm font-medium">Final Price</p>
                            {/* Calculate previous and new final prices */}
                            {(() => {
                              // Ensure base_price is a number
                              const basePrice =
                                typeof log.menu_item.base_price === "number"
                                  ? log.menu_item.base_price
                                  : 10; // Fallback to 10 if not available

                              // Calculate previous and new final prices
                              const prevFinalPrice =
                                basePrice * log.previous_coefficient;
                              const newFinalPrice =
                                basePrice * log.new_coefficient;

                              // Calculate percentage change
                              const percentChange =
                                prevFinalPrice > 0
                                  ? ((newFinalPrice - prevFinalPrice) /
                                      prevFinalPrice) *
                                    100
                                  : 0;

                              return (
                                <>
                                  <p className="text-sm">
                                    ${prevFinalPrice.toFixed(2)} →{" "}
                                    <span className="font-medium">
                                      ${newFinalPrice.toFixed(2)}
                                    </span>
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {percentChange.toFixed(2)}% change
                                  </p>
                                </>
                              );
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-4 border-t border-border">
          <Button variant="outline" className="w-full" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
