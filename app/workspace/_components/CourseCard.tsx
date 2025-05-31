import React, { useState } from "react";
import Image from "next/image";
import { Book, PlayCircle, Settings, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import axios from "axios";
import { toast } from "sonner";
import { Course } from "@/app/types";

const CourseCard = ({ course }: { course: Course }) => {
  const [isLoading, setIsLoading] = useState(false);
  const courseJson = course.courseJson.course;

  const onEnrollCourse = async () => {
    try {
      setIsLoading(true);
      const result = await axios.post("/api/enroll-course", {
        courseId: course.cid,
      });

      if (result.status === 200 && result.data.message) {
        toast.success(result.data.message);
      } else if (result.status === 200) {
        toast.error("Curso inscrito correctamente");
      }
      setIsLoading(false);
    } catch (error) {
      console.log(error);
      toast.error("Error al inscribirse en el curso");
      setIsLoading(false);
    }
  };

  return (
    <div className="shadow-md rounded-2xl">
      <Image
        src={course.bannerImage}
        alt={course.name}
        width={400}
        height={300}
        className="w-full aspect-video rounded-t-xl object-cover"
      />
      <div className="p-3 flex flex-col gap-3">
        <h2 className="text-lg font-bold">{courseJson.name}</h2>
        <p className="line-clamp-3 text-gray-500 text-sm">
          {courseJson.description}
        </p>
        <div className="flex justify-between items-center ">
          <h2 className="flex items-center gap-2 text-sm">
            <Book className="text-primary h-5 w-5" />{" "}
            {courseJson.numberOfChapters} Capítulos
          </h2>
          {course?.courseContent?.length > 0 ? (
            <Button size="sm" onClick={onEnrollCourse} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="animate-spin" />
              ) : (
                <PlayCircle />
              )}
              {isLoading ? "Inscribiendote..." : "Inscribirse"}
            </Button>
          ) : (
            // TODO: Change name to "Acceder al curso" if the user is enrolled
            <Link href={`/workspace/edit-course/${course.cid}`}>
              <Button size="sm" variant="outline">
                <Settings />
                Generar contenido
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
