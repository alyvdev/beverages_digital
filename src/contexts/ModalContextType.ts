import { createContext } from "react";

// Types for our modal context
export type ModalType = "priceHistory" | null;

// Define specific props for each modal type
export interface PriceHistoryModalProps {
  itemId: string;
}

// Union type for all possible modal props
export type ModalProps = PriceHistoryModalProps | null;

export interface ModalContextType {
  modalType: ModalType;
  modalProps: ModalProps;
  openModal: <T extends ModalProps>(type: ModalType, props?: T) => void;
  closeModal: () => void;
}

// Create the context
export const ModalContext = createContext<ModalContextType | undefined>(undefined);
