import { UserProfile } from "@clerk/nextjs";
import React from "react";

const Profile = () => {
  return (
    <div>
      <h2 className="text-3xl font-bold mb-7">Gestiona tu perfil</h2>
      <UserProfile />
    </div>
  );
};

export default Profile;
