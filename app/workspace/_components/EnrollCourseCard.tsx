import React, { useState } from "react";
import Image from "next/image";
import { Book, Loader2, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Progress } from "@/components/ui/progress";
const EnrollCourseCard = ({
  course,
  enrollCourse,
}: {
  course: any;
  enrollCourse: any;
}) => {
  const courseJson = course.courseJson.course;

  const calculateProgress = () => {
    return Math.round(
      ((enrollCourse?.completedChapters?.length ?? 0) /
        course.courseContent.length) *
        100
    );
  };

  return (
    <div className="shadow-md rounded-2xl">
      <Image
        src={course.bannerImage}
        alt={course.name}
        width={400}
        height={300}
        className="w-full aspect-video rounded-t-xl object-cover"
      />
      <div className="p-3 flex flex-col gap-3">
        <h2 className="text-lg font-bold">{courseJson.name}</h2>
        <p className="line-clamp-3 text-gray-500 text-sm">
          {courseJson.description}
        </p>
        <div>
          <h2 className="flex justify-between items-center text-primary">
            Progreso <span>{calculateProgress()}%</span>
          </h2>
          <Progress value={calculateProgress()} />
          <Link href={`/workspace/view-course/${course.cid}`}>
            <Button className={"w-full mt-3"}>
              <PlayCircle />
              Continuar
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EnrollCourseCard;
