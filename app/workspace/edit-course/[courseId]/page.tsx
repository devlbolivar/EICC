"use client";
import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import axios from "axios";
import CourseInfo from "../_components/CourseInfo";
import ChapterTopicList from "../_components/ChapterTopicList";
import { Course } from "@/app/types";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
const EditCourse = ({ viewCourse = false }: { viewCourse?: boolean }) => {
  const { courseId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [courseInfo, setCourseInfo] = useState<Course | null>(null);

  const getCourseInfo = useCallback(async () => {
    setIsLoading(true);
    const res = await axios.get(`/api/courses?courseId=${courseId}`);
    const data = res.data;
    setIsLoading(false);
    return data;
  }, [courseId]);

  useEffect(() => {
    const fetchCourse = async () => {
      setIsLoading(true);
      const data = await getCourseInfo();
      setCourseInfo(data);
      setIsLoading(false);
    };
    fetchCourse();
  }, [courseId, getCourseInfo]);

  return (
    <div>
      {isLoading ? (
        <Skeleton className="w-full h-full" />
      ) : (
        <>
          {courseInfo ? (
            <>
              <CourseInfo course={courseInfo} viewCourse={viewCourse} />
              <ChapterTopicList course={courseInfo} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <h1 className="text-2xl font-bold">No se encontró el curso</h1>
              <Button>Crear un nuevo curso</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EditCourse;
