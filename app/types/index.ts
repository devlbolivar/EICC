export interface Course {
  id: number;
  cid: string;
  name: string;
  description: string;
  numberOfChapters: number;
  includeVideos: boolean;
  difficulty: string;
  category: string;
  courseJson: CourseJson;
  bannerImage: string;
  courseContent: CourseContent[];
  userEmail: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EnrollCourse {
  id: number;
  cid: string;
  userEmail: string;
  completedChapters: Record<string, number>;
  createdAt: Date;
  updatedAt: Date;
}

export interface EnrolledCourses {
  courses: Course;
  enrollCourse: EnrollCourse;
}

export interface CourseJson {
  course: {
    name: string;
    category: string;
    chapters: Chapter[];
    difficulty: string;
    description: string;
    includeVideos: boolean;
    numberOfChapters: number;
    bannerImagePrompt: string;
  };
}

export interface Chapter {
  topic: string[];
  duration: string;
  chapterName: string;
  imagePrompt: string;
}

export interface CourseContent {
  chapterName: string;
  topics: Topic[];
  youtubeVideo?: YoutubeVideo[];
}

export interface Topic {
  topic: string;
  content: string;
}

export interface YoutubeVideo {
  videoId: string;
  title: string;
  thumbnail: string;
}
