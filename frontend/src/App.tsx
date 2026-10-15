import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Sidebar } from './components/layout/Sidebar';
import { LandingPage } from './pages/LandingPage';
import { DashboardPage } from './pages/DashboardPage';
import { WorkoutSelectionPage } from './pages/WorkoutSelectionPage';
import { LiveWorkoutPage } from './pages/LiveWorkoutPage';
import { WorkoutSummaryPage } from './pages/WorkoutSummaryPage';
import { ProgressPage } from './pages/ProgressPage';
import { ExerciseLibraryPage } from './pages/ExerciseLibraryPage';
import { ProfilePage } from './pages/ProfilePage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { Workout } from './types';

const MainApp: React.FC = () => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [selectedExercise, setSelectedExercise] = useState<string>('squat');
  const [completedWorkout, setCompletedWorkout] = useState<Partial<Workout> | null>(null);

  const handleSelectExercise = (slug: string) => {
    setSelectedExercise(slug);
  };

  const handleFinishWorkout = (workoutData: Partial<Workout>) => {
    setCompletedWorkout(workoutData);
    setCurrentTab('summary');
  };

  // Fullscreen pages without sidebar
  const isFullscreen = currentTab === 'landing' || currentTab === 'live' || currentTab === 'login' || currentTab === 'register';

  // Guard protected routes against unauthenticated visitors
  React.useEffect(() => {
    const protectedTabs = ['dashboard', 'train', 'live', 'summary', 'exercises', 'progress', 'profile', 'settings'];
    if (!user && protectedTabs.includes(currentTab)) {
      setCurrentTab('login');
    }
  }, [user, currentTab]);

  // Dynamic Browser Tab Title & Scroll Reset
  React.useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

    const titleMap: Record<string, string> = {
      landing: 'FORMIQ — Precision AI Biomechanics & Fitness Platform',
      dashboard: 'FORMIQ — Command Center Dashboard',
      train: 'FORMIQ — Train & Movement Selection',
      live: 'FORMIQ — Live Optical Workout',
      summary: 'FORMIQ — Workout Performance Summary',
      exercises: 'FORMIQ — Exercise Biomechanics Library',
      progress: 'FORMIQ — Analytics & Kinematic Progress',
      profile: 'FORMIQ — Athlete Profile',
      settings: 'FORMIQ — Optical Calibration & Settings',
      login: 'FORMIQ — Athlete Sign In',
      register: 'FORMIQ — Create Athlete Account',
    };

    document.title = titleMap[currentTab] || 'FORMIQ — Precision AI Biomechanics';
  }, [currentTab]);

  return (
    <div className="min-h-screen bg-[#090909] text-[#F5F5F5] flex">
      {/* Sidebar for App Command Center */}
      {!isFullscreen && (
        <Sidebar currentTab={currentTab} setCurrentTab={setCurrentTab} />
      )}

      {/* Main Content Area */}
      <main className={`flex-1 min-h-screen ${!isFullscreen ? 'lg:pl-64' : ''}`}>
        {currentTab === 'landing' && (
          <LandingPage
            onNavigate={setCurrentTab}
            onSelectExercise={handleSelectExercise}
          />
        )}

        {currentTab === 'dashboard' && (
          <DashboardPage
            onNavigate={setCurrentTab}
            onSelectExercise={handleSelectExercise}
          />
        )}

        {currentTab === 'train' && (
          <WorkoutSelectionPage
            onSelectExercise={handleSelectExercise}
            onNavigate={setCurrentTab}
          />
        )}

        {currentTab === 'live' && (
          <LiveWorkoutPage
            exerciseSlug={selectedExercise}
            onFinishWorkout={handleFinishWorkout}
            onCancel={() => setCurrentTab('train')}
          />
        )}

        {currentTab === 'summary' && (
          <WorkoutSummaryPage
            workout={completedWorkout}
            onNavigate={setCurrentTab}
            onSelectExercise={handleSelectExercise}
          />
        )}

        {currentTab === 'exercises' && (
          <ExerciseLibraryPage
            onSelectExercise={handleSelectExercise}
            onNavigate={setCurrentTab}
          />
        )}

        {currentTab === 'progress' && <ProgressPage />}

        {currentTab === 'profile' && <ProfilePage />}

        {currentTab === 'settings' && <SettingsPage />}

        {currentTab === 'login' && <LoginPage onNavigate={setCurrentTab} />}

        {currentTab === 'register' && <RegisterPage onNavigate={setCurrentTab} />}
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
