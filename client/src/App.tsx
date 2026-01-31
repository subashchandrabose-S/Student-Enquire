import { useState, useEffect } from 'react';
import { StudentForm } from './components/StudentForm';
import { StudentList } from './components/StudentList';
import { Sidebar } from './components/Sidebar';
import { Login } from './components/Login';

type ActiveTab = 'form' | 'list';

function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('form');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check if already logged in (from localStorage)
  useEffect(() => {
    const savedAuth = localStorage.getItem('auth');
    if (savedAuth) {
      const auth = JSON.parse(savedAuth);
      if (auth.userType === 'admin') {
        setIsAuthenticated(true);
      }
    }
  }, []);

  const handleLogin = async (username: string, password: string) => {
    const adminUser = import.meta.env.VITE_ADMIN_USERNAME;
    const adminPass = import.meta.env.VITE_ADMIN_PASSWORD;

    if (username === adminUser && password === adminPass) {
      setIsAuthenticated(true);
      localStorage.setItem('auth', JSON.stringify({ userType: 'admin' }));
    } else {
      alert('Invalid admin credentials');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setActiveTab('form');
    localStorage.removeItem('auth');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <Login onLogin={handleLogin} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col md:flex-row font-sans print:bg-white">
      <div className="print:hidden">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onLogout={handleLogout}
          isAuthenticated={isAuthenticated}
          userType="admin"
        />
      </div>

      <main className="flex-1 ml-0 md:ml-64 p-4 md:p-12 overflow-y-auto min-h-screen flex items-start justify-center print:ml-0 print:p-0 print:h-auto print:block pb-24 md:pb-12">
        {activeTab === 'form' ? (
          <div className="w-full max-w-6xl print:hidden animate-fade-in">
            <StudentForm onGoToList={() => setActiveTab('list')} />
          </div>
        ) : (
          <StudentList />
        )}
      </main>
    </div>
  );
}

export default App;
