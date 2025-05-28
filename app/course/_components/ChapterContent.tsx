import React from "react";
import { useSelectedChapterIndexContext } from "@/context/SelectedChapterIndexContext";
import Youtube from "react-youtube";

const ChapterContent = ({ courseInfo }: { courseInfo: any }) => {
  const { courses, enrollCourse } = courseInfo;
  const courseContent = courseInfo.courses?.courseContent;
  const { selectedChapterIndex, setSelectedChapterIndex } =
    useSelectedChapterIndexContext();

  const videosData = courseContent?.[selectedChapterIndex]?.youtubeVideo;
  const topics = courseContent?.[selectedChapterIndex]?.topics;
  return (
    <div className="p-10">
      <h2 className="text-2xl font-bold">
        {selectedChapterIndex + 1}.{" "}
        {courseContent?.[selectedChapterIndex]?.chapterName}
      </h2>
      <h2 className="my-2 font-bold text-lg flex items-center gap-2">
        Videos Relacionados
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-video"
        >
          <path d="m22 8-6 4 6 4V8Z" />
          <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
        </svg>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {videosData.map(
          (video: any, index: number) =>
            index < 2 && (
              <div key={index}>
                <Youtube
                  videoId={video.videoId}
                  opts={{ height: "250", width: "400" }}
                />
              </div>
            )
        )}
      </div>
      <div className="mt-7">
        {topics.map((topic: any, index: number) => (
          <div key={index} className="mt-10 p-5 bg-secondary rounded-2xl">
            <h2 className="text-lg font-bold">{topic.topic}</h2>
            <div
              dangerouslySetInnerHTML={{
                __html: topic.content,
              }}
              className="line-height-2"
            ></div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ChapterContent;
