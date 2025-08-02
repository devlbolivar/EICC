"use client";
import React, { useState } from "react";
import { UserDetailContext } from "./context/UserDetailContext";
import { SelectedChapterIndexContext } from "./context/SelectedChapterIndexContext";

const Provider = ({ children }: { children: React.ReactNode }) => {
  const [userDetail, setUserDetail] = useState<{
    id: number;
    name: string;
    email: string;
  } | null>(null);
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0);

  return (
    <UserDetailContext.Provider
      value={{ user: userDetail, setUser: setUserDetail }}
    >
      <SelectedChapterIndexContext.Provider
        value={{ selectedChapterIndex, setSelectedChapterIndex }}
      >
        {children}
      </SelectedChapterIndexContext.Provider>
    </UserDetailContext.Provider>
  );
};

export default Provider;
