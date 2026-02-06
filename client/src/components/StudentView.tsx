import React from 'react';
import type { Student } from '../types';
import { API_BASE_URL } from '../api/studentApi';
import { User, Phone, Calendar, BookOpen, LogOut, GraduationCap, Calculator, Eye, Smartphone } from 'lucide-react';

interface StudentViewProps {
    student: Student;
    onLogout?: () => void;
}

export const StudentView: React.FC<StudentViewProps> = ({ student, onLogout }) => {
    // Debug: Log visit count
    console.log('StudentView - visit_count:', student.visit_count, 'Full student:', student);

    const handlePrint = () => {
        window.print();
    };

    const handleAppPrint = () => {
        // Construct the full URL for the backend endpoint
        let fullApiUrl = API_BASE_URL;
        if (fullApiUrl.startsWith('/')) {
            fullApiUrl = `${window.location.origin}${fullApiUrl}`;
        }

        // If on localhost but accessing via IP (e.g. mobile testing), we need to ensure 
        // the backend URL also uses the IP, not localhost, if possible.
        // However, standard dev setup usually has frontend on 5173 and backend on 5000.
        // If user is on mobile accessing http://192.168.1.5:5173, 'localhost' in API_URL won't work.
        // But let's assume for now they are either in Prod OR they know to configure VITE_API_URL.

        // Fallback for simple dev setup where API_BASE_URL might be localhost
        // If window location is an IP, try to replace localhost in API URL with that IP
        const isIp = /^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(window.location.hostname);
        if (isIp && fullApiUrl.includes('localhost')) {
            fullApiUrl = fullApiUrl.replace('localhost', window.location.hostname);
        }

        const responseUrl = `${fullApiUrl}/students/${student.id}/print`;
        const schemeUrl = `my.bluetoothprint.scheme://${responseUrl}`;

        console.log('Launching Bluetooth Print Scheme:', schemeUrl);
        window.location.href = schemeUrl;
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 animate-fade-in print:min-h-0 print:h-auto print:p-0 print:m-0 print:bg-white">
            {/* Screen View (Hidden on Print) */}
            <div className="print:hidden">
                <div className="max-w-5xl mx-auto space-y-8">
                    {/* Header Card */}
                    <div className="relative overflow-hidden bg-slate-900 rounded-2xl md:rounded-[2rem] shadow-2xl p-6 md:p-12 text-white">
                        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
                        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl"></div>

                        <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
                                <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-blue-500 to-indigo-600 p-1 shadow-xl">
                                    <div className="w-full h-full rounded-[1.4rem] bg-slate-900 flex items-center justify-center">
                                        <User size={40} className="text-blue-400" />
                                    </div>
                                </div>
                                <div>
                                    <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight mb-2">{student.name}</h1>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3">
                                        <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] md:text-xs font-bold uppercase tracking-wider">
                                            Reg: {student.register_number}
                                        </span>
                                        {student.token_number && (
                                            <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] md:text-xs font-bold uppercase tracking-wider">
                                                Token: {student.token_number}
                                            </span>
                                        )}
                                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                                            {student.course_type} Candidate
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handleAppPrint}
                                    className="flex-1 md:flex-none group flex items-center justify-center gap-2 px-4 md:px-6 py-3 rounded-xl md:rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/30 text-emerald-400 hover:text-emerald-300 transition-all duration-300 font-bold text-xs md:text-sm"
                                    title="Open format in Bluetooth Print App"
                                >
                                    <Smartphone size={18} className="group-hover:scale-110 transition-transform" />
                                    App Print
                                </button>
                                <button
                                    onClick={handlePrint}
                                    className="flex-1 md:flex-none group flex items-center justify-center gap-2 px-4 md:px-6 py-3 rounded-xl md:rounded-2xl bg-white/5 hover:bg-blue-500/10 border border-white/10 hover:border-blue-500/20 text-white hover:text-blue-400 transition-all duration-300 font-bold text-xs md:text-sm"
                                >
                                    <Eye size={18} className="group-hover:scale-110 transition-transform" />
                                    Web Print
                                </button>
                                {onLogout && (
                                    <button
                                        onClick={onLogout}
                                        className="flex-1 md:flex-none group flex items-center justify-center gap-2 px-4 md:px-6 py-3 rounded-xl md:rounded-2xl bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 text-white hover:text-red-400 transition-all duration-300 font-bold text-xs md:text-sm"
                                    >
                                        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                                        Logout
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Left Column: Personal Info */}
                        <div className="lg:col-span-1 space-y-8">
                            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 p-8">
                                <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                                        <User size={18} className="text-blue-600" />
                                    </div>
                                    Profile Details
                                </h3>
                                <div className="space-y-6">
                                    {student.dob && (
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                                <Calendar size={20} />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Date of Birth</p>
                                                <p className="text-sm font-bold text-slate-700">{new Date(student.dob).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                                            </div>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                            <Phone size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contact Number</p>
                                            <p className="text-sm font-bold text-slate-700">{student.contact_no}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                            <Eye size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Visit Count</p>
                                            <p className="text-sm font-bold text-slate-700">{student.visit_count || 0}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                                            <Calculator size={20} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Update Count</p>
                                            <p className="text-sm font-bold text-slate-700">{student.update_count || 1}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Academic Details */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* HSC / Diploma Details */}
                            {student.course_type === 'UG' && (
                                <div className="bg-white rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="bg-blue-600 px-8 py-4 text-white flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <BookOpen size={20} />
                                            <h3 className="font-bold uppercase tracking-wider text-sm">{student.qualification} Academic Record</h3>
                                        </div>
                                        {student.board && <div className="text-xs font-black bg-white/20 px-3 py-1 rounded-full">{student.board}</div>}
                                    </div>
                                    <div className="p-8">
                                        {student.qualification === 'HSC' && (student.board === 'Matric' || student.board === 'CBSE') ? (
                                            <div className="space-y-6">
                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Physics</p>
                                                        <p className="text-xl font-black text-slate-700">{student.physics_marks || '-'}</p>
                                                    </div>
                                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Chemistry</p>
                                                        <p className="text-xl font-black text-slate-700">{student.chemistry_marks || '-'}</p>
                                                    </div>
                                                    <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 text-center">
                                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Maths</p>
                                                        <p className="text-xl font-black text-slate-700">{student.maths_marks || '-'}</p>
                                                    </div>
                                                </div>
                                                {student.cutoff && (
                                                    <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 flex items-center justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <Calculator className="text-blue-600" size={24} />
                                                            <div>
                                                                <p className="text-xs font-bold text-blue-400 uppercase tracking-widest">Engineering Cutoff</p>
                                                                <p className="text-sm text-blue-600 font-medium">Calculated based on marks</p>
                                                            </div>
                                                        </div>
                                                        <p className="text-3xl font-black text-blue-600">{student.cutoff.toFixed(2)}</p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex items-center justify-between">
                                                <div>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Overall Percentage</p>
                                                    <p className="text-3xl font-black text-slate-700">{student.percentage}%</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* PG Details */}
                            {student.course_type === 'PG' && (
                                <div className="bg-white rounded-2xl md:rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
                                    <div className="bg-emerald-600 px-8 py-4 text-white flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <GraduationCap size={20} />
                                            <h3 className="font-bold uppercase tracking-wider text-sm">Undergraduate Details</h3>
                                        </div>
                                        <div className="text-xs font-black bg-white/20 px-3 py-1 rounded-full">{student.ug_status}</div>
                                    </div>
                                    <div className="p-8 space-y-6">
                                        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">UG Degree</p>
                                            <p className="text-xl font-black text-slate-700">{student.ug_degree}</p>
                                        </div>

                                        {student.ug_status === 'Completed' && (
                                            <div className="grid grid-cols-2 gap-6">
                                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Percentage</p>
                                                    <p className="text-2xl font-black text-slate-700">{student.percentage ? `${student.percentage}%` : '-'}</p>
                                                </div>
                                                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">CGPA</p>
                                                    <p className="text-2xl font-black text-slate-700">{student.cgpa || '-'}</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Thermal Print View (58mm) - Strictly Enforced */}
            <div className="hidden print:block bg-white text-black font-mono text-[12px] leading-snug w-[58mm] min-w-[58mm] max-w-[58mm] p-2 pb-4 mx-0">
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @page {
                        size: 58mm auto; /* Strictly hint 58mm width */
                        margin: 0mm;
                    }
                    @media print {
                        html, body {
                            width: 58mm !important;
                            min-width: 58mm !important;
                            max-width: 58mm !important;
                            margin: 0 !important;
                            padding: 0 !important;
                            overflow: hidden !important;
                        }
                        /* Hide all other elements to prevent blank pages */
                        body > *:not(.print\:block) {
                            display: none !important;
                        }
                    }
                ` }} />

                <div className="border-b border-dashed border-black pb-3 mb-3 text-center font-bold text-[10px] leading-tight">
                    SONA COLLEGE OF TECHNOLOGY<br />(AUTONOMOUS)
                    {student.token_number && (
                        <div className="mt-1 text-2xl font-black">
                            {student.token_number}
                        </div>
                    )}
                </div>

                <div className="space-y-2">
                    <div className="space-y-1">
                        <div>NAME: {student.name.toUpperCase()}</div>
                        <div className="flex justify-between items-baseline">
                            <span>AGE: {student.age}</span>
                            <span className="text-[10px] font-black">
                                {student.course_type === 'PG'
                                    ? `B.E ${student.ug_degree ? `/ ${student.ug_degree.split(' ').pop()?.toUpperCase()}` : ''}`
                                    : ''
                                }
                            </span>
                        </div>
                    </div>

                    <div className="space-y-1 pt-1 border-t border-slate-100">
                        {student.course_type === 'UG' ? (
                            <>
                                <div>{(student.board || student.qualification)?.toUpperCase()}</div>
                                {student.cutoff && <div>CUTOFF: {student.cutoff.toFixed(2)}</div>}
                                {student.percentage && <div>PERC: {student.percentage}%</div>}
                            </>
                        ) : (
                            <>
                                <div>{student.ug_degree?.toUpperCase()}</div>
                                {student.cgpa && <div>CGPA: {student.cgpa}</div>}
                                {student.percentage && <div>PERC: {student.percentage}%</div>}
                            </>
                        )}
                    </div>

                    <div className="pt-1 border-t border-slate-100">
                        <div>CONTACT: {student.contact_no}</div>
                        <div className="text-[10px] pt-1">DATE: {new Date().toLocaleDateString()}</div>
                    </div>

                    <div className="text-center font-bold pt-2 border-t border-dashed border-black mt-2 space-y-1">
                        <div className="text-[10px]">REG NO: {student.register_number}</div>
                        <div className="text-[11px]">VISIT NO: {typeof student.visit_count === 'number' ? student.visit_count : 0}</div>
                    </div>
                </div>
                {/* Minimal spacing for tear-off */}
                <div className="h-4"></div>
            </div>
        </div>
    );
};
