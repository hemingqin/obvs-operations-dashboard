const allNavigationItems = [
  { label: "Dashboard", to: "/dashboard", roles: ["volunteer", "coordinator", "admin"] },
  { label: "Donations", to: "/donations", roles: ["coordinator", "admin"] },
  { label: "Volunteers", to: "/volunteers", roles: ["coordinator", "admin"] },
  {
    label: "Service Requests",
    to: "/service-requests",
    roles: ["coordinator", "admin"]
  },
  {
    label: "My Requests",
    to: "/my-requests",
    roles: ["volunteer"]
  },
  {
    label: "Notifications",
    to: "/notifications",
    roles: ["volunteer", "coordinator", "admin"]
  },
  { label: "Reports", to: "/reports", roles: ["coordinator", "admin"] },
  { label: "Users", to: "/users", roles: ["admin"] },
  { label: "Settings", to: "/settings", roles: ["admin"] },
  {
    label: "Availability",
    to: "/availability",
    roles: ["volunteer"]
  },
  {
    label: "My Services",
    to: "/my-services",
    roles: ["volunteer"]
  },
  { label: "Profile", to: "/profile", roles: ["volunteer", "coordinator", "admin"] }
];

export function getNavigationForRole(role) {
  const roleKey = role || "volunteer";
  const orderMap = {
    admin: [
      "/dashboard",
      "/donations",
      "/volunteers",
      "/service-requests",
      "/notifications",
      "/reports",
      "/users",
      "/settings"
    ],
    coordinator: [
      "/dashboard",
      "/service-requests",
      "/volunteers",
      "/notifications",
      "/donations"
    ],
    volunteer: [
      "/dashboard",
      "/my-requests",
      "/availability",
      "/my-services",
      "/notifications",
      "/profile"
    ]
  };

  const visibleItems = allNavigationItems.filter((item) => item.roles.includes(roleKey));
  const order = orderMap[roleKey] || orderMap.volunteer;

  return visibleItems.sort((left, right) => order.indexOf(left.to) - order.indexOf(right.to));
}

export function getDefaultRouteForRole(role) {
  return "/dashboard";
}
