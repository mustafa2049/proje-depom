import { lazy, Suspense, useEffect } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ToastProvider } from './components/Toast';
import { Icon } from './components/ui';
import Dashboard from './pages/Dashboard';
import Learn from './pages/Learn';
import { dayKey } from './lib/leitner';
import { cancelReminders, remindersSupported, scheduleReminders } from './lib/reminders';
import { AppStoreProvider, useStore } from './store/AppStore';
import { dailyPlan, streak } from './store/selectors';

const StudySession = lazy(() => import('./pages/StudySession'));
const SessionSummary = lazy(() => import('./pages/SessionSummary'));
const Conversation = lazy(() => import('./pages/practice/Conversation'));
const AiCloze = lazy(() => import('./pages/practice/AiCloze'));
const Practice = lazy(() => import('./pages/Practice'));
const Library = lazy(() => import('./pages/Library'));
const AddWord = lazy(() => import('./pages/AddWord'));
const WordDetail = lazy(() => import('./pages/WordDetail'));
const Profile = lazy(() => import('./pages/Profile'));
const Quiz = lazy(() => import('./pages/practice/Quiz'));
const Confusables = lazy(() => import('./pages/practice/Confusables'));
const HandsFree = lazy(() => import('./pages/practice/HandsFree'));
const Pronunciation = lazy(() => import('./pages/practice/Pronunciation'));
const FilmScenes = lazy(() => import('./pages/practice/FilmScenes'));
const StoryReader = lazy(() => import('./pages/practice/StoryReader'));
const Journal = lazy(() => import('./pages/practice/Journal'));
const WordFamily = lazy(() => import('./pages/practice/WordFamily'));
const Collocations = lazy(() => import('./pages/practice/Collocations'));
const Register = lazy(() => import('./pages/practice/Register'));
const VisualScene = lazy(() => import('./pages/practice/VisualScene'));
const LeechClinic = lazy(() => import('./pages/practice/LeechClinic'));

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/** Hatırlatma bildirimlerini güncel seri ve kart sayısıyla senkron tutar (yalnızca Android). */
function ReminderSync() {
  const { state } = useStore();
  const { enabled, hour, minute } = state.profile.reminder;
  const studiedToday = (state.history[dayKey()]?.reviews ?? 0) > 0;
  const s = streak(state);
  const due = dailyPlan(state).dueIds.length;
  useEffect(() => {
    if (!remindersSupported()) return;
    const run = enabled ? scheduleReminders({ hour, minute, studiedToday, streak: s, dueCount: due }) : cancelReminders();
    run.catch(() => {
      // Bildirim servisi kullanılamıyorsa uygulama normal çalışmaya devam eder.
    });
  }, [enabled, hour, minute, studiedToday, s, due]);
  return null;
}

function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center text-primary">
      <Icon name="progress_activity" size={32} className="animate-spin" />
    </div>
  );
}

export default function App() {
  return (
    <AppStoreProvider>
      <ToastProvider>
        <ReminderSync />
        <HashRouter>
          <ScrollToTop />
          <Suspense fallback={<Loading />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/ogren" element={<Learn />} />
              <Route path="/ogren/oturum" element={<StudySession />} />
              <Route path="/ogren/ozet" element={<SessionSummary />} />
              <Route path="/pratik" element={<Practice />} />
              <Route path="/pratik/quiz" element={<Quiz />} />
              <Route path="/pratik/sohbet" element={<Conversation />} />
              <Route path="/pratik/ai-bosluk" element={<AiCloze />} />
              <Route path="/pratik/karistirilan" element={<Confusables />} />
              <Route path="/pratik/sesli" element={<HandsFree />} />
              <Route path="/pratik/telaffuz" element={<Pronunciation />} />
              <Route path="/pratik/replikler" element={<FilmScenes />} />
              <Route path="/pratik/hikaye" element={<StoryReader />} />
              <Route path="/pratik/yazma" element={<Journal />} />
              <Route path="/pratik/kok-haritasi" element={<WordFamily />} />
              <Route path="/pratik/kolokasyon" element={<Collocations />} />
              <Route path="/pratik/resmiyet" element={<Register />} />
              <Route path="/pratik/gorsel-sahne" element={<VisualScene />} />
              <Route path="/pratik/klinik" element={<LeechClinic />} />
              <Route path="/kutuphane" element={<Library />} />
              <Route path="/kutuphane/ekle" element={<AddWord />} />
              <Route path="/kelime/:id" element={<WordDetail />} />
              <Route path="/profil" element={<Profile />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </HashRouter>
      </ToastProvider>
    </AppStoreProvider>
  );
}
