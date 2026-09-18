import axios from "axios";
import API_URL from "../config/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

export const getSupportTickets = async (params = {}) => {
  const res = await axios.get(`${API_URL}/api/support/tickets`, {
    ...getAuthHeaders(),
    params
  });
  return res.data;
};

export const getMyAssignedTickets = async (params = {}) => {
  const res = await axios.get(`${API_URL}/api/support/tickets/assigned`, {
    ...getAuthHeaders(),
    params
  });
  return res.data;
};

export const getEscalatedTickets = async (params = {}) => {
  const res = await axios.get(`${API_URL}/api/support/tickets/escalated`, {
    ...getAuthHeaders(),
    params
  });
  return res.data;
};

export const getSupportTicketById = async (id) => {
  const res = await axios.get(`${API_URL}/api/support/tickets/${id}`, getAuthHeaders());
  return res.data;
};

export const replyToSupportTicket = async (id, payload) => {
  const res = await axios.post(`${API_URL}/api/support/tickets/${id}/reply`, payload, getAuthHeaders());
  return res.data;
};

export const updateSupportTicketStatus = async (id, payload) => {
  const res = await axios.patch(`${API_URL}/api/support/tickets/${id}/status`, payload, getAuthHeaders());
  return res.data;
};

export const escalateSupportTicket = async (id, payload) => {
  const res = await axios.post(`${API_URL}/api/support/tickets/${id}/escalate`, payload, getAuthHeaders());
  return res.data;
};

export const assignSupportTicket = async (id, payload) => {
  const res = await axios.patch(`${API_URL}/api/support/tickets/${id}/assign`, payload, getAuthHeaders());
  return res.data;
};

export const getSupportTeamAgents = async () => {
  const res = await axios.get(`${API_URL}/api/superadmin/support-team`, getAuthHeaders());
  return res.data;
};

export const getSupportDashboardStats = async (params = {}) => {
  const res = await axios.get(`${API_URL}/api/support/tickets/dashboard-stats`, {
    ...getAuthHeaders(),
    params
  });
  return res.data;
};

export const getSupportUsersList = async (params = {}) => {
  const res = await axios.get(`${API_URL}/api/support/users-list`, {
    ...getAuthHeaders(),
    params
  });
  return res.data;
};

export const getSupportSchoolsList = async (params = {}) => {
  const res = await axios.get(`${API_URL}/api/support/schools-list`, {
    ...getAuthHeaders(),
    params
  });
  return res.data;
};


