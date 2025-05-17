"use client";
import React, { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface Course {
  id: number;
  name: string;
  description: string;
}

const CourseList = () => {
  const [courseList, setCourseList] = useState<Course[]>([]);
  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold">Lista de Cursos</h2>
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
          <Button>Crea tu primer curso</Button>
        </div>
      ) : (
        <div>
          {courseList.map((course) => (
            <div key={course.id}>
              <h3>{course.name}</h3>
              <p>{course.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseList;
