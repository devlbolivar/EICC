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
  const enrrollCourse = courseInfo?.enrrollCourse;
  const courseContent = courseInfo?.courses?.courseContent;
  const { selectedChapterIndex, setSelectedChapterIndex } =
    useSelectedChapterIndexContext();

  return (
    <div className="w-[300px] bg-secondary h-screen p-5">
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
            <AccordionTrigger className="text-lg font-medium">
              {index + 1}. {chapter.chapterName}
            </AccordionTrigger>
            <AccordionContent asChild>
              <div className="">
                {chapter.topics.map((topic: any, index: number) => (
                  <h2 key={index} className="p-3 bg-white my-1 rounded-lg">
                    {" "}
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
