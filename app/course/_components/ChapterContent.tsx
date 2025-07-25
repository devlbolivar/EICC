"use client";
import React, { useCallback, useMemo, useState } from "react";
import { useSelectedChapterIndexContext } from "@/context/SelectedChapterIndexContext";
import Youtube from "react-youtube";
import { Button } from "@/components/ui/button";
import { CheckCircle, X, Loader2 } from "lucide-react";
import axios from "axios";
import { useParams } from "next/navigation";
import { toast } from "sonner";

interface CourseContent {
  chapterName: string;
  youtubeVideo: { videoId: string }[];
  topics: { topic: string; content: string }[];
}

interface CourseInfo {
  courses: {
    courseContent: CourseContent[];
  };
  enrollCourse: {
    completedChapters: number[];
  };
}

const ChapterContent = ({
  courseInfo,
  refreshData,
}: {
  courseInfo: CourseInfo;
  refreshData: () => void;
}) => {
  const courseId = useParams();
  const { courses, enrollCourse } = courseInfo;
  const courseContent = courses?.courseContent;
  const { selectedChapterIndex } = useSelectedChapterIndexContext();
  const [isLoading, setIsLoading] = useState(false);

  const videosData = courseContent?.[selectedChapterIndex]?.youtubeVideo;
  const topics = courseContent?.[selectedChapterIndex]?.topics;
  const completedChapter = useMemo(
    () => enrollCourse?.completedChapters,
    [enrollCourse?.completedChapters]
  );

  const markChapterAsCompleted = useCallback(async () => {
    setIsLoading(true);
    try {
      const updatedCompletedChapters = Array.isArray(completedChapter)
        ? [...completedChapter, selectedChapterIndex]
        : [selectedChapterIndex];

      await axios.put("/api/enroll-course", {
        courseId: courseId.courseId,
        completedChapter: updatedCompletedChapters,
      });

      refreshData();
      toast.success("Capítulo marcado como completado");
    } catch (error) {
      console.error("Error marking chapter as completed:", error);
      toast.error("Error al marcar el capítulo como completado");
    } finally {
      setIsLoading(false);
    }
  }, [completedChapter, courseId, refreshData, selectedChapterIndex]);

  const markChapterAsIncomplete = useCallback(async () => {
    setIsLoading(true);
    try {
      const updatedCompletedChapters = Array.isArray(completedChapter)
        ? completedChapter.filter((index) => index !== selectedChapterIndex)
        : [];

      await axios.put("/api/enroll-course", {
        courseId: courseId.courseId,
        completedChapter: updatedCompletedChapters,
      });

      refreshData();
      toast.success("Capítulo marcado como incompleto");
    } catch (error) {
      console.error("Error marking chapter as incomplete:", error);
      toast.error("Error al marcar el capítulo como incompleto");
    } finally {
      setIsLoading(false);
    }
  }, [completedChapter, courseId, refreshData, selectedChapterIndex]);

  return (
    <div className="p-10">
      <div className="flex items-center justify-between ">
        <h2 className="text-2xl font-bold">
          {selectedChapterIndex + 1}.{" "}
          {courseContent?.[selectedChapterIndex]?.chapterName}
        </h2>
        {!Array.isArray(completedChapter) ||
        !completedChapter.includes(selectedChapterIndex) ? (
          <Button onClick={() => markChapterAsCompleted()} disabled={isLoading}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle className="w-4 h-4" />
            )}
            <span>Marcar como Completado</span>
          </Button>
        ) : (
          <Button
            variant="outline"
            onClick={() => markChapterAsIncomplete()}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <X className="w-4 h-4" />
            )}
            <span>Marcar como Incompleto</span>
          </Button>
        )}
      </div>

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
        {videosData?.map(
          (video: { videoId: string }, index: number) =>
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
        {topics?.map(
          (topic: { topic: string; content: string }, index_: number) => (
            <div key={index_} className="mt-10 p-5 bg-secondary rounded-2xl">
              <h2 className="text-2xl font-bold text-primary">
                {index_ + 1}. {topic.topic}
              </h2>

              <div
                dangerouslySetInnerHTML={{ __html: topic?.content }}
                style={{ lineHeight: "2" }}
              />
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default ChapterContent;
