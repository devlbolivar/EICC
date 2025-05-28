import { createContext, useContext } from "react";

interface SelectedChapterIndexContextType {
  selectedChapterIndex: number;
  setSelectedChapterIndex: (index: number) => void;
}

export const SelectedChapterIndexContext =
  createContext<SelectedChapterIndexContextType>({
    selectedChapterIndex: 0,
    setSelectedChapterIndex: () => {},
  });

export const useSelectedChapterIndexContext = () => {
  const context = useContext(SelectedChapterIndexContext);
  if (!context) {
    throw new Error(
      "useSelectedChapterIndexContext must be used within a SelectedChapterIndexContext.Provider"
    );
  }
  return context;
};
