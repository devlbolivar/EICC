import React from "react";
import WelcomeBanner from "./_components/WelcomeBanner";
import CourseList from "./_components/CourseList";
import EnrollCourseList from "./_components/EnrollCourseList";
const Workspace = () => {
  return (
    <div className="flex flex-col gap-5">
      <WelcomeBanner />
      <CourseList />
    </div>
  );
};

export default Workspace;
