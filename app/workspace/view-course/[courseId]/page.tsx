import React from "react";
import EditCourse from "../../edit-course/[courseId]/page";

const ViewCourse = () => {
  return (
    <div>
      <EditCourse viewCourse={true} />
    </div>
  );
};

export default ViewCourse;
