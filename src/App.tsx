import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { Layout } from './components/Layout';
import { isSupabaseConfigured } from './lib/storage';
import { ComparePage } from './pages/ComparePage';
import { HomePage } from './pages/HomePage';
import { QuizPage } from './pages/QuizPage';
import { ResultsPage } from './pages/ResultsPage';

function RootRouteSwitch() {
  const location = useLocation();
  // Se o link possuir uma hash de resultado (#scores=...), exibe o resultado automaticamente
  if (location.hash.startsWith('#scores=')) {
    return <ResultsPage />;
  }
  return <HomePage />;
}

export function App() {
  const supabaseActive = isSupabaseConfigured();

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<RootRouteSwitch />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/results" element={<ResultsPage />} />
          <Route path="/r/:id" element={<ResultsPage />} />
          <Route
            path="/compare"
            element={supabaseActive ? <ComparePage /> : <Navigate to="/" replace />}
          />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
