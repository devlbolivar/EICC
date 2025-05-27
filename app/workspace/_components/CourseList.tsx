"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AddNewCourseDialog from "./AddNewCourseDialog";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import CourseCard from "./CourseCard";
interface Course {
  id: number;
  name: string;
  description: string;
}

const CourseList = () => {
  const [courseList, setCourseList] = useState<Course[]>([]);
  const { user } = useUser();

  const getCourseList = async () => {
    const response = await axios.get("/api/courses");
    setCourseList(response.data);
  };

  useEffect(() => {
    user && getCourseList();
  }, [user]);

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold">Cursos disponibles</h2>
      {courseList.length === 0 ? (
        <div className="flex items-center justify-center h-full p-7 flex-col border  rounded-xl shadow-xs mt-2 bg-secondary/50">
          <Image
            src="/online-education.png"
            alt="Educación en línea"
            width={100}
            height={100}
            className="rounded-lg"
          />
          <h2 className="text-muted-foreground my-2 text-xl font-bold">
            Parece que no has creado ningún curso aún
          </h2>
          <AddNewCourseDialog>
            <Button>
              <Plus />
              Crea tu primer curso
            </Button>
          </AddNewCourseDialog>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5 mt-4">
          {courseList.map((course, index) => (
            <CourseCard key={index} course={course} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseList;
