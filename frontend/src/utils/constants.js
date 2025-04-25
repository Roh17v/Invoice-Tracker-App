export const HOST = import.meta.env.VITE_BASE_URL;

export const AUTH_ROUTES = "/api/auth";

export const SIGNUP_ROUTE = `${AUTH_ROUTES}/signup`;

export const LOGIN_ROUTE = `${AUTH_ROUTES}/login`;

export const LOGOUT_ROUTE = `${AUTH_ROUTES}/logout`;

export const INVOICE_ROUTE = "/api/invoices";

export const RECENT_ACTIVITY_ROUTE = `${INVOICE_ROUTE}/recent-activity`;

export const INVOICE_STATS_ROUTE = `${INVOICE_ROUTE}/stats`;

export const USER_ROUTE = `/api/users`;

export const ADMIN_ROUTE = `/api/admin`;

export const GET_ALL_USERS_ADMIN = `${ADMIN_ROUTE}/users`;

export const GET_ALL_INVOICES_ADMIN = `${ADMIN_ROUTE}/invoices`;

export const UPDATE_INVOICE_STATUS = `${ADMIN_ROUTE}/invoice`;

export const CREATE_NEW_USER = `${ADMIN_ROUTE}/users`;

export const DELETE_USER_ROUTE = `${ADMIN_ROUTE}/users`;

export const ADMIN_INVOICE_STATS_ROUTE = `${ADMIN_ROUTE}/analytics/invoices/stats`;

export const ADMIN_RECENT_ACTIVITY_ROUTE = `${ADMIN_ROUTE}/analytics/invoices/activity`;
