import { createContext } from "react";

interface UserDetailContextType {
  user: { id: number; name: string; email: string } | null;
  setUser: (user: { id: number; name: string; email: string } | null) => void;
}

export const UserDetailContext = createContext<UserDetailContextType>({
  user: null,
  setUser: () => {},
});
