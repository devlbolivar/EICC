"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Search } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import CourseCard from "../_components/CourseCard";
import { Course } from "@/app/types";

const Explore = () => {
  const [courseList, setCourseList] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useUser();

  const getCourseList = async () => {
    try {
      const response = await axios.get("/api/courses?courseId=0");
      setCourseList(response.data);
    } catch (error) {
      console.error("Error fetching course list:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getCourseList();
  }, [user]);

  return (
    <div>
      <h2 className="text-3xl font-bold mb-7 mt-5">Explorar mas cursos</h2>
      <div className="flex gap-5 max-w-md">
        <Input placeholder="Buscar" />
        <Button>
          <Search />
          Buscar
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5 mt-4">
        {courseList.length > 0 ? (
          courseList.map((course, index) => (
            <CourseCard key={index} course={course} />
          ))
        ) : isLoading ? (
          Array.from({ length: 3 }).map((_, index) => (
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
          ))
        ) : (
          <h2 className="text-2xl font-bold">No hay cursos disponibles</h2>
        )}
      </div>
    </div>
  );
};

export default Explore;
