"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { UserDetailContext } from "./context/UserDetailContext";
const Provider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useUser();
  const [userDetail, setUserDetail] = useState<{
    id: number;
    name: string;
    email: string;
  } | null>(null);

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
      <div>{children}</div>
    </UserDetailContext.Provider>
  );
};

export default Provider;
