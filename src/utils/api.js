const API_URL = process.env.REACT_APP_API_URL || 'https://online-backend-b1qx.onrender.com';

// Helper to format API error details
const formatApiErrorDetail = (detail) => {
  if (detail == null) return 'Something went wrong. Please try again.';
  if (typeof detail === 'string') return detail;
  if (Array.isArray(detail))
    return detail
      .map((e) => (e && typeof e.msg === 'string' ? e.msg : JSON.stringify(e)))
      .filter(Boolean)
      .join(' ');
  if (detail && typeof detail.msg === 'string') return detail.msg;
  if (detail && typeof detail.error === 'string') return detail.error;
  return String(detail);
};

// Simple memory cache
const cache = {};
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// API helper function
const apiCall = async (endpoint, options = {}) => {
  const isGet = !options.method || options.method === 'GET';
  const cacheKey = endpoint;

  if (isGet && options.useCache && cache[cacheKey]) {
    const { data, timestamp } = cache[cacheKey];
    if (Date.now() - timestamp < CACHE_TTL) {
      return data;
    }
  }

  const url = `${API_URL}${endpoint}`;
  const config = {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);

    // Check if response is JSON
    const contentType = response.headers.get('content-type');
    let data;
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      const text = await response.text();
      data = { error: text || response.statusText };
    }

    if (!response.ok) {
      if (response.status === 401 && options.silent401) {
        return null;
      }
      throw new Error(formatApiErrorDetail(data.error || data.detail || `Server Error ${response.status}`));
    }

    if (isGet && options.useCache) {
      cache[cacheKey] = { data, timestamp: Date.now() };
    }

    return data;
  } catch (error) {
    if (error.name === 'SyntaxError') {
      throw new Error('Server returned an invalid response format.');
    }
    throw error;
  }
};

export const api = {
  // User Dashboard APIs
  dashboard: {
    getData: () => apiCall('/api/users/dashboard', { useCache: false }),
  },

  // Leaderboard APIs
  leaderboard: {
    get: () => apiCall('/api/leaderboard'),
  },

  // Auth APIs
  auth: {
    register:    (data) => apiCall('/api/auth/register', { method: 'POST', body: JSON.stringify(data) }),
    login:       (data) => apiCall('/api/auth/login',    { method: 'POST', body: JSON.stringify(data) }),
    logout:      ()     => apiCall('/api/auth/logout',   { method: 'POST' }),
    getMe:       ()     => apiCall('/api/auth/me',       { silent401: true }),
    adminExists: ()     => apiCall('/api/auth/admin-exists'),
    setupAdmin:  (data) => apiCall('/api/auth/setup-admin', { method: 'POST', body: JSON.stringify(data) }),
  },

  // Course APIs
  courses: {
    getAll: () => apiCall('/api/courses', { useCache: true }),
    getById: (id, enrolled = false) => apiCall(`/api/courses/${id}?enrolled=${enrolled}`),
    getContent: (id) => apiCall(`/api/courses/${id}/content`),
    updateProgress: (id, data) => apiCall(`/api/courses/${id}/progress`, { method: 'POST', body: JSON.stringify(data) }),
    getQuestions: (courseId, testId) => apiCall(`/api/courses/${courseId}/test/${testId}/questions`),
    submitTest: (courseId, testId, answers) => apiCall(`/api/courses/${courseId}/test/${testId}`, { method: 'POST', body: JSON.stringify({ answers }) }),
  },

  // Enrollment APIs
  enrollments: {
    getMy: () => apiCall('/api/enrollments/my-enrollments'),
    getByCourse: (courseId) => apiCall(`/api/enrollments/${courseId}`),
    enroll: (data) => apiCall('/api/enrollments/enroll', { method: 'POST', body: JSON.stringify(data) }),
    enrollLoggedIn: (data) => apiCall('/api/enrollments/enroll-loggedin', { method: 'POST', body: JSON.stringify(data) }),
  },

  // Exam APIs
  exams: {
    getForCourse: (courseId) => apiCall(`/api/exams/course/${courseId}`),
    getAvailable: () => apiCall('/api/exams/available'),
    getMyExams: () => apiCall('/api/exams/my-exams'),
    book: (examId) => apiCall(`/api/exams/${examId}/book`, { method: 'POST' }),
    getEligibility: (courseId) => apiCall(`/api/exams/eligibility/${courseId}`),
  },

  // Doubt Session APIs
  doubtSessions: {
    getByCourse: (courseId) => apiCall(`/api/doubt-sessions/course/${courseId}`),
    join: (sessionId) => apiCall(`/api/doubt-sessions/${sessionId}/join`, { method: 'POST' }),
    getMy: () => apiCall('/api/doubt-sessions/my-sessions'),
  },

  // Admin APIs
  admin: {
    getStats: () => apiCall('/api/admin/stats'),
    getAdmins: () => apiCall('/api/admin/admins'),
    createAdmin: (data) => apiCall('/api/admin/create-admin', { method: 'POST', body: JSON.stringify(data) }),
    updateAdmin: (id, data) => apiCall(`/api/admin/admins/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteAdmin: (id) => apiCall(`/api/admin/admins/${id}`, { method: 'DELETE' }),
    createStudent: (data) => apiCall('/api/admin/create-student', { method: 'POST', body: JSON.stringify(data) }),
    enrollStudent: (data) => apiCall('/api/admin/enroll-student', { method: 'POST', body: JSON.stringify(data) }),
    // Courses
    getCourses: () => apiCall('/api/admin/courses'),
    createCourse: (data) => apiCall('/api/admin/courses', { method: 'POST', body: JSON.stringify(data) }),
    updateCourse: (id, data) => apiCall(`/api/admin/courses/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteCourse: (id) => apiCall(`/api/admin/courses/${id}`, { method: 'DELETE' }),
    // Students
    getStudents: () => apiCall('/api/admin/students'),
    getStudent: (id) => apiCall(`/api/admin/students/${id}`),
    deleteStudent: (id) => apiCall(`/api/admin/students/${id}`, { method: 'DELETE' }),
    // Enrollments (replaces Payments)
    getEnrollments: () => apiCall('/api/admin/enrollments'),
    approveEnrollment: (id) => apiCall(`/api/admin/enrollments/${id}/pay`, { method: 'PUT' }),
    updatePaymentStatus: (id, paymentStatus) => apiCall(`/api/admin/enrollments/${id}/payment-status`, { method: 'PUT', body: JSON.stringify({ paymentStatus }) }),
    toggleOverride: (id, adminOverride) => apiCall(`/api/admin/enrollments/${id}/override`, { method: 'PUT', body: JSON.stringify({ adminOverride }) }),
    rejectEnrollment: (id) => apiCall(`/api/admin/enrollments/${id}`, { method: 'DELETE' }),
    // Exams
    createExam: (data) => apiCall('/api/admin/exams', { method: 'POST', body: JSON.stringify(data) }),
    getExams: () => apiCall('/api/admin/exams'),
    updateExam: (examId, data) => apiCall(`/api/admin/exams/${examId}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteExam: (examId) => apiCall(`/api/admin/exams/${examId}`, { method: 'DELETE' }),
    updateExamStudent: (examId, studentId, data) => apiCall(`/api/admin/exams/${examId}/student/${studentId}`, { method: 'PUT', body: JSON.stringify(data) }),
    // Doubt Sessions
    createDoubtSession: (data) => apiCall('/api/admin/doubt-sessions', { method: 'POST', body: JSON.stringify(data) }),
    getDoubtSessions: () => apiCall('/api/admin/doubt-sessions'),
    updateDoubtSession: (id, data) => apiCall(`/api/admin/doubt-sessions/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
    deleteDoubtSession: (id) => apiCall(`/api/admin/doubt-sessions/${id}`, { method: 'DELETE' }),
    // Reminders
    getReminderCandidates: () => apiCall('/api/admin/reminders/candidates'),
  },
};

export default api;
