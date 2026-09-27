const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

const getToken = () => localStorage.getItem('resq_token');

const authHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${getToken()}`
});

const handleResponse = async (res) => {
  if (!res.ok) {
    let errorMsg = 'Something went wrong';
    try {
      const errorData = await res.json();
      errorMsg = errorData.error || errorData.message || errorMsg;
    } catch (e) {
      errorMsg = res.statusText || errorMsg;
    }
    throw new Error(errorMsg);
  }
  return res.json();
};

// Auth
export const register = async (data) => {
  const res = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return handleResponse(res);
};

export const login = async (email, password) => {
  const res = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return handleResponse(res);
};

// Listings
export const getActiveListings = async (params = {}) => {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.category) query.set('category', params.category);
  if (params.sort) query.set('sort', params.sort);
  
  const res = await fetch(`${API_URL}/api/listings/active?${query.toString()}`, {
    headers: authHeaders()
  });
  return handleResponse(res);
};

export const getDonations = async () => {
  const res = await fetch(`${API_URL}/api/listings/donations`, {
    headers: authHeaders()
  });
  return handleResponse(res);
};

export const createListing = async (data) => {
  const res = await fetch(`${API_URL}/api/listings`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(res);
};

export const deleteListing = async (id) => {
  const res = await fetch(`${API_URL}/api/listings/${id}`, {
    method: 'DELETE',
    headers: authHeaders()
  });
  return handleResponse(res);
};

export const getMerchantListings = async () => {
  const res = await fetch(`${API_URL}/api/listings/merchant`, {
    headers: authHeaders()
  });
  return handleResponse(res);
};

export const getMerchantStats = async () => {
  const res = await fetch(`${API_URL}/api/listings/merchant/stats`, {
    headers: authHeaders()
  });
  return handleResponse(res);
};

// Orders
export const claimItem = async (listingId) => {
  const res = await fetch(`${API_URL}/api/orders/claim`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ listing_id: listingId })
  });
  return handleResponse(res);
};

export const claimDonation = async (listingId) => {
  const res = await fetch(`${API_URL}/api/orders/donations/claim`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ listing_id: listingId })
  });
  return handleResponse(res);
};

export const getOrderHistory = async () => {
  const res = await fetch(`${API_URL}/api/orders/history`, {
    headers: authHeaders()
  });
  return handleResponse(res);
};

// Stats
export const getStats = async () => {
  const res = await fetch(`${API_URL}/api/stats`, {
    headers: authHeaders()
  });
  return handleResponse(res);
};

export const getLeaderboard = async () => {
  const res = await fetch(`${API_URL}/api/stats/leaderboard`, {
    headers: authHeaders()
  });
  return handleResponse(res);
};

export const getGlobalStats = async () => {
  const res = await fetch(`${API_URL}/api/stats/global`);
  return handleResponse(res);
};

// Reviews
export const submitReview = async (data) => {
  const res = await fetch(`${API_URL}/api/reviews`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(res);
};

export const getRestaurantReviews = async (restaurantId) => {
  const res = await fetch(`${API_URL}/api/reviews/restaurant/${restaurantId}`, {
    headers: authHeaders()
  });
  return handleResponse(res);
};

// Notifications
export const getNotifications = async () => {
  const res = await fetch(`${API_URL}/api/notifications`, {
    headers: authHeaders()
  });
  return handleResponse(res);
};

export const getUnreadCount = async () => {
  const res = await fetch(`${API_URL}/api/notifications/unread-count`, {
    headers: authHeaders()
  });
  return handleResponse(res);
};

export const markAllNotificationsRead = async () => {
  const res = await fetch(`${API_URL}/api/notifications/read-all`, {
    method: 'PUT',
    headers: authHeaders()
  });
  return handleResponse(res);
};

// Restaurant
export const getRestaurantProfile = async () => {
  const res = await fetch(`${API_URL}/api/restaurants/profile`, {
    headers: authHeaders()
  });
  return handleResponse(res);
};

export const updateRestaurantProfile = async (data) => {
  const res = await fetch(`${API_URL}/api/restaurants/profile`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify(data)
  });
  return handleResponse(res);
};

// Demo
export const fastForward = async () => {
  const res = await fetch(`${API_URL}/api/demo/fast-forward`, {
    method: 'POST',
    headers: authHeaders()
  });
  return handleResponse(res);
};
