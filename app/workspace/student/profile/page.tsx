"use client";

import React from "react";

// UI Components
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

// Icons
import { User, Mail, Calendar, Edit, Save, X, Loader2 } from "lucide-react";
import { Loader } from "@/components/ui/loader";

// Hooks and Types
import { useUserProfile } from "@/hooks/use-user-profile";
import { useCourses } from "@/hooks/use-courses";

// Constants
const CONSTANTS = {
  ICON_SIZES: {
    SMALL: "h-4 w-4",
    MEDIUM: "h-6 w-6",
    LARGE: "h-8 w-8",
    EXTRA_LARGE: "h-12 w-12",
  },
  MESSAGES: {
    TITLE: "Mi Perfil",
    DESCRIPTION: "Gestiona tu información personal y preferencias",
    LOADING: "Cargando perfil...",
    ERROR: "Error al cargar el perfil",
    PERSONAL_INFO: "Información Personal",
    PERSONAL_INFO_DESC: "Actualiza tu información personal y de contacto",
    SECURITY: "Seguridad",
    SECURITY_DESC: "Gestiona tu contraseña y configuraciones de seguridad",
    STATISTICS: "Estadísticas",
    ACCOUNT_INFO: "Información de la cuenta",
    EDIT: "Editar",
    CANCEL: "Cancelar",
    SAVE_CHANGES: "Guardar cambios",
    CHANGE_PASSWORD: "Cambiar contraseña",
    FULL_NAME: "Nombre completo",
    EMAIL: "Correo electrónico",
    PHONE: "Teléfono",
    LOCATION: "Ubicación",
    BIO: "Biografía",
    CURRENT_PASSWORD: "Contraseña actual",
    NEW_PASSWORD: "Nueva contraseña",
    CONFIRM_PASSWORD: "Confirmar nueva contraseña",
    EMAIL_SECURITY_NOTE:
      "El correo electrónico no se puede modificar por seguridad",
    PASSWORD_MISMATCH: "Las contraseñas nuevas no coinciden",
    STUDENT: "Estudiante",
    COMPLETED_COURSES: "Cursos completados",
    CERTIFICATES: "Certificados",
    STUDY_HOURS: "Horas de estudio",
    MEMBER_SINCE: "Miembro desde",
    EMAIL_VERIFIED: "Email verificado",
    NOT_AVAILABLE: "N/A",
  },
  FORM_FIELDS: {
    NAME: "name",
    EMAIL: "email",
    PHONE: "phone",
    LOCATION: "location",
    BIO: "bio",
    AVATAR: "avatar",
    CURRENT_PASSWORD: "current-password",
    NEW_PASSWORD: "new-password",
    CONFIRM_PASSWORD: "confirm-password",
  },
  PASSWORD_PLACEHOLDER: "••••••••",
  AVATAR_SIZE: "w-24 h-24",
  AVATAR_ICON_SIZE: "h-12 w-12",
  DATE_FORMAT: {
    locale: "es-ES",
    options: {
      year: "numeric",
      month: "long",
    },
  },
} as const;

const StudentProfile = () => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [passwordData, setPasswordData] = React.useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const { profile, loading, updating, updateProfile, changePassword } =
    useUserProfile();
  const {
    enrolledCourses,
    fetchEnrolledCourses,
    loading: coursesLoading,
  } = useCourses();

  const [formData, setFormData] = React.useState({
    name: "",
    phone: "",
    location: "",
    bio: "",
    avatar: "",
  });

  // Helper functions
  const formatDate = (dateString: string | Date) => {
    if (!dateString) return CONSTANTS.MESSAGES.NOT_AVAILABLE;
    return new Date(dateString).toLocaleDateString(
      CONSTANTS.DATE_FORMAT.locale,
      CONSTANTS.DATE_FORMAT.options
    );
  };

  const getEmailVerificationStatus = (isVerified: boolean) => {
    return {
      text: isVerified ? "✓" : "✗",
      className: isVerified ? "text-green-600" : "text-red-600",
    };
  };

  const isPasswordFormValid = () => {
    return (
      passwordData.currentPassword &&
      passwordData.newPassword &&
      passwordData.confirmPassword &&
      passwordData.newPassword === passwordData.confirmPassword
    );
  };

  const resetFormData = () => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        phone: profile.phone || "",
        location: profile.location || "",
        bio: profile.bio || "",
        avatar: profile.avatar || "",
      });
    }
  };

  const resetPasswordData = () => {
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  // Calculate study hours the same way as dashboard
  const calculateStudyHours = () => {
    // If no enrolled courses data yet, fallback to profile data
    if (!enrolledCourses || enrolledCourses.length === 0) {
      return profile?.totalStudyHours || 0;
    }

    return (
      Math.round(
        enrolledCourses.reduce((sum, course) => {
          const estimatedHours = parseFloat(
            course.estimatedTime?.replace("h", "") || "0"
          );
          const progressMultiplier = (course.progress || 0) / 100;
          return sum + estimatedHours * progressMultiplier;
        }, 0) * 10
      ) / 10
    );
  };

  // Update form data when profile loads
  React.useEffect(() => {
    resetFormData();
  }, [profile]);

  // Fetch enrolled courses when component mounts
  React.useEffect(() => {
    fetchEnrolledCourses();
  }, [fetchEnrolledCourses]);

  const handleSaveProfile = async () => {
    const success = await updateProfile(formData);
    if (success) {
      setIsEditing(false);
    }
  };

  const handleChangePassword = async () => {
    if (!isPasswordFormValid()) {
      alert(CONSTANTS.MESSAGES.PASSWORD_MISMATCH);
      return;
    }

    const success = await changePassword(passwordData);
    if (success) {
      resetPasswordData();
    }
  };

  const handleCancel = () => {
    resetFormData();
    resetPasswordData();
    setIsEditing(false);
  };

  if (loading || coursesLoading) {
    return (
      <Loader message={CONSTANTS.MESSAGES.LOADING} height="min-h-[400px]" />
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">{CONSTANTS.MESSAGES.ERROR}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {CONSTANTS.MESSAGES.TITLE}
          </h1>
          <p className="text-muted-foreground">
            {CONSTANTS.MESSAGES.DESCRIPTION}
          </p>
        </div>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "outline" : "default"}
          disabled={updating}
        >
          {isEditing ? (
            <>
              <X className={`${CONSTANTS.ICON_SIZES.SMALL} mr-2`} />
              {CONSTANTS.MESSAGES.CANCEL}
            </>
          ) : (
            <>
              <Edit className={`${CONSTANTS.ICON_SIZES.SMALL} mr-2`} />
              {CONSTANTS.MESSAGES.EDIT}
            </>
          )}
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Información Principal */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{CONSTANTS.MESSAGES.PERSONAL_INFO}</CardTitle>
              <CardDescription>
                {CONSTANTS.MESSAGES.PERSONAL_INFO_DESC}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={CONSTANTS.FORM_FIELDS.NAME}>
                    {CONSTANTS.MESSAGES.FULL_NAME}
                  </Label>
                  <Input
                    id={CONSTANTS.FORM_FIELDS.NAME}
                    value={formData.name}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={CONSTANTS.FORM_FIELDS.EMAIL}>
                    {CONSTANTS.MESSAGES.EMAIL}
                  </Label>
                  <Input
                    id={CONSTANTS.FORM_FIELDS.EMAIL}
                    type="email"
                    value={profile.email || ""}
                    disabled={true}
                    className="bg-gray-50 text-gray-600"
                  />
                  <p className="text-xs text-muted-foreground">
                    {CONSTANTS.MESSAGES.EMAIL_SECURITY_NOTE}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={CONSTANTS.FORM_FIELDS.PHONE}>
                    {CONSTANTS.MESSAGES.PHONE}
                  </Label>
                  <Input
                    id={CONSTANTS.FORM_FIELDS.PHONE}
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        phone: e.target.value,
                      }))
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={CONSTANTS.FORM_FIELDS.LOCATION}>
                    {CONSTANTS.MESSAGES.LOCATION}
                  </Label>
                  <Input
                    id={CONSTANTS.FORM_FIELDS.LOCATION}
                    value={formData.location}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        location: e.target.value,
                      }))
                    }
                    disabled={!isEditing}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor={CONSTANTS.FORM_FIELDS.BIO}>
                  {CONSTANTS.MESSAGES.BIO}
                </Label>
                <Textarea
                  id={CONSTANTS.FORM_FIELDS.BIO}
                  value={formData.bio}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, bio: e.target.value }))
                  }
                  disabled={!isEditing}
                  rows={3}
                />
              </div>
              {isEditing && (
                <div className="flex gap-2">
                  <Button onClick={handleSaveProfile} disabled={updating}>
                    {updating ? (
                      <Loader2
                        className={`${CONSTANTS.ICON_SIZES.SMALL} mr-2 animate-spin`}
                      />
                    ) : (
                      <Save className={`${CONSTANTS.ICON_SIZES.SMALL} mr-2`} />
                    )}
                    {CONSTANTS.MESSAGES.SAVE_CHANGES}
                  </Button>
                  <Button onClick={handleCancel} variant="outline">
                    <X className={`${CONSTANTS.ICON_SIZES.SMALL} mr-2`} />
                    {CONSTANTS.MESSAGES.CANCEL}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{CONSTANTS.MESSAGES.SECURITY}</CardTitle>
              <CardDescription>
                {CONSTANTS.MESSAGES.SECURITY_DESC}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={CONSTANTS.FORM_FIELDS.CURRENT_PASSWORD}>
                    {CONSTANTS.MESSAGES.CURRENT_PASSWORD}
                  </Label>
                  <Input
                    id={CONSTANTS.FORM_FIELDS.CURRENT_PASSWORD}
                    type="password"
                    placeholder={CONSTANTS.PASSWORD_PLACEHOLDER}
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        currentPassword: e.target.value,
                      }))
                    }
                    disabled={!isEditing}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={CONSTANTS.FORM_FIELDS.NEW_PASSWORD}>
                    {CONSTANTS.MESSAGES.NEW_PASSWORD}
                  </Label>
                  <Input
                    id={CONSTANTS.FORM_FIELDS.NEW_PASSWORD}
                    type="password"
                    placeholder={CONSTANTS.PASSWORD_PLACEHOLDER}
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData((prev) => ({
                        ...prev,
                        newPassword: e.target.value,
                      }))
                    }
                    disabled={!isEditing}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor={CONSTANTS.FORM_FIELDS.CONFIRM_PASSWORD}>
                  {CONSTANTS.MESSAGES.CONFIRM_PASSWORD}
                </Label>
                <Input
                  id={CONSTANTS.FORM_FIELDS.CONFIRM_PASSWORD}
                  type="password"
                  placeholder={CONSTANTS.PASSWORD_PLACEHOLDER}
                  value={passwordData.confirmPassword}
                  onChange={(e) =>
                    setPasswordData((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value,
                    }))
                  }
                  disabled={!isEditing}
                />
              </div>
              {isEditing && (
                <Button
                  variant="outline"
                  onClick={handleChangePassword}
                  disabled={updating || !isPasswordFormValid()}
                >
                  {updating ? (
                    <Loader2
                      className={`${CONSTANTS.ICON_SIZES.SMALL} mr-2 animate-spin`}
                    />
                  ) : null}
                  {CONSTANTS.MESSAGES.CHANGE_PASSWORD}
                </Button>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Avatar y Stats */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <div
                    className={`${CONSTANTS.AVATAR_SIZE} rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center`}
                  >
                    <User
                      className={`${CONSTANTS.AVATAR_ICON_SIZE} text-white`}
                    />
                  </div>
                  {isEditing && (
                    <Button
                      size="sm"
                      className="absolute -bottom-2 -right-2 rounded-full w-8 h-8"
                    >
                      <Edit className={`${CONSTANTS.ICON_SIZES.SMALL}`} />
                    </Button>
                  )}
                </div>
                <div className="text-center">
                  <h3 className="text-lg font-semibold">{profile.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {CONSTANTS.MESSAGES.STUDENT}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Estadísticas */}
          <Card>
            <CardHeader>
              <CardTitle>{CONSTANTS.MESSAGES.STATISTICS}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {CONSTANTS.MESSAGES.COMPLETED_COURSES}
                </span>
                <span className="font-semibold">
                  {profile.coursesCompleted || 0}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {CONSTANTS.MESSAGES.CERTIFICATES}
                </span>
                <span className="font-semibold">
                  {profile.certificatesEarned || 0}
                </span>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {CONSTANTS.MESSAGES.STUDY_HOURS}
                </span>
                <span className="font-semibold">{calculateStudyHours()}h</span>
              </div>
            </CardContent>
          </Card>

          {/* Información de la cuenta */}
          <Card>
            <CardHeader>
              <CardTitle>{CONSTANTS.MESSAGES.ACCOUNT_INFO}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm">
                <Calendar
                  className={`${CONSTANTS.ICON_SIZES.SMALL} text-muted-foreground`}
                />
                <span>{CONSTANTS.MESSAGES.MEMBER_SINCE}</span>
                <span className="font-medium">
                  {formatDate(profile.createdAt)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Mail
                  className={`${CONSTANTS.ICON_SIZES.SMALL} text-muted-foreground`}
                />
                <span>{CONSTANTS.MESSAGES.EMAIL_VERIFIED}</span>
                <span
                  className={
                    getEmailVerificationStatus(profile.emailVerified).className
                  }
                >
                  {getEmailVerificationStatus(profile.emailVerified).text}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
