export interface Student {
    id?: string;
    name: string;
    age: number;
    course_type: 'UG' | 'PG';

    // UG - HSC/Diploma
    qualification?: 'HSC' | 'Diploma';

    // HSC Details
    board?: 'Matric' | 'CBSE' | 'Other';
    hsc_register_number?: string;
    dob?: string;
    result_declared?: boolean;
    physics_marks?: number;
    chemistry_marks?: number;
    maths_marks?: number;
    cutoff?: number;

    // Diploma Details
    diploma_register_number?: string;

    // PG Details
    ug_degree?: string;
    ug_register_number?: string;
    ug_status?: 'Completed' | 'Pursuing';

    // Common
    register_number: string; // Stores HSC, Diploma, or UG Register No based on selection
    percentage?: number; // For Other State, Diploma, PG Completed
    cgpa?: number; // Alternative for PG
    contact_no: string;
    update_count?: number;
    visit_count?: number;

    created_at?: string;
}

export interface StudentSubmission {
    student: Student;
}

export interface AuthResponse {
    success: boolean;
    message?: string;
    data?: any;
}

