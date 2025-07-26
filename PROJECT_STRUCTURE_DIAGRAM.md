# Online Learning Platform - Project Structure Diagram

## Directory Structure Overview

```mermaid
graph TD
    A[online-learning-platform] --> B[app/]
    A --> C[components/]
    A --> D[config/]
    A --> E[context/]
    A --> F[drizzle/]
    A --> G[hooks/]
    A --> H[lib/]
    A --> I[public/]
    A --> J[scripts/]
    A --> K[Configuration Files]

    %% App Directory Structure
    B --> B1[_components/]
    B --> B2["(auth)/"]
    B --> B3[api/]
    B --> B4[course/]
    B --> B5[workspace/]
    B --> B6[Layout & Pages]

    %% Auth Routes
    B2 --> B2A[sign-in/]
    B2 --> B2B[sign-up/]

    %% API Routes
    B3 --> B3A[auth/]
    B3 --> B3B[courses/]
    B3 --> B3C[enroll-course/]
    B3 --> B3D[generate-course-content/]
    B3 --> B3E[generate-course-layout/]
    B3 --> B3F[user/]

    %% Auth API Endpoints
    B3A --> B3A1[accept-invite/]
    B3A --> B3A2[invite/]
    B3A --> B3A3[login/]
    B3A --> B3A4[logout/]
    B3A --> B3A5[refresh/]
    B3A --> B3A6[register/]
    B3A --> B3A7[switch-company/]
    B3A --> B3A8[switch-organization/]
    B3A --> B3A9[validate/]

    %% Course Structure
    B4 --> B4A[_components/]
    B4 --> B4B[[courseId]/]

    %% Course Components
    B4A --> B4A1[ChapterContent.tsx]
    B4A --> B4A2[ChapterListSidebar.tsx]

    %% Workspace Structure
    B5 --> B5A[_components/]
    B5 --> B5B[admin/]
    B5 --> B5C[billing/]
    B5 --> B5D[company/]
    B5 --> B5E[edit-course/]
    B5 --> B5F[explore/]
    B5 --> B5G[my-learning/]
    B5 --> B5H[profile/]
    B5 --> B5I[student/]
    B5 --> B5J[view-course/]

    %% Workspace Components
    B5A --> B5A1[AddNewCourseDialog.tsx]
    B5A --> B5A2[AdminNavMenu.tsx]
    B5A --> B5A3[AppHeader.tsx]
    B5A --> B5A4[AppSidebar.tsx]
    B5A --> B5A5[CompanyNavMenu.tsx]
    B5A --> B5A6[CourseCard.tsx]
    B5A --> B5A7[CourseList.tsx]
    B5A --> B5A8[EnrollCourseCard.tsx]
    B5A --> B5A9[EnrollCourseList.tsx]
    B5A --> B5A10[StudentNavMenu.tsx]
    B5A --> B5A11[WelcomeBanner.tsx]

    %% Admin Section
    B5B --> B5B1[certificates/]
    B5B --> B5B2[companies/]
    B5B --> B5B3[courses/]
    B5B --> B5B4[dashboard/]
    B5B --> B5B5[enrollments/]
    B5B --> B5B6[reports/]
    B5B --> B5B7[settings/]
    B5B --> B5B8[support/]
    B5B --> B5B9[users/]

    %% Company Section
    B5D --> B5D1[billing/]
    B5D --> B5D2[certificates/]
    B5D --> B5D3[courses/]
    B5D --> B5D4[dashboard/]
    B5D --> B5D5[employees/]
    B5D --> B5D6[profile/]
    B5D --> B5D7[progress/]
    B5D --> B5D8[support/]

    %% Edit Course Section
    B5E --> B5E1[_components/]
    B5E --> B5E2[[courseId]/]

    %% Edit Course Components
    B5E1 --> B5E1A[ChapterTopicList.tsx]
    B5E1 --> B5E1B[CourseInfo.tsx]
    B5E1 --> B5E1C[EditCourse.tsx]

    %% Student Section
    B5I --> B5I1[catalog/]
    B5I --> B5I2[certificates/]
    B5I --> B5I3[courses/]
    B5I --> B5I4[dashboard/]
    B5I --> B5I5[profile/]
    B5I --> B5I6[support/]

    %% View Course Section
    B5J --> B5J1[[courseId]/]

    %% UI Components
    C --> C1[ui/]
    C1 --> C1A[accordion.tsx]
    C1 --> C1B[badge.tsx]
    C1 --> C1C[button.tsx]
    C1 --> C1D[card.tsx]
    C1 --> C1E[dialog.tsx]
    C1 --> C1F[dropdown-menu.tsx]
    C1 --> C1G[input.tsx]
    C1 --> C1H[label.tsx]
    C1 --> C1I[progress.tsx]
    C1 --> C1J[select.tsx]
    C1 --> C1K[separator.tsx]
    C1 --> C1L[sheet.tsx]
    C1 --> C1M[sidebar.tsx]
    C1 --> C1N[skeleton.tsx]
    C1 --> C1O[sonner.tsx]
    C1 --> C1P[switch.tsx]
    C1 --> C1Q[textarea.tsx]
    C1 --> C1R[tooltip.tsx]

    %% Configuration
    D --> D1[db.tsx]
    D --> D2[schema.ts]

    %% Context
    E --> E1[AuthContext.tsx]
    E --> E2[SelectedChapterIndexContext.tsx]
    E --> E3[UserDetailContext.tsx]

    %% Database
    F --> F1[meta/]
    F --> F2[relations.ts]
    F --> F3[schema.ts]

    %% Hooks
    G --> G1[use-admin.ts]
    G --> G2[use-company.ts]
    G --> G3[use-mobile.ts]
    G --> G4[use-student.ts]

    %% Library
    H --> H1[auth.ts]
    H --> H2[utils.ts]

    %% Public Assets
    I --> I1[logo-minimalista.png]
    I --> I2[logo.png]
    I --> I3[logonew.png]
    I --> I4[online-education.png]

    %% Scripts
    J --> J1[seed.ts]
    J --> J2[setup-database-safe.js]

    %% Configuration Files
    K --> K1[components.json]
    K --> K2[drizzle.config.ts]
    K --> K3[eslint.config.mjs]
    K --> K4[middleware.ts]
    K --> K5[next.config.ts]
    K --> K6[package.json]
    K --> K7[postcss.config.mjs]
    K --> K8[tsconfig.json]

    %% Documentation
    A --> L[Documentation]
    L --> L1[ADMIN_MENU_IMPLEMENTATION.md]
    L --> L2[AUTHENTICATION_FLOWS.md]
    L --> L3[PROJECT_STRUCTURE.md]
    L --> L4[README.md]

    %% Styling
    classDef folder fill:#e1f5fe,stroke:#01579b,stroke-width:2px
    classDef file fill:#f3e5f5,stroke:#4a148c,stroke-width:1px
    classDef config fill:#fff3e0,stroke:#e65100,stroke-width:1px
    classDef component fill:#e8f5e8,stroke:#2e7d32,stroke-width:1px
    classDef api fill:#ffebee,stroke:#c62828,stroke-width:1px
    classDef page fill:#fce4ec,stroke:#ad1457,stroke-width:1px

    class A,B,B1,B2,B3,B4,B5,B5A,B5B,B5C,B5D,B5E,B5F,B5G,B5H,B5I,B5J,C,C1,D,E,F,G,H,I,J,L folder
    class B2A,B2B,B3A,B3B,B3C,B3D,B3E,B3F,B3A1,B3A2,B3A3,B3A4,B3A5,B3A6,B3A7,B3A8,B3A9,B4A,B4B,B4A1,B4A2,B5A1,B5A2,B5A3,B5A4,B5A5,B5A6,B5A7,B5A8,B5A9,B5A10,B5A11,B5B1,B5B2,B5B3,B5B4,B5B5,B5B6,B5B7,B5B8,B5B9,B5D1,B5D2,B5D3,B5D4,B5D5,B5D6,B5D7,B5D8,B5E1,B5E2,B5E1A,B5E1B,B5E1C,B5I1,B5I2,B5I3,B5I4,B5I5,B5I6,B5J1,C1A,C1B,C1C,C1D,C1E,C1F,C1G,C1H,C1I,C1J,C1K,C1L,C1M,C1N,C1O,C1P,C1Q,C1R,D1,D2,E1,E2,E3,F1,F2,F3,G1,G2,G3,G4,H1,H2,I1,I2,I3,I4,J1,J2,K1,K2,K3,K4,K5,K6,K7,K8,L1,L2,L3,L4 file
    class K1,K2,K3,K4,K5,K6,K7,K8 config
    class C1A,C1B,C1C,C1D,C1E,C1F,C1G,C1H,C1I,C1J,C1K,C1L,C1M,C1N,C1O,C1P,C1Q,C1R,B5A1,B5A2,B5A3,B5A4,B5A5,B5A6,B5A7,B5A8,B5A9,B5A10,B5A11,B4A1,B4A2,B5E1A,B5E1B,B5E1C component
    class B3A1,B3A2,B3A3,B3A4,B3A5,B3A6,B3A7,B3A8,B3A9,B3B,B3C,B3D,B3E,B3F api
    class B2A,B2B,B4B,B5B1,B5B2,B5B3,B5B4,B5B5,B5B6,B5B7,B5B8,B5B9,B5D1,B5D2,B5D3,B5D4,B5D5,B5D6,B5D7,B5D8,B5E2,B5I1,B5I2,B5I3,B5I4,B5I5,B5I6,B5J1 page
```

## Key Architecture Patterns

### 1. **App Router Structure**

- Uses Next.js 13+ App Router with route groups `(auth)`
- Dynamic routes with `[courseId]` parameters
- Nested layouts for different user roles

### 2. **Role-Based Organization**

- **Admin**: `/workspace/admin/` - Full platform management
- **Company**: `/workspace/company/` - Company-specific features
- **Student**: `/workspace/student/` - Learning interface

### 3. **Component Architecture**

- **UI Components**: Reusable shadcn/ui components in `/components/ui/`
- **Feature Components**: Role-specific components in `/app/workspace/_components/`
- **Page Components**: Route-specific components in respective directories

### 4. **API Structure**

- **Authentication**: Comprehensive auth endpoints in `/app/api/auth/`
- **Course Management**: Course-related APIs
- **Content Generation**: AI-powered content generation endpoints

### 5. **Database Layer**

- **Drizzle ORM**: Type-safe database operations
- **Schema Management**: Centralized schema definitions
- **Migrations**: Automated database migrations

### 6. **State Management**

- **React Context**: User authentication and chapter selection
- **Custom Hooks**: Role-specific data fetching and state management

## Technology Stack

- **Framework**: Next.js 13+ with App Router
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database**: Drizzle ORM with SQLite/PostgreSQL
- **Authentication**: Custom JWT-based auth system
- **UI**: Modern component library with dark/light mode support
- **TypeScript**: Full type safety throughout the application

This structure provides a scalable, maintainable architecture for a multi-tenant online learning platform with role-based access control and comprehensive course management capabilities.
