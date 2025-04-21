// utils/api.js
import axios from 'axios';

const API = axios.create({
  baseURL: 'https://school-management-backend-uciz.onrender.com/api',
});

export const setAuthToken = (token) => {
  if (token) {
    API.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common['Authorization'];
  }
};

// Auth
export const login = (data) => API.post('/auth/login', data);
export const register = (data) => API.post('/auth/register', data);
export const deleteUser = (id) => API.delete(`/auth/${id}`);

// Students
export const getStudents = () => API.get('/students');
export const getMyStudentProfile = () => API.get('/students/me');
export const createStudent = (data) => API.post('/students', data);
export const updateStudent = (id, data) => API.put(`/students/${id}`, data);
export const deleteStudent = (id) => API.delete(`/students/${id}`);

// Teachers
export const getTeachers = () => API.get('/teachers');
export const getMyTeacherProfile = () => API.get('/teachers/me');
export const createTeacher = (data) => API.post('/teachers', data);
export const updateTeacher = (id, data) => API.put(`/teachers/${id}`, data);
export const deleteTeacher = (id) => API.delete(`/teachers/${id}`);
export const getTeacherStudents = () => API.get('/teachers/students');

// Assignments
export const getAssignments = () => API.get('/assignments');
export const uploadAssignment = (formData) => API.post('/assignments', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const updateAssignment = (id, data) => API.put(`/assignments/${id}`, data);
export const deleteAssignment = (id) => API.delete(`/assignments/${id}`);

// Lectures
export const getLectures = () => API.get('/lectures');
export const uploadLecture = (formData) => API.post('/lectures', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const deleteLecture = (id) => API.delete(`/lectures/${id}`);

// Marksheets
export const getMarksheets = () => API.get('/marksheets');
export const getMyStudentMarksheet = () => API.get('/marksheets/my');
export const uploadMarksheet = (formData) => API.post('/marksheets', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const deleteMarksheet = (id) => API.delete(`/marksheets/${id}`);

// Timetable
export const getTimetable = () => API.get('/timetable');
export const getMyTimetable = () => API.get('/timetable/my');
export const uploadTimetable = (formData) => API.post('/timetable', formData, {
  headers: { 'Content-Type': 'multipart/form-data' },
});
export const deleteTimetable = (id) => API.delete(`/timetable/${id}`);

export default API;
