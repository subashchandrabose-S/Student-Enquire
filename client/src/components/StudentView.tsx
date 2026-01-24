import React from 'react';
import type { Student } from '../types';
import { User, Phone, Calendar, BookOpen, LogOut, GraduationCap, Calculator, Eye } from 'lucide-react';

interface StudentViewProps {
    student: Student;
    onLogout?: () => void;
}

export const StudentView: React.FC<StudentViewProps> = ({ student, onLogout }) => {
    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-[#f8fafc] p-4 md:p-8 animate-fade-in">
            {/* Screen View (Hidden on Print) */}
            <div className="print:hidden">
                <div className="max-w-5xl mx-auto space-y-8">
                    {/* Header Card */}
                    <div className="relative overflow-hidden bg-slate-900 rounded-[2rem] shadow-2xl p-8 md:p-12 text-white">
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
                                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2">{student.name}</h1>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                        <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-bold uppercase tracking-wider">
                                            Reg: {student.register_number}
                                        </span>
                                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                                            {student.course_type} Candidate
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handlePrint}
                                    className="group flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 hover:bg-blue-500/10 border border-white/10 hover:border-blue-500/20 text-white hover:text-blue-400 transition-all duration-300 font-bold text-sm"
                                >
                                    <Eye size={18} className="group-hover:scale-110 transition-transform" />
                                    Print Slip
                                </button>
                                {onLogout && (
                                    <button
                                        onClick={onLogout}
                                        className="group flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 hover:bg-red-500/10 border border-white/10 hover:border-red-500/20 text-white hover:text-red-400 transition-all duration-300 font-bold text-sm"
                                    >
                                        <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
                                        Sign Out
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
                                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
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
                                <div className="bg-white rounded-[2rem] shadow-sm border border-slate-200 overflow-hidden">
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

            {/* Thermal Print View (48mm) */}
            <div className="hidden print:block bg-white text-black font-mono text-[11px] leading-snug w-[48mm] max-w-[48mm] mx-auto p-0 pb-12">
                <style dangerouslySetInnerHTML={{
                    __html: `
                    @page {
                        size: 58mm auto;
                        margin: 0;
                    }
                    @media print {
                        body {
                            margin: 0;
                            padding: 0;
                            width: 58mm;
                        }
                        html, body {
                            height: auto;
                            overflow: visible;
                        }
                    }
                ` }} />

                <div className="border-b border-dashed border-black pb-3 mb-3 text-center font-bold text-[12px] leading-tight">
                    SONA COLLEGE OF TECHNOLOGY<br />(AUTONOMOUS)
                </div>

                <div className="space-y-3">
                    <div className="space-y-1">
                        <div>NAME: {student.name.toUpperCase()}</div>
                        <div>AGE: {student.age}</div>
                        <div>DATE: {new Date().toLocaleDateString()}</div>
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
                    </div>

                    <div className="pt-2 border-t border-dashed border-black text-center font-bold">
                        VISIT: {student.visit_count || 1}
                    </div>

                    <div className="text-[10px] text-center font-bold pt-1">
                        REG NO: {student.register_number}
                    </div>
                </div>
                {/* Extra spacing at the bottom for tearing */}
                <div className="h-12"></div>
            </div>
        </div>
    );
};
