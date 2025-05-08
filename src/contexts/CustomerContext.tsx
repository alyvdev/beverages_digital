import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect,
} from "react";

interface CustomerContextType {
  happyCustomers: number;
  incrementCustomers: (count?: number) => void;
}

const CUSTOMER_STORAGE_KEY = "beverages_happy_customers";
const DEFAULT_CUSTOMER_COUNT = 0; // Başlangıç değeri 0 olarak değiştirildi

const CustomerContext = createContext<CustomerContextType | undefined>(
  undefined
);

export function CustomerProvider({ children }: { children: ReactNode }) {
  const [happyCustomers, setHappyCustomers] = useState<number>(
    DEFAULT_CUSTOMER_COUNT
  );

  // Mevcut localStorage değerini sıfırla (sadece bir kerelik)
  useEffect(() => {
    // Eğer localStorage'da değer varsa, sıfırla
    localStorage.removeItem(CUSTOMER_STORAGE_KEY);
  }, []);

  // LocalStorage'dan müşteri sayısını yükle
  useEffect(() => {
    const savedCount = localStorage.getItem(CUSTOMER_STORAGE_KEY);
    if (savedCount) {
      try {
        const count = parseInt(savedCount, 10);
        setHappyCustomers(count);
      } catch (error) {
        console.error("Failed to parse saved customer count:", error);
        setHappyCustomers(DEFAULT_CUSTOMER_COUNT);
      }
    }
  }, []);

  // Müşteri sayısı değiştiğinde localStorage'a kaydet
  useEffect(() => {
    localStorage.setItem(CUSTOMER_STORAGE_KEY, happyCustomers.toString());
  }, [happyCustomers]);

  // Müşteri sayısını artır
  const incrementCustomers = (count: number = 1) => {
    setHappyCustomers((prevCount) => prevCount + count);
  };

  const value = {
    happyCustomers,
    incrementCustomers,
  };

  return (
    <CustomerContext.Provider value={value}>
      {children}
    </CustomerContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCustomers() {
  const context = useContext(CustomerContext);
  if (context === undefined) {
    throw new Error("useCustomers must be used within a CustomerProvider");
  }
  return context;
}
