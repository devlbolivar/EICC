"use client";
import { Book, Clock, Gift, Settings, TrendingUp, Loader2 } from "lucide-react";
import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import axios from "axios";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
const CourseInfo = ({ course }: { course: any }) => {
  const [isLoading, setIsLoading] = useState(false);
  const courseLayout = course?.courseJson?.course;
  const router = useRouter();

  const generateCourseContent = async () => {
    try {
      setIsLoading(true);
      const response = await axios.post("/api/generate-course-content", {
        courseJson: courseLayout,
        courseTitle: course?.name,
        courseId: course?.cid,
      });

      router.replace(`/workspace`);
      toast.success("Contenido del curso generado correctamente");
    } catch (error) {
      console.error(error);
      setIsLoading(false);
      toast.error(
        "Error al generar el contenido del curso, por favor intente nuevamente"
      );
    }
  };

  return (
    <div className="flex gap-5 justify-around p-5 rounded-2xl shadow">
      <div className="flex flex-col gap-3">
        <h2 className="text-3xl font-bold">{courseLayout?.name}</h2>
        <p className="line-clamp-2 text-gray-500">
          {courseLayout?.description}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="flex gap-5 items-center p-3 rounded-lg shadow">
            <Clock className="text-blue-500" />
            <section>
              <h2 className="font-bold">Duración</h2>
              <h2>2 Horas</h2>
            </section>
          </div>
          <div className="flex gap-5 items-center p-3 rounded-lg shadow">
            <Book className="text-green-500" />
            <section>
              <h2 className="font-bold">Capítulos</h2>
              <h2>{courseLayout?.chapters?.length}</h2>
            </section>
          </div>
          <div className="flex gap-5 items-center p-3 rounded-lg shadow">
            <TrendingUp className="text-red-500" />
            <section>
              <h2 className="font-bold">Nivel de Dificultad</h2>
              <h2>{courseLayout?.difficulty}</h2>
            </section>
          </div>
        </div>
        <Button
          className="max-w-sm"
          onClick={generateCourseContent}
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Settings className="mr-2 h-4 w-4" />
          )}
          {isLoading ? "Generando..." : "Generar Contenido"}
        </Button>
      </div>
      <Image
        src={course?.bannerImage}
        alt={course?.name}
        width={400}
        height={400}
        className="rounded-2xl h-[240px] object-cover w-[400]  aspect-auto"
      />
    </div>
  );
};

export default CourseInfo;
