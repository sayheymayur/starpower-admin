import React, { createContext, useContext, useState, ReactNode } from "react";

type ModalContextType = {
  isAddTaskModalOpen: boolean;
  setAddTaskModalOpen: (isOpen: boolean) => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAddTaskModalOpen, setAddTaskModalOpen] = useState(false);

  return (
    <ModalContext.Provider value={{ isAddTaskModalOpen, setAddTaskModalOpen }}>
      {children}
    </ModalContext.Provider>
  );
};

export const useModal = (): ModalContextType => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
