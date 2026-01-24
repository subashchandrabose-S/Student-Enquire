import axios from 'axios';
import type { StudentSubmission } from '../types';
import { MOCK_STUDENTS } from './mockData';

// Use environment variable or fallback to production URL if deployed, otherwise localhost
const getApiUrl = () => {
    if (import.meta.env.VITE_API_URL) return import.meta.env.VITE_API_URL;

    // Fallback logic for production if env var is missing
    if (window.location.hostname !== 'localhost') {
        // Automatically use the current origin if deployed on the same platform
        // or a specific production backend if you have one
        return '/api';
    }

    return 'http://localhost:5000/api';
};

const API_BASE_URL = getApiUrl();

// Simple in-memory store for the session fallback
const localStudents = [...MOCK_STUDENTS];

export const studentApi = {
    createStudent: async (data: StudentSubmission) => {
        const response = await axios.post(`${API_BASE_URL}/students`, data);
        return response.data;
    },
    getStudents: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/students`);
            return response.data;
        } catch (error) {
            console.error('Backend error fetching students:', error);
            console.warn('Backend unavailable, using mock data');
            return { success: true, data: localStudents };
        }
    },
    getStudent: async (id: string) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/students/${id}`);
            return response.data;
        } catch (error) {
            console.error('Backend error fetching student:', error);
            console.warn('Backend unavailable, using mock data');
            const student = localStudents.find(s => s.id === id);
            return { success: true, data: student };
        }
    },
    deleteStudent: async (id: string) => {
        const response = await axios.delete(`${API_BASE_URL}/students/${id}`);
        return response.data;
    },
    updateStudent: async (id: string, data: any) => {
        const response = await axios.put(`${API_BASE_URL}/students/${id}`, data);
        return response.data;
    },
    checkConnection: async () => {
        try {
            await axios.get(`${API_BASE_URL}/students`);
            return { connected: true, url: API_BASE_URL };
        } catch (error: any) {
            return { connected: false, url: API_BASE_URL, error: error.message };
        }
    }
};
