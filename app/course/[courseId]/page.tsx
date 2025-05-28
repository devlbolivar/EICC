"use client";
import AppHeader from "@/app/workspace/_components/AppHeader";
import ChapterListSidebar from "@/app/course/_components/ChapterListSidebar";
import ChapterContent from "@/app/course/_components/ChapterContent";
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { useParams } from "next/navigation";

const Course = () => {
  const { courseId } = useParams();
  const [courseInfo, setCourseInfo] = useState({});

  const getEnrolledCourseById = async () => {
    const result = await axios.get(`/api/enroll-course?courseId=${courseId}`);

    console.log(result.data);
    if (result.status === 200) {
      setCourseInfo(result.data);
    }
  };

  useEffect(() => {
    getEnrolledCourseById();
  }, []);

  return (
    <div>
      <AppHeader hideSidebar={true} />
      <div className="flex gap-10">
        <ChapterListSidebar courseInfo={courseInfo} />
        <ChapterContent courseInfo={courseInfo} />
      </div>
    </div>
  );
};

export default Course;
