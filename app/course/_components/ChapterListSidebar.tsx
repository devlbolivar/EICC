import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useSelectedChapterIndexContext } from "@/context/SelectedChapterIndexContext";

const ChapterListSidebar = ({ courseInfo }: { courseInfo: any }) => {
  const course = courseInfo?.courses;
  const enrollCourse = courseInfo?.enrollCourse;
  const courseContent = courseInfo?.courses?.courseContent;
  const { selectedChapterIndex, setSelectedChapterIndex } =
    useSelectedChapterIndexContext();

  const completedChapter = enrollCourse?.completedChapters ?? [];

  return (
    <div className="w-80 bg-secondary h-screen p-5">
      <h2 className=" my-3 text-xl font-bold">
        Capítulos ({courseContent?.length})
      </h2>
      <Accordion type="single" collapsible>
        {courseContent?.map((chapter: any, index: number) => (
          <AccordionItem
            value={chapter.chapterName}
            key={index}
            onClick={() => setSelectedChapterIndex(index)}
          >
            <AccordionTrigger
              className={`text-lg font-medium px-5 ${
                completedChapter.includes(index)
                  ? "bg-green-100 text-green-900"
                  : ""
              }`}
            >
              <span className="text-primary">{index + 1}</span>
              {chapter.chapterName}
            </AccordionTrigger>
            <AccordionContent asChild>
              <div>
                {chapter.topics.map((topic: any, index_: number) => (
                  <h2
                    key={index_}
                    className={`p-3 my-1 rounded-lg ${
                      completedChapter.includes(index)
                        ? "bg-green-100 text-green-900"
                        : "bg-white"
                    }`}
                  >
                    {topic.topic}
                  </h2>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default ChapterListSidebar;
