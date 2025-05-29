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

    if (result.status === 200) {
      setCourseInfo(result.data);
    }
  };

  useEffect(() => {
    getEnrolledCourseById();
  }, []);

  return (
    <div className="flex h-screen">
      <div className="fixed">
        <ChapterListSidebar courseInfo={courseInfo} />
      </div>
      <div className="flex-1 ml-80">
        <AppHeader hideSidebar={true} />
        <div className="flex gap-10 overflow-y-auto h-[calc(100vh-64px)]">
          <ChapterContent
            courseInfo={courseInfo}
            refreshData={() => getEnrolledCourseById()}
          />
        </div>
      </div>
    </div>
  );
};

export default Course;
