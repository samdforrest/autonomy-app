import React, { createContext, ReactNode, useContext, useState } from 'react';

interface CompletionContextType {
  refreshTrigger: number;
  triggerRefresh: () => void;
}

const CompletionContext = createContext<CompletionContextType | undefined>(undefined);

export function CompletionProvider({ children }: { children: ReactNode }) {
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1);
    console.log('🔄 Completion refresh triggered:', refreshTrigger + 1);
  };

  return (
    <CompletionContext.Provider value={{ refreshTrigger, triggerRefresh }}>
      {children}
    </CompletionContext.Provider>
  );
}

export function useCompletion() {
  const context = useContext(CompletionContext);
  if (context === undefined) {
    throw new Error('useCompletion must be used within a CompletionProvider');
  }
  return context;
}
