import { StudentForm } from './components/StudentForm';

export default function PublicApp() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center p-4 md:p-12 overflow-y-auto">
      <div className="w-full max-w-6xl animate-fade-in">
        <StudentForm showListButton={false} />
      </div>
    </div>
  );
}
