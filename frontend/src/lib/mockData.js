export const mockServiceRequests = [
  {
    id: "SR-1042",
    client_name: "Rosa Martinez",
    service_type: "Pantry delivery",
    priority: "High",
    status: "Open",
    location: "Downtown East",
    assignee: "Unassigned",
    created_at: "2026-05-13T10:15:00Z",
    preferred_date: "2026-05-15",
    notes: "Needs assistance carrying groceries upstairs."
  },
  {
    id: "SR-1038",
    client_name: "Arthur Bennett",
    service_type: "Wellness check-in",
    priority: "Medium",
    status: "In progress",
    location: "Remote",
    assignee: "Nia Patel",
    created_at: "2026-05-12T16:40:00Z",
    preferred_date: "2026-05-14",
    notes: "Prefers a late afternoon call and speaks slowly."
  },
  {
    id: "SR-1031",
    client_name: "Kim Johnson",
    service_type: "Meal prep support",
    priority: "High",
    status: "Open",
    location: "Community Kitchen",
    assignee: "Marcus Lee",
    created_at: "2026-05-11T09:05:00Z",
    preferred_date: "2026-05-17",
    notes: "Requires allergy-safe packaging and pickup coordination."
  },
  {
    id: "SR-1027",
    client_name: "Laila Hassan",
    service_type: "Transportation",
    priority: "Low",
    status: "Assigned",
    location: "Northside Clinic",
    assignee: "Jordan Chen",
    created_at: "2026-05-10T12:25:00Z",
    preferred_date: "2026-05-18",
    notes: "Medical appointment transport with wheelchair support."
  }
];

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

export const mockVolunteerAssignments = [
  {
    id: "VA-201",
    request_id: "SR-1042",
    client_name: "Rosa Martinez",
    service_type: "Pantry delivery",
    status: "Assigned",
    action_label: "Confirm pickup",
    scheduled_for: "2026-05-15T14:00:00Z",
    location: "Downtown East"
  },
  {
    id: "VA-202",
    request_id: "SR-1027",
    client_name: "Laila Hassan",
    service_type: "Transportation",
    status: "In progress",
    action_label: "View route",
    scheduled_for: "2026-05-16T09:30:00Z",
    location: "Northside Clinic"
  },
  {
    id: "VA-203",
    request_id: "SR-1019",
    client_name: "David Cho",
    service_type: "Meal delivery",
    status: "Pending confirmation",
    action_label: "Accept task",
    scheduled_for: "2026-05-17T12:15:00Z",
    location: "Harbor District"
  }
];

export const mockVolunteerTasks = [
  {
    id: "TASK-11",
    title: "Confirm pantry route supplies",
    due_at: "2026-05-15T10:00:00Z",
    status: "Due soon"
  },
  {
    id: "TASK-12",
    title: "Call assigned client before pickup",
    due_at: "2026-05-15T12:00:00Z",
    status: "Upcoming"
  },
  {
    id: "TASK-13",
    title: "Submit service notes for SR-1027",
    due_at: "2026-05-16T17:00:00Z",
    status: "Open"
  }
];

export const mockVolunteerAvailability = [
  { day: "Monday", morning: true, afternoon: false, evening: false },
  { day: "Tuesday", morning: false, afternoon: true, evening: true },
  { day: "Wednesday", morning: true, afternoon: true, evening: false },
  { day: "Thursday", morning: false, afternoon: false, evening: true },
  { day: "Friday", morning: true, afternoon: true, evening: true },
  { day: "Saturday", morning: false, afternoon: true, evening: false },
  { day: "Sunday", morning: false, afternoon: false, evening: false }
];

export const mockVolunteerServices = [
  { id: "svc-1", label: "Pantry delivery", selected: true },
  { id: "svc-2", label: "Transportation", selected: true },
  { id: "svc-3", label: "Meal prep support", selected: false },
  { id: "svc-4", label: "Wellness check-ins", selected: true },
  { id: "svc-5", label: "Admin support", selected: false },
  { id: "svc-6", label: "Event setup", selected: false }
];

export const mockVolunteerProfile = {
  full_name: "Taylor Morgan",
  email: "taylor.morgan@example.org",
  phone: "(555) 014-2288",
  location: "Southwest District",
  emergency_contact: "Jordan Morgan",
  notification_preferences: {
    email: true,
    sms: false,
    push: true,
    urgent_only: false
  },
  availability_status: "Available this week"
};

export const mockVolunteerStats = [
  { label: "Active volunteers", value: 48, detail: "+6 this month" },
  { label: "Available shifts", value: 19, detail: "Across 5 programs" },
  { label: "Pending approvals", value: 7, detail: "Needs coordinator review" }
];

export const mockPageSummaries = {
  Volunteers: {
    description: "Track recruitment, onboarding, and daily staffing coverage.",
    highlights: ["48 active volunteers", "7 pending approvals", "92% shift coverage"]
  },
  "Service Requests": {
    description: "Coordinate field requests and route urgent work to the right team.",
    highlights: ["12 open requests", "3 urgent", "Average response 34 min"]
  },
  Reports: {
    description: "Review donation trends, staffing health, and fulfillment performance.",
    highlights: ["Weekly impact report", "Monthly fundraising summary", "Quarterly board pack"]
  },
  Users: {
    description: "Manage internal access, permissions, and account lifecycle.",
    highlights: ["14 active users", "2 pending invites", "Role audit ready"]
  },
  Settings: {
    description: "Configure platform defaults, communication preferences, and workspace details.",
    highlights: ["Brand settings", "Notification defaults", "Regional preferences"]
  },
  Availability: {
    description: "Visualize volunteer coverage, upcoming shifts, and schedule gaps.",
    highlights: ["19 open shifts", "Weekend coverage at risk", "5 coordinators online"]
  },
  Profile: {
    description: "View personal account details, role scope, and recent activity.",
    highlights: ["JWT session active", "Role-aware navigation", "Personal preferences placeholder"]
  }
};
