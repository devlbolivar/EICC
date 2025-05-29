"use client";
import React, { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import CourseCard from "../_components/CourseCard";
import { Skeleton } from "@/components/ui/skeleton";
interface Course {
  id: number;
  name: string;
  description: string;
}

const Explore = () => {
  const [courseList, setCourseList] = useState<Course[]>([]);
  const { user } = useUser();

  const getCourseList = async () => {
    const response = await axios.get("/api/courses?courseId=0");
    setCourseList(response.data);
  };

  useEffect(() => {
    user && getCourseList();
  }, [user]);

  console.log(courseList);
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
        {courseList.length > 0
          ? courseList.map((course, index) => (
              <CourseCard key={index} course={course} />
            ))
          : [0, 1, 2, 3, 4, 5].map((item, index) => (
              <Skeleton key={index} className="w-full h-[240px] rounded-md" />
            ))}
      </div>
    </div>
  );
};

export default Explore;
