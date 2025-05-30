export interface Course {
  id: number;
  cid: string;
  name: string;
  description: string;
  numberOfChapters: number;
  includeVideos: boolean;
  difficulty: string;
  category: string;
  courseJson: any;
  bannerImage: string;
  courseContent: any;
  userEmail: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EnrollCourse {
  id: number;
  cid: string;
  userEmail: string;
  completedChapters: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface EnrolledCourses {
  courses: Course;
  enrollCourse: EnrollCourse;
}
