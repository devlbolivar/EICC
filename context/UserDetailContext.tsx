import { createContext } from "react";
import { UserDetailContextType } from "@/app/types";

export const UserDetailContext = createContext<UserDetailContextType>({
  user: null,
  setUser: () => {},
});
