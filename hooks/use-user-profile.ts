"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { User } from "@/app/types";
import { toast } from "sonner";

export interface UserProfile extends User {
  phone?: string;
  location?: string;
  bio?: string;
  coursesCompleted?: number;
  certificatesEarned?: number;
  totalStudyHours?: number;
}

export interface UserProfileUpdateData {
  name: string;
  phone?: string;
  location?: string;
  bio?: string;
  avatar?: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export const useUserProfile = () => {
  const { session } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  // Load user profile data
  const loadProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/user", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        const user = data.data?.user || data.user;

        if (!user) {
          throw new Error("No se encontraron datos de usuario");
        }

        setProfile({
          ...user,
          // Add default values for additional fields
          phone: user.phone || "",
          location: user.location || "",
          bio: user.bio || "",
          coursesCompleted: user.coursesCompleted || 0,
          certificatesEarned: user.certificatesEarned || 0,
          totalStudyHours: user.totalStudyHours || 0,
        });
      } else {
        throw new Error("Error al cargar el perfil");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Error al cargar el perfil del usuario");
    } finally {
      setLoading(false);
    }
  };

  // Update user profile
  const updateProfile = async (data: UserProfileUpdateData) => {
    try {
      setUpdating(true);
      const response = await fetch("/api/user", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        const updatedUser = result.data?.user || result.user;
        if (updatedUser) {
          setProfile((prev) => (prev ? { ...prev, ...updatedUser } : null));
        }
        toast.success("Perfil actualizado exitosamente");
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.error || "Error al actualizar el perfil");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al actualizar el perfil"
      );
      return false;
    } finally {
      setUpdating(false);
    }
  };

  // Change password
  const changePassword = async (data: PasswordChangeData) => {
    try {
      setUpdating(true);
      const response = await fetch("/api/user/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(data),
      });

      if (response.ok) {
        toast.success("Contraseña cambiada exitosamente");
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.error || "Error al cambiar la contraseña");
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al cambiar la contraseña"
      );
      return false;
    } finally {
      setUpdating(false);
    }
  };

  // Load user statistics
  const loadUserStatistics = async () => {
    try {
      const response = await fetch("/api/user/statistics", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        const stats = data.data || data;
        setProfile((prev) =>
          prev
            ? {
                ...prev,
                coursesCompleted: stats.coursesCompleted || 0,
                certificatesEarned: stats.certificatesEarned || 0,
                totalStudyHours: stats.totalStudyHours || 0,
              }
            : null
        );
      }
    } catch (error) {
      console.error("Error loading user statistics:", error);
    }
  };

  // Upload avatar
  const uploadAvatar = async (avatarBase64: string) => {
    try {
      setUpdating(true);
      const response = await fetch("/api/user/avatar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ avatar: avatarBase64 }),
      });

      if (response.ok) {
        const result = await response.json();
        const updatedUser = result.data?.user || result.user;
        if (updatedUser) {
          setProfile((prev) => (prev ? { ...prev, avatar: updatedUser.avatar } : null));
        }
        toast.success("Avatar actualizado exitosamente");
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.error || "Error al actualizar avatar");
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al actualizar avatar"
      );
      return false;
    } finally {
      setUpdating(false);
    }
  };

  // Delete avatar
  const deleteAvatar = async () => {
    try {
      setUpdating(true);
      const response = await fetch("/api/user/avatar", {
        method: "DELETE",
        credentials: "include",
      });

      if (response.ok) {
        setProfile((prev) => (prev ? { ...prev, avatar: null } : null));
        toast.success("Avatar eliminado exitosamente");
        return true;
      } else {
        const error = await response.json();
        throw new Error(error.error || "Error al eliminar avatar");
      }
    } catch (error) {
      console.error("Error deleting avatar:", error);
      toast.error(
        error instanceof Error ? error.message : "Error al eliminar avatar"
      );
      return false;
    } finally {
      setUpdating(false);
    }
  };

  // Load profile on mount
  useEffect(() => {
    if (session?.user) {
      loadProfile();
      loadUserStatistics();
    }
  }, [session]);

  return {
    profile,
    loading,
    updating,
    updateProfile,
    changePassword,
    loadProfile,
    loadUserStatistics,
    uploadAvatar,
    deleteAvatar,
  };
};
