import React from "react";
import Image from "next/image";
import { Book, PlayCircle, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
const CourseCard = ({ course }: { course: any }) => {
  console.log(course);
  const courseJson = course.courseJson.course;
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
        <div className="flex justify-between items-center ">
          <h2 className="flex items-center gap-2 text-sm">
            <Book className="text-primary h-5 w-5" />{" "}
            {courseJson.numberOfChapters} Capítulos
          </h2>
          {course?.courseContent?.length > 0 ? (
            <Button size="sm">
              <PlayCircle /> Inciar
            </Button>
          ) : (
            <Link href={`/workspace/edit-course/${course.cid}`}>
              <Button size="sm" variant="outline">
                <Settings />
                Generar contenido
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
