import { useState, ReactNode } from "react";
import { PriceHistoryGraph } from "@/components/menu/PriceHistoryGraph";
import { FullscreenPriceHistoryModal } from "@/components/menu/FullscreenPriceHistoryModal";
import { ModalContext, ModalType, ModalProps } from "./ModalContextType";

// Provider component
export function ModalProvider({ children }: { children: ReactNode }) {
  const [modalType, setModalType] = useState<ModalType>(null);
  const [modalProps, setModalProps] = useState<ModalProps>(null);

  const openModal = <T extends ModalProps>(type: ModalType, props?: T) => {
    setModalType(type);
    setModalProps(props || null);
  };

  const closeModal = () => {
    setModalType(null);
    setModalProps(null);
  };

  return (
    <ModalContext.Provider
      value={{ modalType, modalProps, openModal, closeModal }}
    >
      {children}

      {/* Render the appropriate modal based on modalType */}
      {modalType === "priceHistory" && modalProps?.itemId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-background rounded-lg shadow-lg max-w-md w-full max-h-[80vh] overflow-auto p-6 m-4 animate-fade-in">
            <PriceHistoryGraph
              itemId={modalProps.itemId}
              itemName={modalProps.itemName || "Item"}
              onClose={closeModal}
            />
          </div>
        </div>
      )}
    </ModalContext.Provider>
  );
}
