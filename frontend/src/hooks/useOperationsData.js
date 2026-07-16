import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { clearToken, getSessionProfile, getToken } from "../lib/auth.js";
import { useNotifications } from "./useNotificationsSocket.js";
import {
  fetchDonations,
  fetchMyServiceRequests,
  fetchServiceRequests,
  fetchVolunteerAvailability,
  fetchVolunteerProfile,
  fetchVolunteerServices
} from "../services/operationsService.js";

export function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD"
  }).format(amount || 0);
}

export function formatDate(value) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

const fallbackVolunteerTasks = [
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
    title: "Submit service notes for the latest assignment",
    due_at: "2026-05-16T17:00:00Z",
    status: "Open"
  }
];

const fallbackVolunteerProfile = {
  full_name: "",
  email: "",
  phone: "",
  location: "",
  emergency_contact: "",
  notification_preferences: {
    email: true,
    sms: false,
    push: true,
    urgent_only: false
  },
  availability_status: "Available this week"
};

export function useOperationsData() {
  const navigate = useNavigate();
  const realtimeNotifications = useNotifications();
  const [donations, setDonations] = useState([]);
  const [serviceRequests, setServiceRequests] = useState([]);
  const [volunteerAssignments, setVolunteerAssignments] = useState([]);
  const [volunteerAvailability, setVolunteerAvailability] = useState([]);
  const [volunteerServices, setVolunteerServices] = useState([]);
  const [volunteerProfile, setVolunteerProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(() => getSessionProfile());
  const notifications = realtimeNotifications?.notifications || [];
  const notificationSource = realtimeNotifications?.notificationSource || "api";

  async function loadData() {
    setLoading(true);
    setError("");

    try {
      const token = getToken();
      const sessionProfile = getSessionProfile();
      const requests =
        sessionProfile.role === "volunteer"
          ? fetchMyServiceRequests(token)
          : fetchServiceRequests(token);

      const [
        donationsPayload,
        serviceRequestsPayload,
        volunteerProfilePayload,
        volunteerAvailabilityPayload,
        volunteerServicesPayload
      ] = await Promise.all([
        fetchDonations(),
        requests,
        fetchVolunteerProfile(token),
        fetchVolunteerAvailability(token),
        fetchVolunteerServices(token)
      ]);

      setDonations(donationsPayload);
      setServiceRequests(serviceRequestsPayload);
      setVolunteerAssignments(serviceRequestsPayload);
      setVolunteerProfile(volunteerProfilePayload);
      setVolunteerAvailability(volunteerAvailabilityPayload);
      setVolunteerServices(volunteerServicesPayload);
      setProfile(sessionProfile);
    } catch (requestError) {
      if (requestError?.status === 401) {
        clearToken();
        navigate("/login", { replace: true });
        return;
      }

      setError(requestError instanceof Error ? requestError.message : "Unable to load data");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!getToken()) {
      navigate("/login", { replace: true });
      return;
    }

    loadData();
  }, [navigate]);

  const metrics = useMemo(() => {
    const totalAmount = donations.reduce(
      (sum, donation) => sum + Number(donation.amount || 0),
      0
    );
    const averageDonation = donations.length ? totalAmount / donations.length : 0;
    const largestDonation = donations.reduce(
      (max, donation) => Math.max(max, Number(donation.amount || 0)),
      0
    );
    const sentNotifications = notifications.filter(
      (notification) => notification.status === "sent"
    ).length;

    return {
      totalDonations: donations.length,
      totalAmount,
      averageDonation,
      largestDonation,
      latestDonation: donations[0] || null,
      sentNotifications,
      openServiceRequests: serviceRequests.filter(
        (item) => item.status !== "Completed" && item.status !== "Cancelled"
      ).length
    };
  }, [donations, notifications, serviceRequests]);

  const recentActivity = useMemo(
    () =>
      donations.slice(0, 6).map((donation) => ({
        id: donation.id,
        title: `${donation.donor_name} added a donation`,
        description: `Donation ${donation.id} was recorded in the system.`,
        timestamp: donation.created_at,
        amount: donation.amount
      })),
    [donations]
  );

  const volunteerSummary = useMemo(() => {
    const unreadNotifications = notifications.filter((notification) => !notification.read).length;
    const assignedRequests = volunteerAssignments.length;
    const upcomingTasks = fallbackVolunteerTasks.length;
    const availableSlots = volunteerAvailability.reduce(
      (count, day) =>
        count + [day.morning, day.afternoon, day.evening].filter(Boolean).length,
      0
    );
    const selectedServices = volunteerServices.filter((service) => service.selected).length;

    return {
      assignedRequests,
      upcomingTasks,
      availableSlots,
      unreadNotifications,
      selectedServices
    };
  }, [notifications, volunteerAssignments, volunteerAvailability, volunteerServices]);

  return useMemo(
    () => ({
      donations,
      notifications,
      loading: loading || Boolean(realtimeNotifications?.notificationsLoading),
      error,
      metrics,
      recentActivity,
      serviceRequests,
      profile,
      notificationSource,
      notificationsError: realtimeNotifications?.notificationsError || "",
      notificationsSocketStatus: realtimeNotifications?.socketStatus || "fallback",
      updateNotification: realtimeNotifications?.updateNotification,
      volunteerAssignments,
      volunteerTasks: fallbackVolunteerTasks,
      volunteerAvailability,
      volunteerServices,
      volunteerProfile: volunteerProfile || fallbackVolunteerProfile,
      volunteerSummary,
      reload: loadData
    }),
    [
      donations,
      notifications,
      loading,
      realtimeNotifications?.notificationsLoading,
      error,
      metrics,
      recentActivity,
      serviceRequests,
      profile,
      notificationSource,
      realtimeNotifications?.notificationsError,
      realtimeNotifications?.socketStatus,
      realtimeNotifications?.updateNotification,
      volunteerAssignments,
      volunteerAvailability,
      volunteerServices,
      volunteerProfile,
      volunteerSummary
    ]
  );
}
