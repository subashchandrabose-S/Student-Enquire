import React, { useEffect, useState } from 'react';
import { studentApi } from '../api/studentApi';
import { Search, Trash2, GraduationCap, Phone, Printer, Database, X, Edit2, Check, Loader2, Eye, Download, FileText, FileSpreadsheet } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { StudentView } from './StudentView';
import type { Student } from '../types';

export const StudentList: React.FC = () => {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [editingStudent, setEditingStudent] = useState<Student | null>(null);
    const [isUpdating, setIsUpdating] = useState(false);
    const [showExportMenu, setShowExportMenu] = useState(false);

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async () => {
        try {
            const result = await studentApi.getStudents();
            setStudents(result.data || []);
        } catch (error) {
            console.error('Failed to load students', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (confirm('Are you sure you want to delete this record?')) {
            await studentApi.deleteStudent(id);
            loadStudents();
        }
    }

    const handleUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingStudent || !editingStudent.id) return;

        setIsUpdating(true);
        try {
            // Recalculate cutoff if marks changed
            let updatedStudent = { ...editingStudent };
            if (updatedStudent.physics_marks && updatedStudent.chemistry_marks && updatedStudent.maths_marks) {
                updatedStudent.cutoff = Number(updatedStudent.maths_marks) + (Number(updatedStudent.physics_marks) + Number(updatedStudent.chemistry_marks)) / 2;
            }

            await studentApi.updateStudent(editingStudent.id, updatedStudent);
            setEditingStudent(null);
            loadStudents();
        } catch (error) {
            console.error('Failed to update student', error);
            alert('Update failed');
        } finally {
            setIsUpdating(false);
        }
    };

    const handleViewStudent = async (student: Student) => {
        if (!student.id) return;
        try {
            const result = await studentApi.getStudent(student.id);
            if (result.success) {
                setSelectedStudent(result.data);
            }
        } catch (error) {
            console.error('Failed to fetch student details', error);
            setSelectedStudent(student);
        }
    };

    const downloadCSV = (type: 'UG' | 'PG') => {
        const data = students.filter(s => s.course_type === type);
        if (data.length === 0) {
            alert(`No ${type} students found to export.`);
            return;
        }

        const headers = [
            'Name', 'Register Number', 'Contact', 'DOB',
            type === 'UG' ? 'Qualification' : 'Degree',
            type === 'UG' ? 'Board' : 'Status',
            type === 'UG' ? 'Cutoff/Percentage' : 'CGPA/Percentage',
            'Token'
        ];

        const csvContent = [
            headers.join(','),
            ...data.map(s => {
                const row = [
                    `"${s.name}"`,
                    `"${s.register_number}"`,
                    `"${s.contact_no}"`,
                    `"${s.dob || ''}"`,
                    type === 'UG' ? `"${s.qualification || ''}"` : `"${s.ug_degree || ''}"`,
                    type === 'UG' ? `"${s.board || ''}"` : `"${s.ug_status || ''}"`,
                    type === 'UG' ? `"${s.cutoff || s.percentage || ''}"` : `"${s.cgpa || s.percentage || ''}"`,
                    `"${s.token_number || ''}"`
                ];
                return row.join(',');
            })
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${type}_Students_List_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
        setShowExportMenu(false);
    };

    const downloadPDF = (type: 'UG' | 'PG') => {
        const data = students.filter(s => s.course_type === type);
        if (data.length === 0) {
            alert(`No ${type} students found to export.`);
            return;
        }

        const doc = new jsPDF();

        doc.setFontSize(18);
        doc.text(`${type} Students Archive`, 14, 15);
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

        const tableColumn = ["Name", "Reg. No", "Contact", type === 'UG' ? "Qual." : "Degree", "Stats", "Token"];
        const tableRows = data.map(s => [
            s.name || '',
            s.register_number || '',
            s.contact_no || '',
            type === 'UG' ? (s.qualification || '-') : (s.ug_degree || '-'),
            type === 'UG' ? (s.cutoff ? `Cutoff: ${s.cutoff.toFixed(2)}` : `${s.percentage || '-'}%`) : (s.cgpa ? `CGPA: ${s.cgpa}` : `${s.percentage || '-'}%`),
            s.token_number || '-'
        ]);

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 25,
            theme: 'grid',
            headStyles: { fillColor: [37, 99, 235] }, // Blue-600
            styles: { fontSize: 8, cellPadding: 3 },
            alternateRowStyles: { fillColor: [248, 250, 252] } // Slate-50
        });

        doc.save(`${type}_Students_List.pdf`);
        setShowExportMenu(false);
    };

    const filteredStudents = students.filter(s =>
        s.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.register_number?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 gap-6 animate-fade-in h-screen">
            <div className="relative">
                <div className="w-16 h-16 border-4 border-blue-500/20 rounded-full"></div>
                <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin absolute top-0"></div>
            </div>
            <p className="text-slate-500 font-black uppercase tracking-[0.2em] text-xs animate-pulse">Synchronizing Records</p>
        </div>
    );

    if (selectedStudent) {
        return (
            <div className="fixed inset-0 z-50 bg-slate-50 overflow-y-auto animate-fade-in print:static print:bg-white print:overflow-visible">
                <div className="p-4">
                    <button
                        onClick={() => {
                            setSelectedStudent(null);
                            loadStudents();
                        }}
                        className="fixed top-4 right-4 z-50 bg-white p-3 rounded-full shadow-lg border border-slate-200 text-slate-500 hover:text-red-500 hover:bg-red-50 transition-all print:hidden"
                    >
                        <X size={24} />
                    </button>
                    <StudentView student={selectedStudent} />
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto p-2 md:p-8 animate-fade-in print:p-0">
            {/* Comprehensive Edit Modal */}
            {editingStudent && (
                <div className="fixed inset-0 z-[60] bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-2 md:p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl md:rounded-[2.5rem] shadow-2xl w-full max-w-2xl my-2 md:my-8 overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-slate-900 p-6 md:p-8 text-white flex justify-between items-center">
                            <div>
                                <h3 className="font-black uppercase tracking-widest text-sm">Edit Enrollment</h3>
                                <p className="text-slate-400 text-[10px] font-bold mt-1 uppercase tracking-widest">ID: {editingStudent.id}</p>
                            </div>
                            <button onClick={() => setEditingStudent(null)} className="bg-white/10 hover:bg-red-500/20 p-2 rounded-full transition-colors"><X size={20} /></button>
                        </div>

                        <form onSubmit={handleUpdate} className="p-4 md:p-8 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
                            {/* Basic Info Section */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                                    <Database size={18} className="text-blue-500" />
                                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Core Information</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Candidate Name</label>
                                        <input
                                            value={editingStudent.name}
                                            onChange={e => setEditingStudent({ ...editingStudent, name: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-700 focus:border-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Register Number</label>
                                        <input
                                            value={editingStudent.register_number}
                                            onChange={e => setEditingStudent({ ...editingStudent, register_number: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-700 focus:border-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Number</label>
                                        <input
                                            value={editingStudent.contact_no}
                                            onChange={e => setEditingStudent({ ...editingStudent, contact_no: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-700 focus:border-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date of Birth</label>
                                        <input
                                            type="date"
                                            value={editingStudent.dob || ''}
                                            onChange={e => setEditingStudent({ ...editingStudent, dob: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-700 focus:border-blue-500 outline-none transition-all"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Academic Section */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
                                    <GraduationCap size={18} className="text-indigo-500" />
                                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest">Academic Details ({editingStudent.course_type})</h4>
                                </div>

                                {editingStudent.course_type === 'UG' ? (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Qualification</label>
                                                <select
                                                    value={editingStudent.qualification}
                                                    onChange={e => setEditingStudent({ ...editingStudent, qualification: e.target.value as any })}
                                                    className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-700 focus:border-blue-500 outline-none transition-all"
                                                >
                                                    <option value="HSC">HSC</option>
                                                    <option value="Diploma">Diploma</option>
                                                </select>
                                            </div>
                                            {editingStudent.qualification === 'HSC' && (
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Board</label>
                                                    <select
                                                        value={editingStudent.board}
                                                        onChange={e => setEditingStudent({ ...editingStudent, board: e.target.value as any })}
                                                        className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-700 focus:border-blue-500 outline-none transition-all"
                                                    >
                                                        <option value="Matric">Matric</option>
                                                        <option value="CBSE">CBSE</option>
                                                        <option value="Other">Other</option>
                                                    </select>
                                                </div>
                                            )}
                                        </div>

                                        <div className="space-y-4">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={editingStudent.result_declared}
                                                    onChange={e => setEditingStudent({ ...editingStudent, result_declared: e.target.checked })}
                                                    className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm font-bold text-slate-700">Results Declared?</span>
                                            </label>
                                        </div>

                                        {editingStudent.result_declared && editingStudent.qualification === 'HSC' && (editingStudent.board === 'Matric' || editingStudent.board === 'CBSE') ? (
                                            <div className="bg-blue-50/50 p-4 md:p-6 rounded-2xl border border-blue-100/50 grid grid-cols-3 gap-4">
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Physics</label>
                                                    <input type="number" value={editingStudent.physics_marks || ''} onChange={e => setEditingStudent({ ...editingStudent, physics_marks: Number(e.target.value) })} className="w-full bg-white border border-blue-100 rounded-lg px-2 md:px-3 py-2 font-bold text-slate-700" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Chemistry</label>
                                                    <input type="number" value={editingStudent.chemistry_marks || ''} onChange={e => setEditingStudent({ ...editingStudent, chemistry_marks: Number(e.target.value) })} className="w-full bg-white border border-blue-100 rounded-lg px-2 md:px-3 py-2 font-bold text-slate-700" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Maths</label>
                                                    <input type="number" value={editingStudent.maths_marks || ''} onChange={e => setEditingStudent({ ...editingStudent, maths_marks: Number(e.target.value) })} className="w-full bg-white border border-blue-100 rounded-lg px-2 md:px-3 py-2 font-bold text-slate-700" />
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Percentage</label>
                                                <input type="number" step="0.01" value={editingStudent.percentage || ''} onChange={e => setEditingStudent({ ...editingStudent, percentage: Number(e.target.value) })} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-700" />
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">UG Degree</label>
                                                <input value={editingStudent.ug_degree || ''} onChange={e => setEditingStudent({ ...editingStudent, ug_degree: e.target.value })} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-700" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">UG Status</label>
                                                <select value={editingStudent.ug_status} onChange={e => setEditingStudent({ ...editingStudent, ug_status: e.target.value as any })} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-700">
                                                    <option value="Completed">Completed</option>
                                                    <option value="Pursuing">Pursuing</option>
                                                </select>
                                            </div>
                                        </div>
                                        {editingStudent.ug_status === 'Completed' && (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Percentage</label>
                                                    <input type="number" step="0.01" value={editingStudent.percentage || ''} onChange={e => setEditingStudent({ ...editingStudent, percentage: Number(e.target.value) })} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-700" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CGPA</label>
                                                    <input type="number" step="0.01" value={editingStudent.cgpa || ''} onChange={e => setEditingStudent({ ...editingStudent, cgpa: Number(e.target.value) })} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-700" />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={isUpdating}
                                className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black uppercase tracking-[0.2em] text-xs py-5 rounded-2xl transition-all duration-300 flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 hover:shadow-blue-200 active:scale-[0.98]"
                            >
                                {isUpdating ? <Loader2 className="animate-spin" size={20} /> : <><Check size={20} /> Update Enrollment</>}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Header Section */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 md:mb-12 gap-6 md:gap-8 print:hidden">
                <div className="w-full">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-600/20">
                            <Database size={20} />
                        </div>
                        <span className="text-xs font-black text-blue-600 uppercase tracking-[0.2em]">Student Portal</span>
                    </div>
                    <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 mb-2">Student Directory</h2>
                    <p className="text-slate-500 font-medium text-sm md:text-base">Comprehensive database of all academic enrollments</p>
                </div>

                <div className="flex flex-wrap gap-3 w-full lg:w-auto relative">
                    <div className="relative">
                        <button
                            onClick={() => setShowExportMenu(!showExportMenu)}
                            className="bg-slate-900 hover:bg-slate-800 text-white pl-5 pr-6 py-4 rounded-2xl md:rounded-[1.5rem] font-bold text-sm shadow-xl shadow-slate-200 transition-all flex items-center gap-3 active:scale-95"
                        >
                            <Download size={18} />
                            <span>Export Data</span>
                        </button>

                        {showExportMenu && (
                            <div className="absolute top-full right-0 mt-2 w-64 bg-white rounded-2xl shadow-2xl border border-slate-100 p-2 z-50 animate-in zoom-in-95 duration-200 origin-top-right">
                                <div className="p-2">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2">UG Records</div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button onClick={() => downloadCSV('UG')} className="flex items-center justify-center gap-2 p-3 rounded-xl hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 transition-colors border border-slate-100 hover:border-emerald-200">
                                            <FileSpreadsheet size={16} />
                                            <span className="text-xs font-bold">CSV</span>
                                        </button>
                                        <button onClick={() => downloadPDF('UG')} className="flex items-center justify-center gap-2 p-3 rounded-xl hover:bg-red-50 text-slate-600 hover:text-red-500 transition-colors border border-slate-100 hover:border-red-200">
                                            <FileText size={16} />
                                            <span className="text-xs font-bold">PDF</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="h-px bg-slate-100 my-1"></div>
                                <div className="p-2">
                                    <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 mb-2">PG Records</div>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button onClick={() => downloadCSV('PG')} className="flex items-center justify-center gap-2 p-3 rounded-xl hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 transition-colors border border-slate-100 hover:border-emerald-200">
                                            <FileSpreadsheet size={16} />
                                            <span className="text-xs font-bold">CSV</span>
                                        </button>
                                        <button onClick={() => downloadPDF('PG')} className="flex items-center justify-center gap-2 p-3 rounded-xl hover:bg-red-50 text-slate-600 hover:text-red-500 transition-colors border border-slate-100 hover:border-red-200">
                                            <FileText size={16} />
                                            <span className="text-xs font-bold">PDF</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <input
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search records..."
                            className="bg-white border border-slate-200 text-slate-700 pl-12 pr-6 py-4 rounded-2xl md:rounded-[1.5rem] outline-none focus:ring-4 focus:ring-blue-500/5 focus:border-blue-500 transition-all w-full font-bold text-sm shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Content Display: Card view for mobile, Table for desktop */}
            <div className="block md:hidden space-y-4">
                {filteredStudents.map((s) => (
                    <div key={s.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-900 flex items-center justify-center text-white font-black text-lg">
                                {s.name?.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-black text-slate-800 text-base truncate">{s.name}</h3>
                                <div className="text-[10px] font-black text-blue-600 uppercase tracking-widest">{s.register_number}</div>
                            </div>
                        </div>

                        <div className="flex justify-between items-end border-t border-slate-50 pt-4">
                            <div className="space-y-1">
                                <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase">
                                    <GraduationCap size={14} className="text-blue-500" /> {s.course_type}
                                </div>
                                <div className="text-[10px] font-bold text-slate-400 truncate max-w-[150px]">
                                    {s.qualification || s.ug_degree || 'General'}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => handleViewStudent(s)}
                                    className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center"
                                >
                                    <Eye size={18} />
                                </button>
                                <button
                                    onClick={() => setEditingStudent(s)}
                                    className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"
                                >
                                    <Edit2 size={18} />
                                </button>
                                <button
                                    onClick={() => s.id && handleDelete(s.id)}
                                    className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200/50 border border-slate-100 print:shadow-none print:border-none">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Student Profile</th>
                                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Academic Path</th>
                                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Stats</th>
                                <th className="p-8 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] text-right print:hidden">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filteredStudents.map((s) => (
                                <tr key={s.id} className="group hover:bg-blue-50/30 transition-all duration-300">
                                    <td className="p-8">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-slate-800 to-slate-900 flex items-center justify-center text-white font-black text-xl shadow-lg group-hover:scale-110 transition-transform duration-500">
                                                {s.name?.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-black text-slate-800 text-lg leading-tight mb-1">{s.name}</div>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">{s.register_number}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                                        <Phone size={10} /> {s.contact_no}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <GraduationCap size={16} className="text-blue-500" />
                                                <span className="font-black text-slate-700 text-sm uppercase tracking-tight">{s.course_type}</span>
                                            </div>
                                            {s.qualification && (
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.qualification} {s.board ? `- ${s.board}` : ''}</div>
                                            )}
                                            {s.course_type === 'PG' && s.ug_degree && (
                                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{s.ug_degree}</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest">
                                                <Eye size={12} /> Visits: {s.visit_count || 0}
                                            </div>
                                            <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                Updates: {s.update_count || 1}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8 print:hidden">
                                        <div className="flex justify-end gap-3 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 md:translate-x-4 md:group-hover:translate-x-0">
                                            <button
                                                onClick={() => handleViewStudent(s)}
                                                className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center shadow-lg shadow-blue-500/10"
                                                title="View & Print"
                                            >
                                                <Printer size={18} />
                                            </button>
                                            <button
                                                onClick={() => setEditingStudent(s)}
                                                className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center shadow-lg shadow-emerald-500/10"
                                                title="Edit"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => s.id && handleDelete(s.id)}
                                                className="w-10 h-10 rounded-xl bg-red-50 text-red-500 hover:bg-red-500 hover:text-white transition-all flex items-center justify-center shadow-lg shadow-red-500/10"
                                                title="Delete"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
