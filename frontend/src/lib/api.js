const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = localStorage.getItem('forgetrack_token');
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('forgetrack_token');
    window.location.href = '/login?error=Session+expired';
    throw new Error('Session expired');
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(error.error || error.message || 'API request failed');
  }

  return response.json();
}

// AUTH ENDPOINTS
export async function login(role, identifier, password) {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ role, identifier, password }),
  });
  
  if (data.token) {
    localStorage.setItem('forgetrack_token', data.token);
  }
  
  return data;
}

export async function getProfile() {
  return apiRequest('/auth/me');
}

export async function changePassword(oldPassword, newPassword) {
  return apiRequest('/auth/change-password', {
    method: 'POST',
    body: JSON.stringify({ oldPassword, newPassword }),
  });
}

export async function logout() {
  localStorage.removeItem('forgetrack_token');
}

// MENTOR ENDPOINTS
export async function getStudents() {
  return apiRequest('/mentor/students');
}

export async function addStudent(studentData) {
  return apiRequest('/mentor/add-student', {
    method: 'POST',
    body: JSON.stringify(studentData),
  });
}

export async function removeStudent(studentId) {
  return apiRequest(`/mentor/students/${studentId}`, {
    method: 'DELETE',
  });
}

export async function updateStudent(studentId, studentData) {
  return apiRequest(`/mentor/students/${studentId}`, {
    method: 'PUT',
    body: JSON.stringify(studentData),
  });
}

export async function resetStudentPassword(studentId, newPassword, confirmPassword) {
  return apiRequest(`/mentor/students/${studentId}/reset-password`, {
    method: 'POST',
    body: JSON.stringify({ newPassword, confirmPassword }),
  });
}

export async function getSessionByDate(date) {
  return apiRequest(`/mentor/sessions/${date}`);
}

export async function getSessionAttendance(sessionId) {
  return apiRequest(`/mentor/sessions/${sessionId}/attendance`);
}

export async function saveAttendance(sessionId, attendanceData) {
  return apiRequest(`/mentor/sessions/${sessionId}/attendance`, {
    method: 'POST',
    body: JSON.stringify(attendanceData),
  });
}

export async function getMentorStats() {
  return apiRequest('/mentor/stats');
}

export async function getStudentAnalytics(studentId) {
  return apiRequest(`/mentor/students/${studentId}/analytics`);
}

export async function getMaterials() {
  return apiRequest('/mentor/materials');
}

export async function addMaterial(materialData) {
  return apiRequest('/mentor/materials', {
    method: 'POST',
    body: JSON.stringify(materialData),
  });
}

export async function removeMaterial(materialId) {
  return apiRequest(`/mentor/materials/${materialId}`, {
    method: 'DELETE',
  });
}

export async function analyzeCsv(csvSnippet) {
  return apiRequest('/mentor/import/analyze', {
    method: 'POST',
    body: JSON.stringify({ csvSnippet }),
  });
}

export async function executeImport(filename, data, mapping) {
  return apiRequest('/mentor/import/execute', {
    method: 'POST',
    body: JSON.stringify({ filename, data, mapping }),
  });
}

// STUDENT ENDPOINTS
export async function getStudentRecord() {
  return apiRequest('/student/me');
}

export async function getStudentMaterials() {
  return apiRequest('/student/materials');
}

export async function getAttendanceStats() {
  return apiRequest('/student/attendance-stats');
}

export async function getUpcomingSession() {
  return apiRequest('/student/upcoming-session');
}

export async function getAttendanceHistory(page = 1, limit = 15, month = null) {
  const params = new URLSearchParams({ page, limit });
  if (month) params.append('month', month);
  return apiRequest(`/student/attendance-history?${params.toString()}`);
}

export async function getAttendanceHeatmap() {
  return apiRequest('/student/heatmap');
}

export async function updateStudentProfile(profileData) {
  return apiRequest('/student/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
}

// NOTIFICATION ENDPOINTS
export async function getNotifications() {
  return apiRequest('/student/notifications');
}

export async function markNotificationRead(id) {
  return apiRequest(`/student/notifications/${id}/read`, { method: 'POST' });
}

export async function markAllNotificationsRead() {
  return apiRequest('/student/notifications/read-all', { method: 'POST' });
}
