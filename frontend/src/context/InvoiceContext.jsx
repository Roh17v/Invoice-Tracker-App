import { createContext, useContext, useState } from "react";

const InvoiceContext = createContext();

export const useInvoice = () => useContext(InvoiceContext);

export const InvoiceProvider = ({ children }) => {
  const [refreshKey, setRefreshKey] = useState(0);

  const triggerRefresh = () => setRefreshKey((prev) => prev + 1);

  return (
    <InvoiceContext.Provider value={{ refreshKey, triggerRefresh }}>
      {children}
    </InvoiceContext.Provider>
  );
};
