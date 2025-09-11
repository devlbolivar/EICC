"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { PlayCircle, BookOpen, Clock, Award } from "lucide-react";

interface Course {
  id: string;
  title: string;
  description: string;
  progress: number;
  totalChapters: number;
  completedChapters: any;
  estimatedTime: string;
  lastAccessed: string;
  image: string;
}

export default function StudentCourses() {
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("/api/student/courses");
        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }
        const data = await response.json();
        setEnrolledCourses(data);
      } catch (error: any) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mis Cursos</h1>
        <p className="text-muted-foreground">
          Continúa tu aprendizaje desde donde lo dejaste
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {enrolledCourses.map((course) => (
          <Card key={course.id} className="overflow-hidden">
            <div className="aspect-video relative bg-gradient-to-br from-blue-500 to-purple-600">
              <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen className="h-12 w-12 text-white opacity-80" />
              </div>
            </div>
            <CardHeader>
              <CardTitle className="line-clamp-2">{course.title}</CardTitle>
              <CardDescription className="line-clamp-2">
                {course.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Progreso</span>
                  <span>{course.progress}%</span>
                </div>
                <Progress value={course.progress} className="h-2" />
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{course.estimatedTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {Object.keys(course.completedChapters).length}/
                    {course.totalChapters}
                  </span>
                </div>
              </div>

              <div className="text-xs text-muted-foreground">
                Último acceso: {new Date(course.lastAccessed).toLocaleDateString()}
              </div>

              <div className="flex gap-2">
                <Button className="flex-1" size="sm">
                  <PlayCircle className="h-4 w-4 mr-2" />
                  Continuar
                </Button>
                {course.progress === 100 && (
                  <Button variant="outline" size="sm">
                    <Award className="h-4 w-4 mr-2" />
                    Certificado
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
