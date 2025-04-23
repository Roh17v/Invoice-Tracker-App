export const HOST = import.meta.env.VITE_BASE_URL;

export const AUTH_ROUTES = "/api/auth";

export const SIGNUP_ROUTE = `${AUTH_ROUTES}/signup`;

export const LOGIN_ROUTE = `${AUTH_ROUTES}/login`;

export const LOGOUT_ROUTE = `${AUTH_ROUTES}/logout`;

export const INVOICE_ROUTE = "/api/invoices";

export const RECENT_ACTIVITY_ROUTE = `${INVOICE_ROUTE}/recent-activity`;

export const INVOICE_STATS_ROUTE = `${INVOICE_ROUTE}/stats`;
