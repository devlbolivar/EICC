import React from "react";
import { Loader2 } from "lucide-react";

interface LoaderProps {
  message?: string;
  height?: string;
  iconSize?: string;
  className?: string;
}

export const Loader: React.FC<LoaderProps> = ({
  message = "Cargando...",
  height = "h-64",
  iconSize = "h-6 w-6",
  className = "",
}) => {
  return (
    <div className={`flex items-center justify-center ${height} ${className}`}>
      <div className="flex items-center space-x-2">
        <Loader2 className={`${iconSize} animate-spin`} />
        <span className="text-muted-foreground">{message}</span>
      </div>
    </div>
  );
};

export default Loader;
