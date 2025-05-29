import React from "react";
import WelcomeBanner from "../_components/WelcomeBanner";
import EnrollCourseList from "../_components/EnrollCourseList";

const MyLearning = () => {
  return (
    <div>
      <WelcomeBanner />
      <h2 className="text-3xl font-bold mb-7 mt-5">Mi aprendizaje</h2>
      <EnrollCourseList />
    </div>
  );
};

export default MyLearning;
