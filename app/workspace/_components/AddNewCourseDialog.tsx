import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Sparkle } from "lucide-react";

const AddNewCourseDialog = ({ children }: { children: React.ReactNode }) => {
  const [formData, setFormData] = useState<{
    name: string;
    description: string;
    chapters: number;
    difficulty: string;
    category: string;
    includeVideos: boolean;
  }>({
    name: "",
    description: "",
    chapters: 0,
    difficulty: "",
    category: "",
    includeVideos: false,
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (value: string) => {
    setFormData({ ...formData, difficulty: value });
  };

  const handleSwitchChange = (checked: boolean) => {
    setFormData({ ...formData, includeVideos: checked });
  };

  const handleSubmit = () => {
    console.log(formData);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Crear un nuevo curso</DialogTitle>
          <DialogDescription asChild>
            <div className="flex flex-col gap-3 mt-3">
              <div className="flex flex-col gap-1">
                <label htmlFor="name">Nombre del curso</label>
                <Input
                  type="text"
                  placeholder="Nombre del curso"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="description">Descripción del curso</label>
                <Textarea
                  id="description"
                  placeholder="Descripción del curso"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
              <div className="flex flex-col gap-1">
                <label htmlFor="chapters">N° de Capítulos</label>
                <Input
                  type="number"
                  placeholder="N° de Capítulos"
                  name="chapters"
                  value={formData.chapters}
                  onChange={handleChange}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="include-videos"
                  checked={formData.includeVideos}
                  onCheckedChange={handleSwitchChange}
                />
                <label htmlFor="include-videos">Incluir videos</label>
              </div>
              <div className="flex  gap-2 flex-col">
                <label htmlFor="difficulty" className="">
                  Nivel de dificultad
                </label>
                <Select
                  name="difficulty"
                  value={formData.difficulty}
                  onValueChange={handleSelectChange}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Nivel de dificultad" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="principiante">Principiante</SelectItem>
                    <SelectItem value="intermedio">Intermedio</SelectItem>
                    <SelectItem value="avanzado">Avanzado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 flex-col">
                <label htmlFor="category">Categoría</label>
                <Input
                  type="text"
                  placeholder="Categoría separada por comas"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                />
              </div>
              <div className="flex gap-2 flex-col mt-5">
                <Button onClick={handleSubmit}>
                  <Sparkle className="w-full h-4 mr-2" /> Crear curso
                </Button>
              </div>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
};

export default AddNewCourseDialog;
