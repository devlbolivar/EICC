"use client";
import React, { useEffect, useState } from "react";

import { useParams } from "next/navigation";
import axios from "axios";
import CourseInfo from "../_components/CourseInfo";
import ChapterTopicList from "../_components/ChapterTopicList";

const EditCourse = () => {
  const { courseId } = useParams();
  const [isLoading, setIsLoading] = useState(false);
  const [courseInfo, setCourseInfo] = useState<any>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      setIsLoading(true);
      const data = await getCourseInfo();
      setCourseInfo(data);
      setIsLoading(false);
    };
    fetchCourse();
  }, [courseId]);

  const getCourseInfo = async () => {
    setIsLoading(true);
    const res = await axios.get(`/api/courses?courseId=${courseId}`);
    const data = res.data;
    setIsLoading(false);
    return data;
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <CourseInfo course={courseInfo} />
      <ChapterTopicList course={courseInfo} />
    </div>
  );
};

export default EditCourse;
