"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { UserDetailContext } from "./context/UserDetailContext";
import { SelectedChapterIndexContext } from "./context/SelectedChapterIndexContext";
const Provider = ({ children }: { children: React.ReactNode }) => {
  const [userDetail, setUserDetail] = useState<{
    id: number;
    name: string;
    email: string;
  } | null>(null);
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0);

  useEffect(() => {
    // Eliminar useUser y lógica asociada
  }, []);

  const CreateNewUser = async () => {
    const result = await axios.post("/api/user", {
      name: userDetail?.name, // Assuming userDetail is now managed by context
      email: userDetail?.email, // Assuming userDetail is now managed by context
    });

    setUserDetail(result.data.data);
  };
  return (
    <UserDetailContext.Provider
      value={{ user: userDetail, setUser: setUserDetail }}
    >
      <SelectedChapterIndexContext.Provider
        value={{ selectedChapterIndex, setSelectedChapterIndex }}
      >
        <div>{children}</div>
      </SelectedChapterIndexContext.Provider>
    </UserDetailContext.Provider>
  );
};

export default Provider;
