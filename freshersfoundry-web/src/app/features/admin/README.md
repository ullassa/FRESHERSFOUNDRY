# Admin Module Structure

This folder contains all admin-related components, services, and forms for managing FreshersFoundry content.

## Folder Organization

```
admin/
├── dashboard/                          # Admin dashboard and main view
│   ├── admin-dashboard.component.ts    # Main dashboard component
│   ├── admin-dashboard.component.html  # Dashboard template
│   └── admin-dashboard.component.css   # Dashboard styles
│
├── approvals/                          # Content approval management
│   ├── pending-approvals.component.ts  # Pending content approvals
│   └── pending-approvals.component.html# Approvals template
│
├── forms/                              # All admin form components
│   ├── post-job/                       # Job posting form
│   │   ├── post-job.component.ts
│   │   └── post-job.component.html
│   │
│   ├── post-blog/                      # Blog posting form
│   │   ├── post-blog.component.ts
│   │   ├── post-blog.component.html
│   │   └── post-blog.component.css
│   │
│   ├── post-question/                  # Interview question form
│   │   ├── post-interview-question.component.ts
│   │   └── post-interview-question.component.html
│   │
│   └── post-job-dialog/                # Job posting dialog (modal)
│       ├── post-job-dialog.component.ts
│       ├── post-job-dialog.component.html
│       └── post-job-dialog.component.css
│
├── services/                           # Shared services
│   └── admin-dashboard.service.ts      # API calls for dashboard data
│
└── README.md                           # This file
```

## Component Overview

### Dashboard (`dashboard/`)
- **AdminDashboardComponent**: Main admin dashboard showing metrics, recent activity, and content management tables
  - Displays stats: Total users, Active jobs, Pending blogs, Interview questions
  - Tabs for Jobs, Questions, Blogs, Interview Experiences, and Users
  - Allows editing and deleting content

### Approvals (`approvals/`)
- **PendingApprovalsComponent**: Displays pending content waiting for admin approval
  - Lists pending experiences, blogs, and jobs
  - Quick approval actions for each content type

### Forms (`forms/`)
Each form component handles creating and editing content:

- **PostJobComponent** (`post-job/`): Create/edit job postings
  - Title, company, location, type, salary, skills, description
  - Apply link and logo URL

- **PostBlogComponent** (`post-blog/`): Create/edit blog posts
  - Title, content, cover image, tags
  - Sample data filler for quick testing

- **PostInterviewQuestionComponent** (`post-question/`): Create/edit interview questions
  - Category, sub-topic, difficulty level
  - Question, answer, and code snippet fields

- **PostJobDialogComponent** (`post-job-dialog/`): Dialog/modal for posting jobs
  - Similar to PostJobComponent but in dialog format
  - Date picker for expiry date

### Services (`services/`)
- **AdminDashboardService**: Handles API communication
  - `getDashboard()`: Fetch dashboard metrics and recent activity
  - `getDashboardStats()`: Get statistics
  - `search()`: Search admin content

## Routing

All admin routes are configured in `app.routes.ts`:

```typescript
{ path: 'admin', component: AdminDashboardComponent }
{ path: 'admin/post-job', component: PostJobComponent }
{ path: 'admin/post-job/:id', component: PostJobComponent } // Edit
{ path: 'admin/post-blog', component: PostBlogComponent }
{ path: 'admin/post-blog/:id', component: PostBlogComponent } // Edit
{ path: 'admin/post-question', component: PostInterviewQuestionComponent }
{ path: 'admin/post-question/:id', component: PostInterviewQuestionComponent } // Edit
{ path: 'admin/pending-approvals', component: PendingApprovalsComponent }
```

## How to Add New Content Types

1. Create a new folder under `forms/` with the appropriate name (e.g., `post-resource/`)
2. Create the component files:
   - `post-resource.component.ts`
   - `post-resource.component.html`
   - `post-resource.component.css` (if needed)
3. Add the route to `app.routes.ts`
4. Import the component in the routing module

## Styling

Most forms follow these CSS patterns (from `post-blog.component.css`):
- `.page-head`: Header section with eyebrow, title, and description
- `.form-grid`: Grid layout for form fields
- `.two-column`: Two-column layout for side-by-side fields
- `.span-2`: Full-width field
- `.actions`: Button container for submit/cancel

## Best Practices

1. **Always use the service** for API calls instead of making HTTP calls directly
2. **Form validation**: Use Angular Reactive Forms with appropriate validators
3. **Error handling**: Show meaningful error messages via snackbars or cards
4. **Navigation**: Use Router to navigate after successful operations
5. **Authentication**: Check token in component and redirect to login if missing
