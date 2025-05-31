"use client";
import React, { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import AddNewCourseDialog from "./AddNewCourseDialog";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import CourseCard from "./CourseCard";
import { Course } from "@/app/types";
import { Skeleton } from "@/components/ui/skeleton";

const CourseList = () => {
  const { user } = useUser();
  const [courseList, setCourseList] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getCourseList = useCallback(async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const response = await axios.get("/api/courses");
      setCourseList(response.data);
    } catch (error) {
      console.error("Error fetching course list:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    getCourseList();
  }, [user, getCourseList]);

  return (
    <div className="mt-10">
      <h2 className="text-2xl font-bold">Cursos disponibles</h2>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5 mt-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="flex flex-col bg-white rounded-xl shadow-lg overflow-hidden"
            >
              <Skeleton className="h-48 w-full" />
              <div className="p-6 flex-grow">
                <Skeleton className="h-6 w-3/4 mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
              </div>
              <div className="p-6 border-t border-gray-200">
                <Skeleton className="h-4 w-24" />
              </div>
            </div>
          ))}
        </div>
      ) : courseList.length === 0 ? (
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
