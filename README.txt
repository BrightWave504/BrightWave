AD ASTRA HRIMS — BrightWave Digital Services, Inc.
Interactive offline prototype | HTML + CSS + JavaScript

HOW TO RUN
1. Extract the ZIP archive completely.
2. Open the folder "ad_astra_hrims".
3. Double-click index.html. It opens in Chrome, Edge or Firefox.
4. Choose "Explore the HRIMS Demo" on the homepage, or "Log in".
5. Select Applicant, Employee, HR Department, Supervisor or IT Department.
6. Switch roles using the top-right "Switch portal" button.

FILE PATHS
ad_astra_hrims/index.html            Main entry point
ad_astra_hrims/styles.css            Responsive design
ad_astra_hrims/app.js                Page content and interactive demo logic
ad_astra_hrims/assets/brightwave-logo.jpg    Original supplied company logo
ad_astra_hrims/README.txt            Instructions

INCLUDED
All 15 applicant, 20 employee, 21 HR, 10 supervisor and 15 IT page entries.
Public landing, About, Careers and Job Details pages.
Interactive role-based navigation, forms, job applications, task checklist,
recruitment stage changes, document metadata, feedback, check-ins, tickets,
job postings, sample analytics, CSV export and JSON backup/restore.
Demo records persist locally in the same browser using localStorage.

IMPORTANT LIMITATIONS
This is a high-fidelity interactive FRONTEND prototype, not a secure production HRIMS.
No backend, real database, real user authentication, secure document upload,
email verification, live notifications, payment, actual MFA, or server-side
permissions are implemented. Any demo user can switch roles.
File upload records filenames only, not file contents.
Do not enter real personal information or real passwords.
All people, job vacancies, reports, targets and company data are simulated.
The visual design uses the original logo image provided by the user.

NEXT STEPS FOR A LIVE DEPLOYMENT
Implement a backend (e.g., Laravel / Node.js), database, authenticated sessions,
server-enforced role permissions, secure object storage, email provider, HTTPS,
audit trails, backup and retention controls, privacy impact assessment, and testing.

UPDATED LOGIN (v1.1)
The sign-in screen now has five selectable roles: Applicant, Employee, HR Department, IT Department, Supervisor.
Select a role, enter demo email/password, and click Sign in to selected portal.
This is a frontend simulation: no server-side login or authorization.

NEW IT FEATURES
IT > User Account Management: email, role, activation, create user, password reset.
IT > Credential & Login Activity: masked password column, login time/IP unavailable notices.
IT > Password Reset & Account Provisioning: guided demo actions.
For security, passwords cannot be viewed or recovered in plaintext.
Offline file:// pages cannot obtain verified client IP addresses or real sign-in records.
Production implementation needs server-side login audit, secure password hashes,
verified reset tokens, and authenticated role permissions.


SUPABASE BACKEND: See BACKEND_DEPLOYMENT_GUIDE.txt for database, seed accounts and Edge Function deployment.
