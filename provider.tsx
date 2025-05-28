"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { UserDetailContext } from "./context/UserDetailContext";
import { SelectedChapterIndexContext } from "./context/SelectedChapterIndexContext";
const Provider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();
  const [userDetail, setUserDetail] = useState<{
    id: number;
    name: string;
    email: string;
  } | null>(null);
  const [selectedChapterIndex, setSelectedChapterIndex] = useState(0);

  useEffect(() => {
    if (user) {
      CreateNewUser();
    }
  }, [user]);

  const CreateNewUser = async () => {
    const result = await axios.post("/api/user", {
      name: user?.fullName,
      email: user?.emailAddresses[0].emailAddress,
    });

    setUserDetail(result.data);
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
