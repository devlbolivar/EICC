"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Building2,
  Edit,
  Save,
  X,
  Loader2,
  AlertCircle,
  CheckCircle,
  Plus,
} from "lucide-react";
import {
  useCompanyProfile,
  CompanyProfileUpdateData,
} from "@/hooks/use-company-profile";

const CompanyProfile = () => {
  const {
    companyProfile,
    loading,
    error,
    isEditing,
    setIsEditing,
    updateProfile,
    refreshProfile,
    clearError,
  } = useCompanyProfile();

  const [formData, setFormData] = React.useState<CompanyProfileUpdateData>({
    name: "",
    rut: "",
    taxIdType: "rut",
    description: "",
    website: "",
    industry: "",
    size: "",
  });

  const [successMessage, setSuccessMessage] = React.useState<string | null>(
    null
  );
  const [validationErrors, setValidationErrors] = React.useState<
    Record<string, string>
  >({});

  // Create company modal state
  const [isCreateCompanyOpen, setIsCreateCompanyOpen] = React.useState(false);
  const [isCreatingCompany, setIsCreatingCompany] = React.useState(false);
  const [createCompanyData, setCreateCompanyData] = React.useState({
    name: "",
    taxId: "",
    taxIdType: "rut", // Default to RUT for backward compatibility
    description: "",
  });
  const [createCompanyErrors, setCreateCompanyErrors] = React.useState<
    Record<string, string>
  >({});

  // Update form data when company profile changes
  React.useEffect(() => {
    if (companyProfile) {
      setFormData({
        name: companyProfile.name || "",
        rut: companyProfile.rut || "",
        taxIdType: companyProfile.taxIdType || "rut",
        description: companyProfile.description || "",
        website: companyProfile.website || "",
        industry: companyProfile.industry || "",
        size: companyProfile.size || "",
      });
    }
  }, [companyProfile]);

  // Validation functions
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = "El nombre de la empresa es requerido";
    } else if (formData.name.trim().length < 2) {
      errors.name = "El nombre debe tener al menos 2 caracteres";
    }

    if (!formData.rut.trim()) {
      errors.rut = "El número de identificación fiscal es requerido";
    } else {
      // Validate based on tax ID type
      const taxId = formData.rut.trim();
      const taxIdType = formData.taxIdType || "rut";

      switch (taxIdType) {
        case "rut":
          // Chilean RUT format
          const rutRegex = /^[0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9kK]$/;
          if (!rutRegex.test(taxId)) {
            errors.rut = "Formato de RUT inválido (ej: 12.345.678-9)";
          }
          break;
        case "tax_id":
          // Generic tax ID - alphanumeric, 5-20 characters
          const genericRegex = /^[A-Za-z0-9\-]{5,20}$/;
          if (!genericRegex.test(taxId)) {
            errors.rut =
              "Formato de ID fiscal inválido (5-20 caracteres alfanuméricos)";
          }
          break;
        case "vat":
          // European VAT format
          const vatRegex = /^[A-Z]{2}[0-9A-Z]{2,12}$/;
          if (!vatRegex.test(taxId)) {
            errors.rut = "Formato de VAT inválido (ej: ES12345678Z)";
          }
          break;
        case "ein":
          // US EIN format
          const einRegex = /^[0-9]{2}-[0-9]{7}$/;
          if (!einRegex.test(taxId)) {
            errors.rut = "Formato de EIN inválido (ej: 12-3456789)";
          }
          break;
        case "cnpj":
          // Brazilian CNPJ format
          const cnpjRegex = /^[0-9]{2}\.[0-9]{3}\.[0-9]{3}\/[0-9]{4}-[0-9]{2}$/;
          if (!cnpjRegex.test(taxId)) {
            errors.rut = "Formato de CNPJ inválido (ej: 12.345.678/0001-90)";
          }
          break;
        case "other":
          // Other format - just check it's not empty and reasonable length
          if (taxId.length < 3 || taxId.length > 50) {
            errors.rut = "El ID fiscal debe tener entre 3 y 50 caracteres";
          }
          break;
      }
    }

    if (formData.website && formData.website.trim()) {
      const urlRegex = /^https?:\/\/.+/;
      if (!urlRegex.test(formData.website.trim())) {
        errors.website =
          "Debe ser una URL válida (ej: https://www.ejemplo.com)";
      }
    }

    if (formData.description && formData.description.trim().length > 500) {
      errors.description = "La descripción no puede exceder 500 caracteres";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (
    field: keyof CompanyProfileUpdateData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear validation error for this field when user starts typing
    if (validationErrors[field]) {
      setValidationErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleSave = async () => {
    try {
      clearError();
      setSuccessMessage(null);
      setValidationErrors({});

      // Validate form before saving
      if (!validateForm()) {
        return;
      }

      await updateProfile(formData);
      setSuccessMessage("Perfil actualizado exitosamente");
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error("Error saving profile:", err);
    }
  };

  const handleCancel = () => {
    if (companyProfile) {
      setFormData({
        name: companyProfile.name || "",
        rut: companyProfile.rut || "",
        taxIdType: companyProfile.taxIdType || "rut",
        description: companyProfile.description || "",
        website: companyProfile.website || "",
        industry: companyProfile.industry || "",
        size: companyProfile.size || "",
      });
    }
    setIsEditing(false);
    clearError();
    setSuccessMessage(null);
    setValidationErrors({});
  };

  // Create company functions
  const validateCreateCompanyForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!createCompanyData.name.trim()) {
      errors.name = "El nombre de la empresa es requerido";
    } else if (createCompanyData.name.trim().length < 2) {
      errors.name = "El nombre debe tener al menos 2 caracteres";
    }

    if (!createCompanyData.taxId.trim()) {
      errors.taxId = "El número de identificación fiscal es requerido";
    } else {
      // Validate based on tax ID type
      const taxId = createCompanyData.taxId.trim();
      const taxIdType = createCompanyData.taxIdType;

      switch (taxIdType) {
        case "rut":
          // Chilean RUT format
          const rutRegex = /^[0-9]{1,2}\.[0-9]{3}\.[0-9]{3}-[0-9kK]$/;
          if (!rutRegex.test(taxId)) {
            errors.taxId = "Formato de RUT inválido (ej: 12.345.678-9)";
          }
          break;
        case "tax_id":
          // Generic tax ID - alphanumeric, 5-20 characters
          const genericRegex = /^[A-Za-z0-9\-]{5,20}$/;
          if (!genericRegex.test(taxId)) {
            errors.taxId =
              "Formato de ID fiscal inválido (5-20 caracteres alfanuméricos)";
          }
          break;
        case "vat":
          // European VAT format
          const vatRegex = /^[A-Z]{2}[0-9A-Z]{2,12}$/;
          if (!vatRegex.test(taxId)) {
            errors.taxId = "Formato de VAT inválido (ej: ES12345678Z)";
          }
          break;
        case "ein":
          // US EIN format
          const einRegex = /^[0-9]{2}-[0-9]{7}$/;
          if (!einRegex.test(taxId)) {
            errors.taxId = "Formato de EIN inválido (ej: 12-3456789)";
          }
          break;
        case "cnpj":
          // Brazilian CNPJ format
          const cnpjRegex = /^[0-9]{2}\.[0-9]{3}\.[0-9]{3}\/[0-9]{4}-[0-9]{2}$/;
          if (!cnpjRegex.test(taxId)) {
            errors.taxId = "Formato de CNPJ inválido (ej: 12.345.678/0001-90)";
          }
          break;
        case "other":
          // Other format - just check it's not empty and reasonable length
          if (taxId.length < 3 || taxId.length > 50) {
            errors.taxId = "El ID fiscal debe tener entre 3 y 50 caracteres";
          }
          break;
      }
    }

    if (
      createCompanyData.description &&
      createCompanyData.description.trim().length > 500
    ) {
      errors.description = "La descripción no puede exceder 500 caracteres";
    }

    setCreateCompanyErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateCompanyInputChange = (field: string, value: string) => {
    setCreateCompanyData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear validation error for this field when user starts typing
    if (createCompanyErrors[field]) {
      setCreateCompanyErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleCreateCompany = async () => {
    try {
      setIsCreatingCompany(true);
      setCreateCompanyErrors({});

      // Validate form before creating
      if (!validateCreateCompanyForm()) {
        return;
      }

      const response = await fetch("/api/company/create-for-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(createCompanyData),
      });

      const data = await response.json();

      if (data.success) {
        setIsCreateCompanyOpen(false);
        setCreateCompanyData({
          name: "",
          taxId: "",
          taxIdType: "rut",
          description: "",
        });
        setSuccessMessage("Empresa creada exitosamente. Recargando página...");

        // Refresh the profile data
        await refreshProfile();

        setTimeout(() => {
          setSuccessMessage(null);
        }, 3000);
      } else {
        setCreateCompanyErrors({ general: data.error });
      }
    } catch (error) {
      console.error("Error creating company:", error);
      setCreateCompanyErrors({ general: "Error al crear la empresa" });
    } finally {
      setIsCreatingCompany(false);
    }
  };

  const handleCreateCompanyCancel = () => {
    setIsCreateCompanyOpen(false);
    setCreateCompanyData({
      name: "",
      taxId: "",
      taxIdType: "rut",
      description: "",
    });
    setCreateCompanyErrors({});
  };

  if (loading && !companyProfile) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>Cargando perfil de empresa...</span>
        </div>
      </div>
    );
  }

  if (!companyProfile && !loading) {
    return (
      <div className="p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.includes("No estás asociado a ninguna empresa") ? (
              <div className="space-y-2">
                <p>No estás asociado a ninguna empresa.</p>
                <p className="text-sm text-gray-600">
                  Tu cuenta tiene permisos de empresa pero no estás asociado a
                  ninguna empresa específica. Por favor, contacta al
                  administrador o crea una nueva empresa.
                </p>
                <div className="flex gap-2 mt-4">
                  <Button
                    onClick={() =>
                      (window.location.href = "/workspace/company/dashboard")
                    }
                    variant="outline"
                  >
                    Ir al Dashboard
                  </Button>

                  <Dialog
                    open={isCreateCompanyOpen}
                    onOpenChange={setIsCreateCompanyOpen}
                  >
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="w-4 h-4 mr-2" />
                        Crear Empresa
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                      <DialogHeader>
                        <DialogTitle>Crear Nueva Empresa</DialogTitle>
                        <DialogDescription>
                          Completa la información básica para crear tu empresa.
                        </DialogDescription>
                      </DialogHeader>

                      <div className="grid gap-4 py-4">
                        {/* General Error */}
                        {createCompanyErrors.general && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                              {createCompanyErrors.general}
                            </AlertDescription>
                          </Alert>
                        )}

                        {/* Company Name */}
                        <div className="space-y-2">
                          <Label htmlFor="create-name">
                            Nombre de la Empresa *
                          </Label>
                          <Input
                            id="create-name"
                            value={createCompanyData.name}
                            onChange={(e) =>
                              handleCreateCompanyInputChange(
                                "name",
                                e.target.value
                              )
                            }
                            placeholder="Ingresa el nombre de la empresa"
                            className={
                              createCompanyErrors.name ? "border-red-500" : ""
                            }
                          />
                          {createCompanyErrors.name && (
                            <p className="text-sm text-red-500">
                              {createCompanyErrors.name}
                            </p>
                          )}
                        </div>

                        {/* Tax ID Type */}
                        <div className="space-y-2">
                          <Label htmlFor="create-tax-id-type">
                            Tipo de Identificación Fiscal *
                          </Label>
                          <Select
                            value={createCompanyData.taxIdType}
                            onValueChange={(value) =>
                              handleCreateCompanyInputChange("taxIdType", value)
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecciona el tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="rut">RUT (Chile)</SelectItem>
                              <SelectItem value="vat">VAT (Europa)</SelectItem>
                              <SelectItem value="ein">
                                EIN (Estados Unidos)
                              </SelectItem>
                              <SelectItem value="cnpj">
                                CNPJ (Brasil)
                              </SelectItem>
                              <SelectItem value="tax_id">
                                Tax ID (Genérico)
                              </SelectItem>
                              <SelectItem value="other">Otro</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* Tax ID */}
                        <div className="space-y-2">
                          <Label htmlFor="create-tax-id">
                            Número de Identificación Fiscal *
                          </Label>
                          <Input
                            id="create-tax-id"
                            value={createCompanyData.taxId}
                            onChange={(e) =>
                              handleCreateCompanyInputChange(
                                "taxId",
                                e.target.value
                              )
                            }
                            placeholder={
                              createCompanyData.taxIdType === "rut"
                                ? "12.345.678-9"
                                : createCompanyData.taxIdType === "vat"
                                ? "ES12345678Z"
                                : createCompanyData.taxIdType === "ein"
                                ? "12-3456789"
                                : createCompanyData.taxIdType === "cnpj"
                                ? "12.345.678/0001-90"
                                : "Ingresa el número de identificación"
                            }
                            className={
                              createCompanyErrors.taxId ? "border-red-500" : ""
                            }
                          />
                          {createCompanyErrors.taxId && (
                            <p className="text-sm text-red-500">
                              {createCompanyErrors.taxId}
                            </p>
                          )}
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                          <Label htmlFor="create-description">
                            Descripción
                          </Label>
                          <Textarea
                            id="create-description"
                            value={createCompanyData.description}
                            onChange={(e) =>
                              handleCreateCompanyInputChange(
                                "description",
                                e.target.value
                              )
                            }
                            placeholder="Describe brevemente tu empresa"
                            rows={3}
                            className={
                              createCompanyErrors.description
                                ? "border-red-500"
                                : ""
                            }
                          />
                          <div className="flex justify-between items-center">
                            {createCompanyErrors.description && (
                              <p className="text-sm text-red-500">
                                {createCompanyErrors.description}
                              </p>
                            )}
                            <p
                              className={`text-xs ml-auto ${
                                (createCompanyData.description?.length || 0) >
                                450
                                  ? "text-red-500"
                                  : "text-gray-500"
                              }`}
                            >
                              {createCompanyData.description?.length || 0}/500
                            </p>
                          </div>
                        </div>
                      </div>

                      <DialogFooter>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleCreateCompanyCancel}
                          disabled={isCreatingCompany}
                        >
                          Cancelar
                        </Button>
                        <Button
                          type="button"
                          onClick={handleCreateCompany}
                          disabled={isCreatingCompany}
                        >
                          {isCreatingCompany ? (
                            <>
                              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              Creando...
                            </>
                          ) : (
                            <>
                              <Plus className="w-4 h-4 mr-2" />
                              Crear Empresa
                            </>
                          )}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            ) : (
              "No se pudo cargar el perfil de la empresa. Por favor, intenta nuevamente."
            )}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Perfil de la Empresa</h1>
        </div>
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2"
            disabled={loading}
          >
            <Edit className="w-4 h-4" />
            Editar
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              className="flex items-center gap-2"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              Guardar
            </Button>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex items-center gap-2"
              disabled={loading}
            >
              <X className="w-4 h-4" />
              Cancelar
            </Button>
          </div>
        )}
      </div>

      {/* Success Message */}
      {successMessage && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {/* Error Message */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información básica */}
        <Card>
          <CardHeader>
            <CardTitle>Información Básica</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre de la Empresa</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                disabled={!isEditing || loading}
                placeholder="Ingresa el nombre de la empresa"
                className={validationErrors.name ? "border-red-500" : ""}
              />
              {validationErrors.name && (
                <p className="text-sm text-red-500">{validationErrors.name}</p>
              )}
            </div>

            {/* Tax ID Type */}
            <div className="space-y-2">
              <Label htmlFor="tax-id-type">Tipo de Identificación Fiscal</Label>
              <Select
                value={formData.taxIdType}
                onValueChange={(value) => handleInputChange("taxIdType", value)}
                disabled={!isEditing || loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rut">RUT (Chile)</SelectItem>
                  <SelectItem value="vat">VAT (Europa)</SelectItem>
                  <SelectItem value="ein">EIN (Estados Unidos)</SelectItem>
                  <SelectItem value="cnpj">CNPJ (Brasil)</SelectItem>
                  <SelectItem value="tax_id">Tax ID (Genérico)</SelectItem>
                  <SelectItem value="other">Otro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tax ID */}
            <div className="space-y-2">
              <Label htmlFor="rut">Número de Identificación Fiscal</Label>
              <Input
                id="rut"
                value={formData.rut}
                onChange={(e) => handleInputChange("rut", e.target.value)}
                disabled={!isEditing || loading}
                placeholder={
                  formData.taxIdType === "rut"
                    ? "12.345.678-9"
                    : formData.taxIdType === "vat"
                    ? "ES12345678Z"
                    : formData.taxIdType === "ein"
                    ? "12-3456789"
                    : formData.taxIdType === "cnpj"
                    ? "12.345.678/0001-90"
                    : "Número de identificación fiscal"
                }
                className={validationErrors.rut ? "border-red-500" : ""}
              />
              {validationErrors.rut && (
                <p className="text-sm text-red-500">{validationErrors.rut}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                disabled={!isEditing || loading}
                rows={3}
                placeholder="Describe brevemente tu empresa"
                className={validationErrors.description ? "border-red-500" : ""}
              />
              <div className="flex justify-between items-center">
                {validationErrors.description && (
                  <p className="text-sm text-red-500">
                    {validationErrors.description}
                  </p>
                )}
                <p
                  className={`text-xs ml-auto ${
                    (formData.description?.length || 0) > 450
                      ? "text-red-500"
                      : "text-gray-500"
                  }`}
                >
                  {formData.description?.length || 0}/500
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Sitio Web</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleInputChange("website", e.target.value)}
                disabled={!isEditing || loading}
                placeholder="https://www.ejemplo.com"
                className={validationErrors.website ? "border-red-500" : ""}
              />
              {validationErrors.website && (
                <p className="text-sm text-red-500">
                  {validationErrors.website}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Información adicional */}
        <Card>
          <CardHeader>
            <CardTitle>Información Adicional</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="industry">Industria</Label>
              <Select
                value={formData.industry}
                onValueChange={(value) => handleInputChange("industry", value)}
                disabled={!isEditing || loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una industria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tecnología">Tecnología</SelectItem>
                  <SelectItem value="Finanzas">Finanzas</SelectItem>
                  <SelectItem value="Salud">Salud</SelectItem>
                  <SelectItem value="Educación">Educación</SelectItem>
                  <SelectItem value="Retail">Retail</SelectItem>
                  <SelectItem value="Manufactura">Manufactura</SelectItem>
                  <SelectItem value="Construcción">Construcción</SelectItem>
                  <SelectItem value="Servicios">Servicios</SelectItem>
                  <SelectItem value="Otros">Otros</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="size">Tamaño de la Empresa</Label>
              <Select
                value={formData.size}
                onValueChange={(value) => handleInputChange("size", value)}
                disabled={!isEditing || loading}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona el tamaño" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">
                    Pequeña (1-50 empleados)
                  </SelectItem>
                  <SelectItem value="medium">
                    Mediana (51-200 empleados)
                  </SelectItem>
                  <SelectItem value="large">Grande (200+ empleados)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Información de suscripción */}
      <Card>
        <CardHeader>
          <CardTitle>Información de Suscripción</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-sm font-medium">Plan Actual</Label>
              <p className="text-lg font-semibold text-primary capitalize">
                {companyProfile?.subscriptionPlan || "Free"}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">
                Fecha de Vencimiento
              </Label>
              <p className="text-lg font-semibold">
                {companyProfile?.subscriptionExpiresAt
                  ? new Date(
                      companyProfile.subscriptionExpiresAt
                    ).toLocaleDateString("es-CL", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })
                  : "Sin vencimiento"}
              </p>
            </div>
            <div>
              <Label className="text-sm font-medium">Estado</Label>
              <p
                className={`text-lg font-semibold ${
                  companyProfile?.isActive ? "text-green-600" : "text-red-600"
                }`}
              >
                {companyProfile?.isActive ? "Activo" : "Inactivo"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanyProfile;
