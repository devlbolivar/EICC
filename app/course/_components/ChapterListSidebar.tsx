import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useSelectedChapterIndexContext } from "@/context/SelectedChapterIndexContext";
import { EnrolledCourses, CourseContent, Topic } from "@/app/types";

const ChapterListSidebar = ({ courseInfo }: { courseInfo: unknown }) => {
  const courseContent = (
    courseInfo as unknown as { courses: { courseContent: unknown[] } }
  )?.courses?.courseContent;
  const { setSelectedChapterIndex } = useSelectedChapterIndexContext();

  const completedChapter =
    (courseInfo as unknown as { enrollCourse: { completedChapters: number[] } })
      ?.enrollCourse?.completedChapters ?? [];

  return (
    <div className="w-80 bg-secondary h-screen p-5">
      <h2 className=" my-3 text-xl font-bold">
        Capítulos ({courseContent?.length})
      </h2>
      <Accordion type="single" collapsible>
        {courseContent?.map((chapter: unknown, index: number) => (
          <AccordionItem
            value={(chapter as { chapterName: string }).chapterName}
            key={index}
            onClick={() => setSelectedChapterIndex(index)}
          >
            <AccordionTrigger
              className={`text-lg font-medium px-5 ${
                completedChapter[index] ? "bg-green-100 text-green-900" : ""
              }`}
            >
              <span className="text-primary">{index + 1}</span>
              {(chapter as { chapterName: string }).chapterName}
            </AccordionTrigger>
            <AccordionContent asChild>
              <div>
                {(chapter as { topics: unknown[] }).topics.map(
                  (topic: unknown, index_: number) => (
                    <h2
                      key={index_}
                      className={`p-3 my-1 rounded-lg ${
                        completedChapter.includes(index)
                          ? "bg-green-100 text-green-900"
                          : "bg-white"
                      }`}
                    >
                      {(topic as { topic: string }).topic}
                    </h2>
                  )
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default ChapterListSidebar;
