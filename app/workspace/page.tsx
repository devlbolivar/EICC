import React from "react";
import WorkspaceProvider from "./provider";
import WelcomeBanner from "./_components/WelcomeBanner";
import CourseList from "./_components/CourseList";
import EnrollCourseList from "./_components/EnrollCourseList";
const Workspace = () => {
  return (
    <div className="flex flex-col gap-5">
      <WelcomeBanner />
      <EnrollCourseList />
      <CourseList />
    </div>
  );
};

export default Workspace;
