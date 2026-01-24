import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { studentApi } from '../api/studentApi';
import { Loader2, GraduationCap, CheckCircle2, AlertCircle, Calculator, User, Phone, ShieldCheck, BookOpen, Award } from 'lucide-react';

// Zod Schema based on complex requirements
const studentSchema = z.object({
    name: z.string().min(2, 'Name is required'),
    course_type: z.enum(['UG', 'PG']),
    register_number: z.string().min(1, 'Register Number is required'),
    contact_no: z.string().regex(/^\+?[\d\s-]{10,}$/, 'Invalid contact number'),
    age: z.string().min(1, 'Age is required'),

    // UG - HSC/Diploma
    qualification: z.enum(['HSC', 'Diploma']).nullable().optional().or(z.literal('')),

    // HSC Details
    board: z.enum(['Matric', 'CBSE', 'Other']).nullable().optional().or(z.literal('')),
    dob: z.string().optional(),
    result_declared: z.boolean().optional(),
    physics_marks: z.string().optional(), // Using string for input, converting later
    chemistry_marks: z.string().optional(),
    maths_marks: z.string().optional(),
    cutoff: z.number().optional(),

    // Other State / Diploma / PG
    percentage: z.any().optional(),
    cgpa: z.any().optional(),
    ug_degree: z.string().optional(),
    ug_status: z.enum(['Completed', 'Pursuing']).nullable().optional().or(z.literal('')),
}).superRefine((data, ctx) => {
    // UG Validation
    if (data.course_type === 'UG') {
        if (!data.qualification) {
            ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Qualification is required", path: ["qualification"] });
            return;
        }

        if (data.qualification === 'HSC') {
            if (!data.board) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Board is required", path: ["board"] });
                return;
            }

            if (data.board === 'Matric' || data.board === 'CBSE') {
                if (data.result_declared) {
                    if (!data.physics_marks) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Physics marks required", path: ["physics_marks"] });
                    if (!data.chemistry_marks) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Chemistry marks required", path: ["chemistry_marks"] });
                    if (!data.maths_marks) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Maths marks required", path: ["maths_marks"] });
                }
            } else if (data.board === 'Other') {
                if (!data.percentage || data.percentage === '') ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Percentage is required", path: ["percentage"] });
            }
        } else if (data.qualification === 'Diploma') {
            if (data.result_declared && (!data.percentage || data.percentage === '')) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Percentage is required", path: ["percentage"] });
            }
        }
    }
    // PG Validation
    else if (data.course_type === 'PG') {
        if (!data.ug_degree) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "UG Degree is required", path: ["ug_degree"] });
        if (!data.ug_status) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "UG Status is required", path: ["ug_status"] });

        if (data.ug_status === 'Completed') {
            const hasPercentage = data.percentage && data.percentage !== '';
            const hasCgpa = data.cgpa && data.cgpa !== '';
            if (!hasPercentage && !hasCgpa) {
                ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Percentage or CGPA is required", path: ["percentage"] });
            }
        }
    }
});

type FormValues = z.infer<typeof studentSchema>;

interface StudentFormProps {
    onGoToList: () => void;
}

export const StudentForm: React.FC<StudentFormProps> = ({ onGoToList }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [calculatedCutoff, setCalculatedCutoff] = useState<number | null>(null);

    const { register, handleSubmit, watch, setValue, formState: { errors }, reset } = useForm<FormValues>({
        resolver: zodResolver(studentSchema),
        shouldUnregister: false,
        defaultValues: {
            course_type: 'UG',
            result_declared: false,
        }
    });

    const courseType = watch('course_type');
    const qualification = watch('qualification');
    const board = watch('board');
    const resultDeclared = watch('result_declared');
    const ugStatus = watch('ug_status');

    // Calculate Cutoff
    const physics = watch('physics_marks');
    const chemistry = watch('chemistry_marks');
    const maths = watch('maths_marks');

    useEffect(() => {
        if (physics && chemistry && maths) {
            const p = Number(physics);
            const c = Number(chemistry);
            const m = Number(maths);
            if (!isNaN(p) && !isNaN(c) && !isNaN(m)) {
                const cutoff = m + (p + c) / 2;
                setCalculatedCutoff(cutoff);
                setValue('cutoff', cutoff);
            }
        } else {
            setCalculatedCutoff(null);
        }
    }, [physics, chemistry, maths, setValue]);

    const onError = (errors: any) => {
        const firstError = Object.values(errors)[0] as any;
        if (firstError) {
            setError(firstError.message || 'Please check the form for errors');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);
        setError(null);
        try {
            // Clean up data based on course type
            const baseData = {
                name: data.name,
                age: Number(data.age),
                course_type: data.course_type,
                register_number: data.register_number,
                contact_no: data.contact_no,
                update_count: 1,
            };

            let submissionData: any = { ...baseData };

            if (data.course_type === 'UG') {
                submissionData.qualification = data.qualification;
                if (data.qualification === 'HSC') {
                    submissionData.board = data.board;
                    if (data.board === 'Matric' || data.board === 'CBSE') {
                        submissionData.dob = data.dob;
                        submissionData.result_declared = data.result_declared;
                        if (data.result_declared) {
                            submissionData.physics_marks = Number(data.physics_marks);
                            submissionData.chemistry_marks = Number(data.chemistry_marks);
                            submissionData.maths_marks = Number(data.maths_marks);
                            submissionData.cutoff = data.cutoff;
                        }
                    } else {
                        submissionData.percentage = Number(data.percentage);
                    }
                } else {
                    submissionData.result_declared = data.result_declared;
                    if (data.result_declared) {
                        submissionData.percentage = Number(data.percentage);
                    }
                }
            } else {
                submissionData.ug_degree = data.ug_degree;
                submissionData.ug_status = data.ug_status;
                if (data.ug_status === 'Completed') {
                    if (data.percentage && data.percentage !== '') submissionData.percentage = Number(data.percentage);
                    if (data.cgpa && data.cgpa !== '') submissionData.cgpa = Number(data.cgpa);
                }
            }

            await studentApi.createStudent({ student: submissionData as any });
            setShowModal(true);
            reset();
            setCalculatedCutoff(null);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Failed to register student.');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-3xl mx-auto animate-fade-in">
            {/* Success Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-[2rem] md:rounded-[3rem] shadow-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-300 border border-slate-100">
                        <div className="bg-slate-900 p-10 text-center text-white relative overflow-hidden">
                            <div className="absolute top-0 right-0 -mt-10 -mr-10 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl"></div>
                            <div className="bg-emerald-500 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-emerald-500/20 rotate-6">
                                <CheckCircle2 size={44} className="-rotate-6" />
                            </div>
                            <h3 className="text-3xl font-black tracking-tight">Application Submitted!</h3>
                            <p className="text-slate-400 text-sm mt-2 font-medium">The student record has been securely saved to the SONA database.</p>
                        </div>
                        <div className="p-10 space-y-4">
                            <button
                                onClick={() => { setShowModal(false); onGoToList(); }}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-blue-200"
                            >
                                View Student List
                            </button>
                            <button
                                onClick={() => { setShowModal(false); }}
                                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold py-4 rounded-2xl transition-all duration-300"
                            >
                                Register Another
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-2xl md:rounded-[3rem] shadow-2xl shadow-slate-200/50 overflow-hidden border border-slate-100">
                {/* Header */}
                <div className="bg-slate-900 px-8 py-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 -mt-20 -mr-20 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl"></div>
                    <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl"></div>
                    <div className="relative flex items-center gap-6">
                        <div className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-xl rotate-3">
                            <GraduationCap size={32} className="-rotate-3" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-black tracking-tight">Student Enrollment</h2>
                            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest mt-1">Admission Portal</p>
                        </div>
                    </div>
                </div>

                <div className="p-4 md:p-10">
                    {error && (
                        <div className="mb-10 p-5 bg-red-50 border border-red-100 text-red-600 rounded-[1.5rem] flex items-center gap-4">
                            <AlertCircle size={24} />
                            <p className="font-bold">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-8">

                        {/* 1. Basic Info */}
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center"><User size={18} className="text-blue-600" /></div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Candidate Details</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Candidate Name</label>
                                    <input {...register('name')} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-700 focus:border-blue-500 outline-none" placeholder="Enter full name" />
                                    {errors.name && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.name.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Age</label>
                                    <input type="number" {...register('age')} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-700 focus:border-blue-500 outline-none" placeholder="Age" />
                                    {errors.age && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.age.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Date of Birth</label>
                                    <input type="date" {...register('dob')} className="w-full bg-slate-50 border border-slate-100 rounded-xl px-4 py-3 font-bold text-slate-700 focus:border-blue-500 outline-none" />
                                    {errors.dob && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.dob.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Program Selection</label>
                                    <div className="flex gap-4">
                                        {['UG', 'PG'].map((type) => (
                                            <label key={type} className={`flex-1 cursor-pointer p-3 rounded-xl border-2 text-center transition-all ${courseType === type ? 'bg-slate-900 border-slate-900 text-white' : 'bg-white border-slate-100 text-slate-400'}`}>
                                                <input type="radio" {...register('course_type')} value={type} className="hidden" />
                                                <span className="text-xs font-black uppercase tracking-widest">{type}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 2. UG Flow */}
                        {courseType === 'UG' && (
                            <div className="space-y-6 animate-in slide-in-from-bottom-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center"><BookOpen size={18} className="text-indigo-600" /></div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Qualification</h3>
                                </div>

                                <div className="flex gap-4">
                                    {['HSC', 'Diploma'].map((q) => (
                                        <label key={q} className={`flex-1 cursor-pointer p-4 rounded-xl border-2 text-center transition-all ${qualification === q ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' : 'bg-white border-slate-100 text-slate-400'}`}>
                                            <input type="radio" {...register('qualification')} value={q} className="hidden" />
                                            <span className="text-sm font-black uppercase tracking-widest">{q}</span>
                                        </label>
                                    ))}
                                </div>
                                {errors.qualification && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.qualification.message}</p>}

                                {/* HSC Details */}
                                {qualification === 'HSC' && (
                                    <div className="bg-slate-50 p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-slate-100 space-y-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Board of Education</label>
                                            <div className="flex flex-wrap gap-3">
                                                {['Matric', 'CBSE', 'Other'].map((b) => (
                                                    <label key={b} className={`cursor-pointer px-6 py-3 rounded-xl border-2 text-center transition-all ${board === b ? 'bg-white border-blue-500 text-blue-600 shadow-md' : 'bg-white border-slate-100 text-slate-400'}`}>
                                                        <input type="radio" {...register('board')} value={b} className="hidden" />
                                                        <span className="text-xs font-black uppercase tracking-widest">{b}</span>
                                                    </label>
                                                ))}
                                            </div>
                                            {errors.board && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.board.message}</p>}
                                        </div>

                                        {(board === 'Matric' || board === 'CBSE') && (
                                            <div className="space-y-6 animate-in fade-in">
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">HSC Register Number</label>
                                                        <input {...register('register_number')} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-blue-500" placeholder="Enter Register No" />
                                                        {errors.register_number && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.register_number.message}</p>}
                                                    </div>
                                                </div>

                                                <div className="space-y-4">
                                                    <label className="flex items-center gap-3 cursor-pointer">
                                                        <input type="checkbox" {...register('result_declared')} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                                        <span className="text-sm font-bold text-slate-700">HSC Results Declared?</span>
                                                    </label>

                                                    {resultDeclared && (
                                                        <div className="bg-blue-50 p-6 rounded-2xl space-y-4 animate-in slide-in-from-top-2">
                                                            <h4 className="text-xs font-black text-blue-900 uppercase tracking-widest flex items-center gap-2">
                                                                <Calculator size={14} /> Subject Marks
                                                            </h4>
                                                            <div className="grid grid-cols-3 gap-4">
                                                                <div className="space-y-2">
                                                                    <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Physics</label>
                                                                    <input type="number" {...register('physics_marks')} className="w-full bg-white border border-blue-100 rounded-xl px-3 py-2 font-bold text-slate-700 outline-none focus:border-blue-500" placeholder="0" />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Chemistry</label>
                                                                    <input type="number" {...register('chemistry_marks')} className="w-full bg-white border border-blue-100 rounded-xl px-3 py-2 font-bold text-slate-700 outline-none focus:border-blue-500" placeholder="0" />
                                                                </div>
                                                                <div className="space-y-2">
                                                                    <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Maths</label>
                                                                    <input type="number" {...register('maths_marks')} className="w-full bg-white border border-blue-100 rounded-xl px-3 py-2 font-bold text-slate-700 outline-none focus:border-blue-500" placeholder="0" />
                                                                </div>
                                                            </div>
                                                            {calculatedCutoff !== null && (
                                                                <div className="bg-blue-600 text-white p-4 rounded-xl flex justify-between items-center">
                                                                    <span className="text-xs font-bold uppercase tracking-widest">Calculated Cutoff</span>
                                                                    <span className="text-xl font-black">{calculatedCutoff.toFixed(2)}</span>
                                                                </div>
                                                            )}
                                                            {(errors.physics_marks || errors.chemistry_marks || errors.maths_marks) && <p className="text-red-500 text-[10px] font-bold">All marks are required</p>}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        )}

                                        {board === 'Other' && (
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">HSC Register Number</label>
                                                    <input {...register('register_number')} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-blue-500" placeholder="Enter Register No" />
                                                    {errors.register_number && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.register_number.message}</p>}
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Percentage</label>
                                                    <input type="number" step="0.01" {...register('percentage')} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-blue-500" placeholder="%" />
                                                    {errors.percentage && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.percentage.message?.toString()}</p>}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Diploma Details */}
                                {qualification === 'Diploma' && (
                                    <div className="bg-slate-50 p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-slate-100 space-y-6 animate-in fade-in">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Diploma Register Number</label>
                                            <input {...register('register_number')} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-blue-500" placeholder="Enter Register No" />
                                            {errors.register_number && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.register_number.message}</p>}
                                        </div>

                                        <div className="space-y-4">
                                            <label className="flex items-center gap-3 cursor-pointer">
                                                <input type="checkbox" {...register('result_declared')} className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                                                <span className="text-sm font-bold text-slate-700">Final Exam Results Declared?</span>
                                            </label>

                                            {resultDeclared && (
                                                <div className="space-y-2 animate-in slide-in-from-top-2">
                                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Percentage</label>
                                                    <input type="number" step="0.01" {...register('percentage')} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-blue-500" placeholder="%" />
                                                    {errors.percentage && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.percentage.message?.toString()}</p>}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 3. PG Flow */}
                        {courseType === 'PG' && (
                            <div className="space-y-6 animate-in slide-in-from-bottom-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center"><Award size={18} className="text-emerald-600" /></div>
                                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">UG Details</h3>
                                </div>

                                <div className="bg-slate-50 p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-slate-100 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">UG Degree</label>
                                            <input {...register('ug_degree')} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-blue-500" placeholder="e.g. B.E. CSE" />
                                            {errors.ug_degree && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.ug_degree.message}</p>}
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">UG Register Number</label>
                                            <input {...register('register_number')} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-blue-500" placeholder="Enter Register No" />
                                            {errors.register_number && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.register_number.message}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            {['Completed', 'Pursuing'].map((s) => (
                                                <label key={s} className={`flex-1 cursor-pointer p-3 rounded-xl border-2 text-center transition-all ${ugStatus === s ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200' : 'bg-white border-slate-100 text-slate-400'}`}>
                                                    <input type="radio" {...register('ug_status')} value={s} className="hidden" />
                                                    <span className="text-xs font-black uppercase tracking-widest">{s}</span>
                                                </label>
                                            ))}
                                        </div>
                                        {errors.ug_status && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.ug_status.message}</p>}
                                    </div>

                                    {ugStatus === 'Completed' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Percentage (upto current sem)</label>
                                                <input type="number" step="0.01" {...register('percentage')} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-blue-500" placeholder="%" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">CGPA (upto current sem)</label>
                                                <input type="number" step="0.01" {...register('cgpa')} className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3 font-bold text-slate-700 outline-none focus:border-blue-500" placeholder="10.0" />
                                            </div>
                                            {(errors.percentage || errors.cgpa) && <p className="text-red-500 text-[10px] font-bold ml-1 col-span-2">Either Percentage or CGPA is required</p>}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* 4. Contact Info (Always Visible) */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Contact Number</label>
                            <div className="relative">
                                <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input {...register('contact_no')} className="w-full bg-slate-50 border border-slate-100 rounded-xl pl-12 pr-4 py-3 font-bold text-slate-700 outline-none focus:border-blue-500" placeholder="Enter contact number" />
                            </div>
                            {errors.contact_no && <p className="text-red-500 text-[10px] font-bold ml-1">{errors.contact_no.message}</p>}
                        </div>

                        <button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 hover:bg-blue-600 text-white font-black uppercase tracking-[0.2em] text-xs py-5 rounded-xl transition-all duration-300 flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 hover:shadow-blue-200 active:scale-[0.98]">
                            {isSubmitting ? <Loader2 className="animate-spin w-5 h-5" /> : (
                                <>
                                    <span>Submit Application</span>
                                    <ShieldCheck size={18} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};
