# FreshersFoundry

FreshersFoundry is a full-stack career platform for Indian freshers and students focused on verified interview experiences, interview prep, jobs, and blogs.

## Workspace
- `FreshersFoundry.Api` - ASP.NET Core Web API
- `freshersfoundry-web` - Angular frontend

## What Is Scaffolded
- ASP.NET Core Web API foundation with JWT-ready auth wiring
- Entity Framework Core models and DbContext
- Admin, content, bookmarks, comments, and ads controller shells
- Angular 18 standalone app shell with the target routes and theme
- Seed catalog for starter questions, jobs, blogs, interview experiences, and ads

## Run Locally
Backend:

```bash
cd FreshersFoundry.Api
dotnet restore
dotnet ef migrations add InitialCreate
dotnet ef database update
dotnet run
```

Frontend:

```bash
cd freshersfoundry-web
npm install
npm start
```

## Notes
- The backend seed currently includes a starter catalog and can be expanded to match the full MVP launch dataset.
- The frontend uses the requested dark slate and crimson theme direction with reusable shell components.
