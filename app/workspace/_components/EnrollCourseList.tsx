"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import EnrollCourseCard from "./EnrollCourseCard";
import { EnrolledCourses } from "@/app/types";
import { Skeleton } from "@/components/ui/skeleton";

const EnrollCourseList = () => {
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourses[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const getEnrolledCourses = async () => {
    try {
      const result = await axios.get("/api/enroll-course");
      setEnrolledCourses(result.data);
    } catch (error) {
      console.error("Error fetching enrolled courses:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getEnrolledCourses();
  }, []);

  return (
    <div>
      <div className="mt-3">
        <h2 className="text-2xl font-bold">Continua tu aprendizaje</h2>
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
        ) : enrolledCourses.length === 0 ? (
          <div className="text-center text-gray-500">
            No tienes cursos inscritos.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5 mt-4">
            {enrolledCourses.map((course, index) => (
              <EnrollCourseCard
                key={index}
                course={course.courses}
                enrollCourse={course.enrollCourse}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnrollCourseList;
