"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function TestCertificatePage() {
  const [courseId, setCourseId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testCourseCompletion = async () => {
    if (!courseId) {
      toast.error("Please enter a course ID");
      return;
    }

    setLoading(true);
    setResult(null);

    try {
      // Test course completion
      const response = await fetch(`/api/courses/${courseId}/enroll`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          progress: 100,
          isCompleted: true,
          completedChapters: { 0: true, 1: true, 2: true, 3: true, 4: true },
        }),
      });

      const data = await response.json();
      setResult(data);

      if (data.success) {
        toast.success("Course completion test successful!");
        if (data.certificateGenerated) {
          toast.success("Certificate generated successfully!");
        } else {
          toast.warning("Certificate generation failed or already exists");
        }
      } else {
        toast.error("Course completion test failed");
      }
    } catch (error) {
      console.error("Test error:", error);
      toast.error("Test failed: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const testCertificateRetrieval = async () => {
    if (!courseId) {
      toast.error("Please enter a course ID");
      return;
    }

    setLoading(true);

    try {
      // Test certificate retrieval
      const response = await fetch(`/api/certificates?courseId=${courseId}`);
      const data = await response.json();

      if (data.success) {
        toast.success(`Found ${data.data.length} certificates`);
        setResult(data);
      } else {
        toast.error("Certificate retrieval failed");
        setResult(data);
      }
    } catch (error) {
      console.error("Test error:", error);
      toast.error("Test failed: " + (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>🧪 Certificate Generation Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="courseId">Course ID</Label>
            <Input
              id="courseId"
              value={courseId}
              onChange={(e) => setCourseId(e.target.value)}
              placeholder="Enter course ID to test"
            />
          </div>

          <div className="flex gap-2">
            <Button
              onClick={testCourseCompletion}
              disabled={loading}
              className="flex-1"
            >
              {loading ? "Testing..." : "Test Course Completion"}
            </Button>
            <Button
              onClick={testCertificateRetrieval}
              disabled={loading}
              variant="outline"
              className="flex-1"
            >
              {loading ? "Testing..." : "Test Certificate Retrieval"}
            </Button>
          </div>

          {result && (
            <div className="mt-4">
              <h3 className="font-semibold mb-2">Test Result:</h3>
              <pre className="bg-muted p-4 rounded-lg text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            <p>
              <strong>Instructions:</strong>
            </p>
            <ol className="list-decimal list-inside space-y-1 mt-2">
              <li>Enter a valid course ID</li>
              <li>
                Click "Test Course Completion" to simulate completing a course
              </li>
              <li>Check the result to see if certificate generation worked</li>
              <li>
                Click "Test Certificate Retrieval" to check if certificates
                exist
              </li>
            </ol>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
