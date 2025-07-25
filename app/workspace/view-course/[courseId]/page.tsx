import React from "react";
import EditCourseComponent from "../../edit-course/[courseId]/EditCourseComponent";

const ViewCourse = () => {
  return (
    <div>
      <EditCourseComponent viewCourse={true} />
    </div>
  );
};

export default ViewCourse;
