# 🐛 Certificate Generation Troubleshooting Guide

## Quick Diagnosis

If certificate generation is not working, follow these steps to identify the issue:

### 1. **Check Course Completion Status**

First, verify that the course is actually being marked as completed:

```javascript
// In browser console, check:
console.log("Course completion status:", completionPercentage);
console.log("Is completed:", isCompleted);
console.log("Enrollment data:", enrollment);
```

**Expected**: `completionPercentage` should be `100` and `isCompleted` should be `true`.

### 2. **Check API Response**

Verify that the progress update API is working correctly:

```javascript
// In browser console, check the network tab:
// Look for PUT request to /api/courses/[id]/enroll
// Check the response for certificateGenerated: true
```

**Expected**: Response should include `{ success: true, certificateGenerated: true }`.

### 3. **Check Database**

Verify that certificates are being created in the database:

```sql
-- Check if certificates exist
SELECT * FROM certificates WHERE "user_id" = 'your-user-id';

-- Check course completion status
SELECT * FROM "enrollCourse" WHERE "user_id" = 'your-user-id' AND "isCompleted" = true;
```

### 4. **Check Console Errors**

Look for any JavaScript errors in the browser console that might be preventing certificate generation.

## Common Issues and Solutions

### Issue 1: Certificate Not Generated

**Symptoms**: Course completes but no certificate is created.

**Possible Causes**:

- Course not actually marked as completed
- API error during certificate generation
- Database connection issues
- Duplicate certificate prevention triggered

**Solutions**:

1. Check if `isCompleted` is actually `true` in the database
2. Check API logs for errors
3. Verify database connection
4. Check if certificate already exists

### Issue 2: "View Certificate" Button Not Working

**Symptoms**: Button appears but doesn't navigate to certificate page.

**Possible Causes**:

- Router not imported
- Incorrect route path
- Certificate page not found

**Solutions**:

1. Verify `useRouter` is imported
2. Check route path: `/workspace/student/certificates/${courseId}`
3. Ensure certificate page exists

### Issue 3: Certificate Page Shows "Not Found"

**Symptoms**: Certificate page loads but shows "Certificado no encontrado".

**Possible Causes**:

- Certificate not in database
- Wrong user ID or course ID
- API endpoint issues

**Solutions**:

1. Check if certificate exists in database
2. Verify user authentication
3. Check API endpoint response

### Issue 4: Certificate Generation Fails Silently

**Symptoms**: No error messages but certificate not created.

**Possible Causes**:

- Silent API errors
- Database constraint violations
- Missing required fields

**Solutions**:

1. Add more logging to API endpoints
2. Check database constraints
3. Verify all required fields are present

## Debug Steps

### Step 1: Enable Debug Logging

Add this to your course completion handler:

```javascript
console.log("🔍 Debug: Course completion started");
console.log("Progress:", newProgress);
console.log("Is completed:", isCompleted);
console.log("Update result:", result);
```

### Step 2: Check API Endpoint

Test the certificate generation API directly:

```bash
# Test course completion
curl -X PUT http://localhost:3000/api/courses/[course-id]/enroll \
  -H "Content-Type: application/json" \
  -H "Cookie: accessToken=your-token" \
  -d '{"progress": 100, "isCompleted": true}'
```

### Step 3: Check Database

```sql
-- Check if certificate was created
SELECT
  c.certificateId,
  c.title,
  c.grade,
  c."completedDate",
  u.name as user_name,
  co.name as course_name
FROM certificates c
JOIN users u ON c."user_id" = u.id
JOIN courses co ON c."course_id" = co.id
WHERE c."user_id" = 'your-user-id';
```

### Step 4: Test Certificate Viewing

```bash
# Test certificate retrieval
curl http://localhost:3000/api/certificates?userId=your-user-id&courseId=your-course-id
```

## Manual Testing Checklist

- [ ] Course can be completed (reaches 100% progress)
- [ ] Success notification appears when course is completed
- [ ] Certificate generation notification appears
- [ ] "View Certificate" button appears on completed courses
- [ ] Certificate page loads without errors
- [ ] Certificate details are displayed correctly
- [ ] Certificate exists in database

## API Testing

### Test Course Completion

```javascript
// In browser console
const testCompletion = async () => {
  const response = await fetch("/api/courses/[course-id]/enroll", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      progress: 100,
      isCompleted: true,
      completedChapters: { 0: true, 1: true, 2: true },
    }),
  });

  const result = await response.json();
  console.log("Completion result:", result);
};
```

### Test Certificate Retrieval

```javascript
// In browser console
const testCertificate = async () => {
  const response = await fetch(
    "/api/certificates?courseId=[course-id]&userId=[user-id]"
  );
  const result = await response.json();
  console.log("Certificate result:", result);
};
```

## Database Queries

### Check Course Completion

```sql
SELECT
  ec.*,
  c.name as course_name,
  c."numberOfChapters"
FROM "enrollCourse" ec
JOIN courses c ON ec."course_id" = c.id
WHERE ec."user_id" = 'your-user-id';
```

### Check Certificates

```sql
SELECT
  cert.*,
  c.name as course_name,
  u.name as user_name
FROM certificates cert
JOIN courses c ON cert."course_id" = c.id
JOIN users u ON cert."user_id" = u.id
WHERE cert."user_id" = 'your-user-id';
```

### Check for Duplicates

```sql
SELECT
  "course_id",
  "user_id",
  COUNT(*) as count
FROM certificates
WHERE "isActive" = true
GROUP BY "course_id", "user_id"
HAVING COUNT(*) > 1;
```

## Still Not Working?

If the issue persists:

1. **Check the browser console** for any JavaScript errors
2. **Check the server logs** for API errors
3. **Verify database connection** and table structure
4. **Test with a fresh course** to rule out data issues
5. **Check user permissions** and authentication status

## Contact Support

If you're still having issues, provide:

- Browser console errors
- Server logs
- Database query results
- Steps to reproduce the issue
- Expected vs actual behavior
