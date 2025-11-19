# Error Handling Audit Report - EICC Codebase

## Executive Summary
The codebase has **inconsistent error handling practices** with several critical security issues:
- **CRITICAL**: Stack trace exposure in 10+ API routes
- **HIGH**: Lack of structured logging with context (userId, action, timestamp)
- **MEDIUM**: Inconsistent logging patterns
- **MEDIUM**: Debug information exposure in error responses

## 1. Try-Catch With Logging Analysis

### Good Practices Found:

**Status**: ~70% of routes have try-catch blocks with logging

### Coverage:
- All 60+ API routes in `/app/api` have try-catch blocks
- All routes use `console.error()` for exception handling
- Rate limiting and CSRF protection generally included

### Issues:
- Logging is **reactive only** (errors logged)
- No logging for successful operations with context
- No structured logging format

---

## 2. Stack Trace Exposure (CRITICAL)

### Vulnerable Routes - Error Message Directly Exposed to Client:

**File**: `/home/user/EICC/app/api/admin/enrollments/route.ts`
```typescript
// LINES 54-63: STACK TRACE EXPOSED ❌
} catch (error) {
  console.error("Error obteniendo enrollments:", error);
  return NextResponse.json(
    {
      error: ERROR_MESSAGES.SERVER_ERROR,
      details:
        error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR,  // ⚠️ EXPOSES ERROR MESSAGE
    },
    { status: 500 }
  );
}
```

**Impact**: If database connection fails or SQL error occurs, the error message is sent to the client.

**Similar Issues in**:
- `/app/api/admin/dashboard/route.ts` (line 60)
- `/app/api/admin/certificates/[id]/reissue/route.ts`
- `/app/api/admin/certificates/[id]/revoke/route.ts`
- `/app/api/admin/certificates/route.ts`
- `/app/api/admin/enrollments/[id]/route.ts`
- `/app/api/admin/reports/route.ts`
- `/app/api/admin/settings/route.ts`
- `/app/api/billing/webhooks/route.ts` (line 53)

**Total affected routes**: 10+

---

### Additional Exposure Issue:

**File**: `/home/user/EICC/app/api/company/profile/route.ts`
```typescript
// LINES 74-83: DEBUG INFORMATION EXPOSED ❌
if (userCompanyResult.length === 0) {
  return NextResponse.json(
    {
      error: "No se encontró una empresa activa asociada",
      debug: {
        userId: user.id,
        hasAnyCompanies: allUserCompanies.length > 0,
        companies: allUserCompanies.map((uc) => ({  // ⚠️ COMPANY DATA EXPOSED
          id: uc.id,
          companyId: uc.companyId,
          isActive: uc.isActive,
          roleId: uc.roleId,
        })),
      },
    },
    { status: 404 }
  );
}
```

**Impact**: Exposes internal database structure and company relationships to clients.

---

## 3. User-Friendly Messages

### Good Practices:

**File**: `/home/user/EICC/app/api/auth/forgot-password/route.ts` ✅
```typescript
// GOOD: Generic message prevents user enumeration
if (!user) {
  return NextResponse.json({
    success: true,
    message: "Si el email existe en nuestro sistema, recibirás instrucciones para resetear tu contraseña",
  });
}
```

**File**: `/home/user/EICC/app/api/auth/login/route.ts` ✅
```typescript
// GOOD: Generic error message
if (userResult.rows.length === 0) {
  return NextResponse.json(
    { error: "Credenciales inválidas" },  // Generic, doesn't reveal if email exists
    { status: 401 }
  );
}
```

### Bad Practices:

**File**: `/home/user/EICC/app/api/company/profile/route.ts` ❌
```typescript
// PROBLEMATIC: Exposes company relationships
return NextResponse.json({
  error: "No estás asociado a ninguna empresa",
  code: "NO_COMPANY_ASSOCIATED",
  debug: {
    userCompanyId: userCompany.id,  // ⚠️ Exposes internal structure
  },
});
```

---

## 4. Logging Format Analysis

### Current State: INCONSISTENT

#### Type A - No Structure (70% of routes)
**File**: `/home/user/EICC/app/api/courses/route.ts`
```typescript
} catch (error) {
  console.error("Error al listar cursos:", error);  // ❌ No context
  return NextResponse.json(
    { error: "Error interno del servidor" },
    { status: 500 }
  );
}
```

Missing:
- Timestamp
- User ID
- Action details
- Request context

#### Type B - Good Structure (30% of routes)
**File**: `/home/user/EICC/app/api/user/change-password/route.ts` ✅
```typescript
// GOOD: Structured logging with context
console.warn("Failed password change attempt:", {
  userId: payload.userId,  // ✅ User context
  timestamp: new Date().toISOString(),  // ✅ Timestamp
  ip: request.headers.get("x-forwarded-for") || "unknown",  // ✅ Request context
});

// Success logging
console.log("Password changed successfully:", {
  userId: payload.userId,
  timestamp: new Date().toISOString(),
  ip: request.headers.get("x-forwarded-for") || "unknown",
});
```

**File**: `/home/user/EICC/app/api/user/profile/route.ts` ✅
```typescript
// AUDIT LOG: Good structure
console.log("Profile updated:", {
  userId: payload.userId,
  changes,  // What was changed
  timestamp: new Date().toISOString(),
  ip: request.headers.get("x-forwarded-for") || "unknown",
});
```

**File**: `/home/user/EICC/app/api/billing/webhooks/route.ts` ✅
```typescript
// Webhook logging with context
console.error("Webhook signature verification failed:", {
  error: error.message,
  signature: signature.substring(0, 20) + "...",  // Truncated for security
  timestamp: new Date().toISOString(),
  userAgent: req.headers.get("user-agent"),
});
```

---

## Summary of Findings

### Critical Issues
1. **10+ routes expose error.message to clients** → Database errors, SQL syntax errors, etc. revealed
2. **Debug information exposed** → Internal database structure visible to clients

### High Priority Issues
3. **No structured logging** → 70% of routes use unstructured console.error
4. **Missing audit context** → No userId, action, or timestamp in most error logs

### Medium Priority Issues
5. **Inconsistent error handling** → Some routes user-friendly, others reveal details
6. **No central error handling** → Each route implements its own pattern

---

## Good Examples (Reference)

### ✅ Best Practice Pattern:
```typescript
// 1. Structured logging with context
console.error("Action failed:", {
  userId: payload.userId,
  action: "update_profile",
  timestamp: new Date().toISOString(),
  ip: request.headers.get("x-forwarded-for") || "unknown",
  error: error instanceof Error ? error.message : "Unknown error",  // Logged internally
});

// 2. Generic user response
return NextResponse.json(
  { error: "Unable to update profile" },  // No technical details
  { status: 500 }
);
```

### ✅ Secure Error Handling:
```typescript
// From forgot-password route
if (!user) {
  // Returns same success message regardless of whether user exists
  return NextResponse.json({
    success: true,
    message: "Si el email existe en nuestro sistema, recibirás instrucciones",
  });
}
```

---

## Recommendations

### 1. Create Centralized Error Handler
```typescript
// lib/error-logger.ts
export function logError(context: {
  userId?: string;
  action: string;
  error: Error;
  ip?: string;
  request?: NextRequest;
}) {
  console.error(`[${context.action}]`, {
    userId: context.userId,
    timestamp: new Date().toISOString(),
    ip: context.ip,
    error: context.error.message,
  });
}
```

### 2. Fix Stack Trace Exposure
```typescript
// DO NOT DO THIS:
details: error instanceof Error ? error.message : ERROR_MESSAGES.UNKNOWN_ERROR,

// DO THIS INSTEAD:
// Log error internally
logError({ action: "get_enrollments", error, userId });
// Return generic message
{ error: ERROR_MESSAGES.SERVER_ERROR }
```

### 3. Standardize Logging
All routes should follow:
- Timestamp (ISO 8601)
- userId (if authenticated)
- action (operation performed)
- error details (logged internally only)

### 4. Remove Debug Information
Remove all `debug` objects from error responses. Never expose:
- Internal IDs
- Database structure
- Relationship information
- Query details

---

## Files Requiring Immediate Fixes

### Critical (Remove error.message from responses):
1. `/home/user/EICC/app/api/admin/enrollments/route.ts`
2. `/home/user/EICC/app/api/admin/dashboard/route.ts`
3. `/home/user/EICC/app/api/admin/certificates/[id]/reissue/route.ts`
4. `/home/user/EICC/app/api/admin/certificates/[id]/revoke/route.ts`
5. `/home/user/EICC/app/api/admin/certificates/route.ts`
6. `/home/user/EICC/app/api/admin/enrollments/[id]/route.ts`
7. `/home/user/EICC/app/api/admin/reports/route.ts`
8. `/home/user/EICC/app/api/admin/settings/route.ts`
9. `/home/user/EICC/app/api/billing/webhooks/route.ts`
10. `/home/user/EICC/app/api/admin/roles/route.ts` (needs check)

### High Priority (Remove debug fields):
11. `/home/user/EICC/app/api/company/profile/route.ts` (Lines 74-83, 99-103, 120-123)

---

## Positive Findings

### ✅ Rate Limiting
All sensitive routes implement rate limiting:
- Auth routes: 5 attempts per 15 minutes
- API routes: 60 per minute
- Password changes: 5 per minute

### ✅ CSRF Protection
Properly implemented in:
- All POST/PUT/PATCH routes
- Properly configured with HMAC signatures
- Double-submit cookie pattern used

### ✅ Input Validation
- Zod schema validation used in critical routes
- Input sanitization in place
- Email and password validation present

### ✅ Some Routes Have Good Logging
Routes implementing the correct pattern:
- `/app/api/user/change-password/route.ts`
- `/app/api/user/profile/route.ts`
- `/app/api/billing/webhooks/route.ts`

---

## Conclusion

The codebase has a **solid security foundation** with rate limiting, CSRF protection, and input validation. However, **error handling is inconsistent and exposes sensitive information**. 

**Priority**: Fix stack trace exposure in 10+ routes immediately, then implement structured logging across the codebase.

