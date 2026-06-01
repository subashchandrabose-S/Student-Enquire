import { StudentForm } from './components/StudentForm';
import { Footer } from './components/Footer';

export default function PublicApp() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col overflow-y-auto">
      <div className="flex-1 flex items-start justify-center p-4 md:p-12">
        <div className="w-full max-w-6xl animate-fade-in">
          <StudentForm showListButton={false} />
        </div>
      </div>
      <Footer />
    </div>
  );
}

