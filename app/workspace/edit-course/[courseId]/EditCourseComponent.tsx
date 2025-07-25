"use client";
import React, { useEffect, useState, useCallback } from "react";

import { useParams } from "next/navigation";
import axios from "axios";
import CourseInfo from "../_components/CourseInfo";
import ChapterTopicList from "../_components/ChapterTopicList";
import { Course } from "@/app/types";

interface EditCourseComponentProps {
  viewCourse?: boolean;
}

const EditCourseComponent = ({
  viewCourse = false,
}: EditCourseComponentProps) => {
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

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!courseInfo) {
    return <div>Error: Curso no encontrado</div>;
  }

  return (
    <div>
      <CourseInfo course={courseInfo} viewCourse={viewCourse} />
      <ChapterTopicList course={courseInfo} />
    </div>
  );
};

export default EditCourseComponent;
