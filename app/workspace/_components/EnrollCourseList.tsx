"use client";
import { useUser } from "@clerk/nextjs";
import React, { useState, useEffect } from "react";
import axios from "axios";
import EnrollCourseCard from "./EnrollCourseCard";
const EnrollCourseList = () => {
  const { user } = useUser();
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);

  const getEnrolledCourses = async () => {
    const result = await axios.get("/api/enroll-course", {
      params: {
        userEmail: user?.primaryEmailAddress?.emailAddress,
      },
    });

    console.log(result);

    if (result.status === 200) {
      setEnrolledCourses(result.data);
    }
  };

  useEffect(() => {
    getEnrolledCourses();
  }, []);

  console.log(enrolledCourses);

  return (
    <div>
      {enrolledCourses?.length > 0 ? (
        <div className="mt-3">
          <h2 className="text-2xl font-bold">Continua tu aprendizaje</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-5 mt-4">
            {enrolledCourses.map((course, index) => (
              <EnrollCourseCard
                key={index}
                course={course.courses}
                enrollCourse={course.enrollCourse}
              />
            ))}
          </div>
        </div>
      ) : (
        <h2 className="text-2xl font-bold">No tienes cursos inscritos</h2>
      )}
    </div>
  );
};

export default EnrollCourseList;
