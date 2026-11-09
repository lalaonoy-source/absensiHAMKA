import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Stepper } from './components/Stepper';
import { Footer } from './components/Footer';
import { WelcomeView } from './views/WelcomeView';
import { AuthView } from './views/AuthView';
import { AttendanceFormView } from './views/AttendanceFormView';
import { SuccessView } from './views/SuccessView';
import { HistoryView } from './views/HistoryView';
import { PhpDatabaseModal } from './views/PhpDatabaseModal';
import { HelpModal } from './components/HelpModal';
import { LogoSettingsModal } from './components/LogoSettingsModal';
import { StorageService } from './services/storage';
import { StepId, User, AttendanceRecord } from './types';

export default function App() {
  const [currentStep, setCurrentStep] = useState<StepId>('welcome');
  const [currentUser, setCurrentUser] = useState<User | null>(() =>
    StorageService.getCurrentUser()
  );
  const [lastSubmittedRecord, setLastSubmittedRecord] = useState<AttendanceRecord | null>(null);

  // Modals state
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isDatabaseDocsOpen, setIsDatabaseDocsOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isLogoModalOpen, setIsLogoModalOpen] = useState(false);

  // Scroll to top on step transition
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  // Handlers
  const handleStartFromWelcome = () => {
    if (currentUser) {
      setCurrentStep('form');
    } else {
      setCurrentStep('login');
    }
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    setCurrentStep('form');
  };

  const handleAttendanceSubmit = (recordData: Omit<AttendanceRecord, 'id' | 'createdAt'>) => {
    const saved = StorageService.saveAttendanceRecord(recordData);
    setLastSubmittedRecord(saved);
    setCurrentStep('success');
  };

  const handleLogout = () => {
    StorageService.setCurrentUser(null);
    setCurrentUser(null);
    setCurrentStep('welcome');
  };

  const handleStepClick = (step: StepId) => {
    if (step === 'welcome') {
      setCurrentStep('welcome');
    } else if (step === 'login') {
      setCurrentStep('login');
    } else if (step === 'form') {
      if (currentUser) {
        setCurrentStep('form');
      } else {
        setCurrentStep('login');
      }
    } else if (step === 'success' && lastSubmittedRecord) {
      setCurrentStep('success');
    }
  };

  const canNavigateTo = (step: StepId) => {
    if (step === 'welcome') return true;
    if (step === 'login') return true;
    if (step === 'form') return !!currentUser;
    if (step === 'success') return !!lastSubmittedRecord;
    return false;
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc] text-[#0f274a]">
      {/* Top Header */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenHistory={() => setIsHistoryOpen(true)}
        onOpenDatabaseDocs={() => setIsDatabaseDocsOpen(true)}
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenLogoSettings={() => setIsLogoModalOpen(true)}
      />

      {/* 4-Step Stepper Header */}
      <div className="w-full bg-white/70 border-b border-slate-200/60 backdrop-blur-xs">
        <Stepper
          currentStep={currentStep}
          onStepClick={handleStepClick}
          canNavigateTo={canNavigateTo}
        />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col justify-start">
        {currentStep === 'welcome' && (
          <WelcomeView
            onStart={handleStartFromWelcome}
            isLoggedIn={!!currentUser}
            userName={currentUser?.name}
          />
        )}

        {currentStep === 'login' && (
          <AuthView
            onSuccess={handleAuthSuccess}
            onBackToWelcome={() => setCurrentStep('welcome')}
          />
        )}

        {currentStep === 'form' && (
          <AttendanceFormView
            currentUser={
              currentUser || {
                id: 'guest',
                name: 'Ahmad Naufal',
                phone: '081234567890',
                password: '',
                createdAt: '',
              }
            }
            onSubmit={handleAttendanceSubmit}
          />
        )}

        {currentStep === 'success' && lastSubmittedRecord && (
          <SuccessView
            record={lastSubmittedRecord}
            onFinish={() => setCurrentStep('welcome')}
            onOpenHistory={() => setIsHistoryOpen(true)}
            onNewAttendance={() => setCurrentStep('form')}
          />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Riwayat Absensi Modal */}
      <HistoryView
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        onSelectNewAttendance={() => {
          if (currentUser) {
            setCurrentStep('form');
          } else {
            setCurrentStep('login');
          }
        }}
      />

      {/* Database & PHP Code Modal */}
      <PhpDatabaseModal
        isOpen={isDatabaseDocsOpen}
        onClose={() => setIsDatabaseDocsOpen(false)}
      />

      {/* Help Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* Logo Settings Modal */}
      <LogoSettingsModal
        isOpen={isLogoModalOpen}
        onClose={() => setIsLogoModalOpen(false)}
      />
    </div>
  );
}
