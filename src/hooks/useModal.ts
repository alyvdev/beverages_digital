import { useContext } from "react";
import { ModalContext } from "@/contexts/ModalContextType";

// Hook for using the modal context
export function useModal() {
  const context = useContext(ModalContext);
  if (context === undefined) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
}
