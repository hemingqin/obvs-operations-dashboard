// Fallback notifications shown only if the real /notifications endpoint is
// unreachable (see fetchNotifications in services/operationsService.js).
export const mockNotifications = [
  {
    id: "mock-notification-1",
    message: "Donation 221 created for Hazel Wright",
    status: "sent",
    created_at: "2026-05-13T14:00:00Z",
    type: "donation",
    read: false
  },
  {
    id: "mock-notification-2",
    message: "System sync completed for nightly volunteer imports",
    status: "sent",
    created_at: "2026-05-13T08:30:00Z",
    type: "system",
    read: true
  },
  {
    id: "mock-notification-3",
    message: "Service request SR-1042 is awaiting assignment",
    status: "pending",
    created_at: "2026-05-12T17:05:00Z",
    type: "request",
    read: false
  },
  {
    id: "mock-notification-4",
    message: "Warning: weekend pantry route is below target coverage",
    status: "pending",
    created_at: "2026-05-12T12:10:00Z",
    type: "warning",
    read: false
  }
];

// The Volunteers directory is presentation-layer data (there is no backend
// "list all volunteers" endpoint -- see routers/volunteer.py, which is
// strictly self-service). These 20 names are the same ones used as
// `assignee_name` in backend/seed_demo_data.py's SERVICE_REQUESTS, so a
// volunteer searched here also shows up assigned to real service requests
// and referenced in real notifications. Sarah Johnson's "Unavailable"
// status matches the reassignment story seeded there (her wellness-check
// shift for Agnes Littlebear was reassigned to Grace Okafor).
export const volunteerDirectory = [
  {
    id: "VOL-101",
    name: "Priya Anand",
    email: "priya.anand@example.org",
    phone: "(250) 217-7743",
    program: "Pantry delivery",
    skills: ["Driving", "Heavy lifting"],
    status: "Active",
    last_activity: "2026-07-14T16:20:00Z",
    upcoming_shift: "2026-07-18T09:00:00Z",
    background_check: "Cleared",
    onboarding: "Complete"
  },
  {
    id: "VOL-102",
    name: "Sofia Reyes",
    email: "sofia.reyes@example.org",
    phone: "(250) 552-3310",
    program: "Pantry delivery",
    skills: ["Driving", "Inventory management"],
    status: "Active",
    last_activity: "2026-06-13T15:00:00Z",
    upcoming_shift: "2026-07-20T10:00:00Z",
    background_check: "Cleared",
    onboarding: "Complete"
  },
  {
    id: "VOL-103",
    name: "Natasha Petrov",
    email: "natasha.petrov@example.org",
    phone: "(250) 664-9021",
    program: "Pantry delivery",
    skills: ["Driving", "Route planning"],
    status: "Active",
    last_activity: "2026-06-27T13:40:00Z",
    upcoming_shift: "2026-07-17T11:00:00Z",
    background_check: "Cleared",
    onboarding: "Complete"
  },
  {
    id: "VOL-104",
    name: "Emily Tran",
    email: "emily.tran@example.org",
    phone: "(250) 381-2207",
    program: "Pantry delivery",
    skills: ["Driving"],
    status: "Active",
    last_activity: "2026-07-10T10:00:00Z",
    upcoming_shift: "2026-07-19T09:30:00Z",
    background_check: "Cleared",
    onboarding: "Complete"
  },
  {
    id: "VOL-105",
    name: "Jordan Chen",
    email: "jordan.chen@example.org",
    phone: "(250) 442-9981",
    program: "Transportation",
    skills: ["Driving", "Wheelchair-accessible transport"],
    status: "Active",
    last_activity: "2026-05-27T09:15:00Z",
    upcoming_shift: null,
    background_check: "Cleared",
    onboarding: "Complete"
  },
  {
    id: "VOL-106",
    name: "Connor Campbell",
    email: "connor.campbell@example.org",
    phone: "(250) 598-4471",
    program: "Transportation",
    skills: ["Driving", "Wheelchair-accessible transport"],
    status: "Active",
    last_activity: "2026-06-09T12:00:00Z",
    upcoming_shift: null,
    background_check: "Cleared",
    onboarding: "Complete"
  },
  {
    id: "VOL-107",
    name: "Liam Fischer",
    email: "liam.fischer@example.org",
    phone: "(250) 226-8804",
    program: "Transportation",
    skills: ["Driving"],
    status: "Active",
    last_activity: "2026-06-22T09:00:00Z",
    upcoming_shift: "2026-07-22T13:00:00Z",
    background_check: "Cleared",
    onboarding: "Complete"
  },
  {
    id: "VOL-108",
    name: "Jasdeep Sidhu",
    email: "jasdeep.sidhu@example.org",
    phone: "(250) 774-6630",
    program: "Transportation",
    skills: ["Driving", "Route planning"],
    status: "Active",
    last_activity: "2026-07-09T08:45:00Z",
    upcoming_shift: "2026-07-17T14:00:00Z",
    background_check: "Cleared",
    onboarding: "Complete"
  },
  {
    id: "VOL-109",
    name: "Nia Patel",
    email: "nia.patel@example.org",
    phone: "(250) 330-5521",
    program: "Wellness check-in",
    skills: ["Bilingual (Spanish)", "First aid"],
    status: "Active",
    last_activity: "2026-05-25T10:40:00Z",
    upcoming_shift: null,
    background_check: "Cleared",
    onboarding: "Complete"
  },
  {
    id: "VOL-110",
    name: "Grace Okafor",
    email: "grace.okafor@example.org",
    phone: "(250) 990-6647",
    program: "Wellness check-in",
    skills: ["Bilingual (French)", "First aid"],
    status: "Active",
    last_activity: "2026-07-10T11:10:00Z",
    upcoming_shift: "2026-07-22T13:00:00Z",
    background_check: "Cleared",
    onboarding: "Complete"
  },
  {
    id: "VOL-111",
    name: "Fatima Al-Rashid",
    email: "fatima.alrashid@example.org",
    phone: "(250) 415-2298",
    program: "Wellness check-in",
    skills: ["Bilingual (Arabic)", "First aid"],
    status: "Active",
    last_activity: "2026-06-18T09:30:00Z",
    upcoming_shift: null,
    background_check: "Cleared",
    onboarding: "Complete"
  },
  {
    id: "VOL-112",
    name: "Sarah Johnson",
    email: "sarah.johnson@example.org",
    phone: "(250) 812-3345",
    program: "Wellness check-in",
    skills: ["First aid", "Counseling background"],
    status: "Unavailable",
    last_activity: "2026-07-10T08:45:00Z",
    upcoming_shift: null,
    background_check: "Cleared",
    onboarding: "Complete"
  },
  {
    id: "VOL-113",
    name: "Marcus Lee",
    email: "marcus.lee@example.org",
    phone: "(250) 118-2290",
    program: "Meal prep support",
    skills: ["Food handling", "Team lead"],
    status: "Active",
    last_activity: "2026-06-05T13:05:00Z",
    upcoming_shift: null,
    background_check: "Cleared",
    onboarding: "Complete"
  },
  {
    id: "VOL-114",
    name: "David Cho",
    email: "david.cho@example.org",
    phone: "(250) 883-1120",
    program: "Meal prep support",
    skills: ["Food handling"],
    status: "Active",
    last_activity: "2026-07-07T17:30:00Z",
    upcoming_shift: "2026-07-18T11:00:00Z",
    background_check: "Cleared",
    onboarding: "Complete"
  },
  {
    id: "VOL-115",
    name: "Elena Volkov",
    email: "elena.volkov@example.org",
    phone: "(250) 771-4432",
    program: "Admin support",
    skills: ["Data entry", "Scheduling"],
    status: "Active",
    last_activity: "2026-07-15T08:50:00Z",
    upcoming_shift: "2026-07-16T09:00:00Z",
    background_check: "Cleared",
    onboarding: "Complete"
  },
  {
    id: "VOL-116",
    name: "Hannah Wright",
    email: "hannah.wright@example.org",
    phone: "(250) 264-7789",
    program: "Admin support",
    skills: ["Data entry", "Grant writing"],
    status: "Active",
    last_activity: "2026-06-16T14:00:00Z",
    upcoming_shift: null,
    background_check: "Cleared",
    onboarding: "Complete"
  },
  {
    id: "VOL-117",
    name: "Aisha Khan",
    email: "aisha.khan@example.org",
    phone: "(250) 355-9012",
    program: "Admin support",
    skills: ["Data entry"],
    status: "Onboarding",
    last_activity: "2026-07-12T10:00:00Z",
    upcoming_shift: null,
    background_check: "Pending",
    onboarding: "In progress"
  },
  {
    id: "VOL-118",
    name: "Owen Brooks",
    email: "owen.brooks@example.org",
    phone: "(250) 674-2205",
    program: "Event support",
    skills: ["Event coordination"],
    status: "Active",
    last_activity: "2026-06-28T12:00:00Z",
    upcoming_shift: null,
    background_check: "Cleared",
    onboarding: "Complete"
  },
  {
    id: "VOL-119",
    name: "Ryan MacDonald",
    email: "ryan.macdonald@example.org",
    phone: "(250) 903-5541",
    program: "Event support",
    skills: ["Event coordination", "Team lead"],
    status: "Inactive",
    last_activity: "2026-05-02T09:00:00Z",
    upcoming_shift: null,
    background_check: "Expired",
    onboarding: "Complete"
  },
  {
    id: "VOL-120",
    name: "Carlos Mendoza",
    email: "carlos.mendoza@example.org",
    phone: "(250) 447-6689",
    program: "Event support",
    skills: ["Event coordination"],
    status: "Active",
    last_activity: "2026-07-05T15:20:00Z",
    upcoming_shift: null,
    background_check: "Cleared",
    onboarding: "Complete"
  }
];

// Users admin page -- also presentation-layer only (no backend user-
// management API; see the Task 2 volunteer-permissions writeup). A few
// entries intentionally reuse volunteerDirectory names so the same person
// is recognizable across Volunteers and Users.
export const userAccounts = [
  {
    id: "USR-01",
    name: "Alex Rivera",
    email: "alex.rivera@obvs.org",
    role: "Admin",
    status: "Active",
    last_login: "2026-07-15T18:22:00Z",
    permissions: "Full workspace access"
  },
  {
    id: "USR-02",
    name: "Morgan Blake",
    email: "morgan.blake@obvs.org",
    role: "Coordinator",
    status: "Active",
    last_login: "2026-07-15T14:05:00Z",
    permissions: "Manage requests, volunteers, donations"
  },
  {
    id: "USR-03",
    name: "Sam Okoye",
    email: "sam.okoye@obvs.org",
    role: "Coordinator",
    status: "Active",
    last_login: "2026-07-14T09:40:00Z",
    permissions: "Manage requests, volunteers, donations"
  },
  {
    id: "USR-04",
    name: "Priya Anand",
    email: "priya.anand@example.org",
    role: "Volunteer",
    status: "Active",
    last_login: "2026-07-14T16:20:00Z",
    permissions: "View assignments, edit own profile"
  },
  {
    id: "USR-05",
    name: "Grace Okafor",
    email: "grace.okafor@example.org",
    role: "Volunteer",
    status: "Active",
    last_login: "2026-07-10T11:10:00Z",
    permissions: "View assignments, edit own profile"
  },
  {
    id: "USR-06",
    name: "Taylor Whitfield",
    email: "taylor.whitfield@obvs.org",
    role: "Coordinator",
    status: "Disabled",
    last_login: "2026-06-02T10:00:00Z",
    permissions: "Manage requests, volunteers, donations"
  },
  {
    id: "USR-07",
    name: "Aisha Khan",
    email: "aisha.khan@example.org",
    role: "Volunteer",
    status: "Pending",
    last_login: null,
    permissions: "View assignments, edit own profile"
  },
  {
    id: "USR-08",
    name: "Jamie Sutton",
    email: "jamie.sutton@obvs.org",
    role: "Admin",
    status: "Active",
    last_login: "2026-07-13T11:15:00Z",
    permissions: "Full workspace access"
  }
];

// Reports page fallback chart -- there is no backend "volunteer hours"
// tracking table yet, so this stays a standalone illustrative series
// (see ReportsPage.jsx). Kept trending upward into the current week.
export const volunteerHoursByWeek = [
  { week: "May 25", hours: 192 },
  { week: "Jun 1", hours: 178 },
  { week: "Jun 8", hours: 221 },
  { week: "Jun 15", hours: 235 },
  { week: "Jun 22", hours: 208 },
  { week: "Jun 29", hours: 226 },
  { week: "Jul 6", hours: 244 },
  { week: "Jul 13", hours: 251 }
];
