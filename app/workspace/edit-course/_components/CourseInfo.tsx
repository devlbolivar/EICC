"use client";
import { Book, Clock, TrendingUp } from "lucide-react";
import React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";

const CourseInfo = ({ course }: { course: any }) => {
  const courseLayout = course?.courseJson?.course;
  console.log(course);

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
        <Button className="max-w-sm">Generar Contenido</Button>
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
