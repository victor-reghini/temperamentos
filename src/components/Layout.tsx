import { type ReactNode, useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getLatestLocalResult, isSupabaseConfigured } from '../lib/storage';
import { encodeResultToBase64 } from '../lib/validation';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const hasScoresHash = location.hash.startsWith('#scores=');
  const isQuizRoute = location.pathname.startsWith('/quiz');
  const isResultRoute =
    location.pathname.startsWith('/results') ||
    location.pathname.startsWith('/r/') ||
    hasScoresHash;
  const isLandingRoute = location.pathname === '/' && !hasScoresHash;

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('temperament_axes_theme');
      return saved === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Fecha o menu mobile ao navegar
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;
    if (theme === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
      root.setAttribute('data-theme', 'light');
      if (body) {
        body.classList.remove('dark');
        body.classList.add('light');
        body.setAttribute('data-theme', 'light');
      }
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
      root.setAttribute('data-theme', 'dark');
      if (body) {
        body.classList.remove('light');
        body.classList.add('dark');
        body.setAttribute('data-theme', 'dark');
      }
    }
    try {
      localStorage.setItem('temperament_axes_theme', theme);
    } catch {
      // Ignora
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleRestartFromHeader = () => {
    window.dispatchEvent(new CustomEvent('temperament:restart-quiz'));
  };

  const latestResult = getLatestLocalResult();
  const supabaseActive = isSupabaseConfigured();
  const isLight = theme === 'light';

  return (
    <div
      data-theme={theme}
      className={`min-h-dvh flex flex-col transition-colors duration-150 bg-[#f3f2ea] text-[#18191b] dark:bg-[#1e1e1e] dark:text-[#d4d4d4] ${
        theme === 'dark' ? 'dark' : 'light'
      }`}
    >
      <header className="sticky top-0 z-30 border-b transition-colors duration-150 border-[#dfddd2] bg-[#f3f2ea]/95 backdrop-blur-sm dark:border-[#2d2d2d] dark:bg-[#1e1e1e]/95">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          {/* Logo apenas com o texto "4T" */}
          <Link
            to="/"
            title="Temperamentos - Voltar para a tela inicial"
            className="inline-flex items-baseline select-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5fa899] dark:focus-visible:outline-[#4a729c] rounded-md py-1"
          >
            <span className="font-extrabold tracking-tight text-2xl leading-none text-[#2d7365] dark:text-[#6a92be]">
              4
            </span>
            <span className="font-normal tracking-tight text-2xl leading-none text-[#18191b] dark:text-[#ffffff]">
              T
            </span>
          </Link>

          {isQuizRoute ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={isLight ? 'Ativar modo escuro' : 'Ativar modo claro'}
                title={isLight ? 'Ativar modo escuro' : 'Ativar modo claro'}
                className="w-10 h-10 rounded-full border flex items-center justify-center transition-colors border-[#d5d3c8] bg-[#faf9f4] hover:bg-[#eae8de] text-[#18191b] dark:border-[#333333] dark:bg-[#252526] dark:hover:bg-[#2e2e2f] dark:text-[#d4d4d4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5fa899] dark:focus-visible:outline-[#4a729c]"
              >
                {isLight ? (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="5" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                  </svg>
                )}
              </button>

              <button
                type="button"
                onClick={handleRestartFromHeader}
                className="min-h-[40px] px-3.5 sm:px-4 py-2 rounded-full bg-[#78c6b5] hover:bg-[#68b8a7] text-[#0e241f] dark:bg-[#3d5f83] dark:hover:bg-[#4a729c] dark:text-[#ffffff] text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2d7365] dark:focus-visible:outline-[#6a92be]"
              >
                <span>Reiniciar quiz</span>
                <span aria-hidden="true">→</span>
              </button>
            </div>
          ) : isResultRoute ? (
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                to="/"
                className="min-h-[38px] px-3.5 py-1.5 rounded-full text-xs font-semibold flex items-center transition-colors bg-[#eae8de] dark:bg-[#252526] hover:bg-[#dfddd2] dark:hover:bg-[#2f2f30] text-[#18191b] dark:text-[#d4d4d4] border border-[#d4d2c7] dark:border-[#333333]"
              >
                Início
              </Link>
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={isLight ? 'Ativar modo escuro' : 'Ativar modo claro'}
                title={isLight ? 'Ativar modo escuro' : 'Ativar modo claro'}
                className="w-10 h-10 rounded-full border flex items-center justify-center transition-colors border-[#d5d3c8] bg-[#faf9f4] hover:bg-[#eae8de] text-[#18191b] dark:border-[#333333] dark:bg-[#252526] dark:hover:bg-[#2e2e2f] dark:text-[#d4d4d4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5fa899] dark:focus-visible:outline-[#4a729c]"
              >
                {isLight ? (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="5" />
                    <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                  </svg>
                )}
              </button>
            </div>
          ) : (
            <>
              {/* Links de navegação para Desktop */}
              <nav
                aria-label="Seções da página inicial"
                className="hidden lg:flex items-center gap-5 text-xs font-medium text-[#4a4c52] dark:text-[#969696]"
              >
                <a
                  href="#o-que-recebe"
                  className="py-1.5 hover:text-[#18191b] dark:hover:text-[#ffffff] transition-colors"
                >
                  O que você recebe
                </a>
                <a
                  href="#exemplo"
                  className="py-1.5 hover:text-[#18191b] dark:hover:text-[#ffffff] transition-colors"
                >
                  Exemplo
                </a>
                <a
                  href="#como-funciona"
                  className="py-1.5 hover:text-[#18191b] dark:hover:text-[#ffffff] transition-colors"
                >
                  Como funciona
                </a>
                <a
                  href="#eixos"
                  className="py-1.5 hover:text-[#18191b] dark:hover:text-[#ffffff] transition-colors"
                >
                  Os 4 Eixos
                </a>
                <a
                  href="#temperamentos"
                  className="py-1.5 hover:text-[#18191b] dark:hover:text-[#ffffff] transition-colors"
                >
                  Temperamentos
                </a>
                <a
                  href="#faq"
                  className="py-1.5 hover:text-[#18191b] dark:hover:text-[#ffffff] transition-colors"
                >
                  FAQ
                </a>
              </nav>

              <div className="flex items-center gap-2">
                {latestResult && (
                  <Link
                    to={`/#scores=${encodeResultToBase64(latestResult)}`}
                    className="hidden sm:inline-flex min-h-[38px] px-3.5 py-1.5 rounded-full text-xs font-semibold items-center transition-colors bg-[#daf0eb] text-[#1b5247] hover:bg-[#c6e8e0] dark:bg-[#253242] dark:text-[#9fc0e5] dark:hover:bg-[#2d3d52] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2d7365] dark:focus-visible:outline-[#4a729c]"
                  >
                    Meu Resultado
                  </Link>
                )}
                {supabaseActive && (
                  <Link
                    to="/compare"
                    className="hidden sm:inline-flex min-h-[38px] px-3 py-1.5 rounded-full text-xs font-medium items-center transition-colors text-[#2c3038] hover:bg-[#e5e3d8] dark:text-[#d4d4d4] dark:hover:bg-[#252526]"
                  >
                    Comparar
                  </Link>
                )}
                <button
                  type="button"
                  onClick={toggleTheme}
                  aria-label={isLight ? 'Ativar modo escuro' : 'Ativar modo claro'}
                  title={isLight ? 'Ativar modo escuro' : 'Ativar modo claro'}
                  className="w-10 h-10 rounded-full border flex items-center justify-center transition-colors border-[#d5d3c8] bg-[#faf9f4] hover:bg-[#eae8de] text-[#18191b] dark:border-[#333333] dark:bg-[#252526] dark:hover:bg-[#2e2e2f] dark:text-[#d4d4d4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5fa899] dark:focus-visible:outline-[#4a729c]"
                >
                  {isLight ? (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="5" />
                      <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
                    </svg>
                  )}
                </button>

                <a
                  href="#modalidades"
                  className="min-h-[40px] px-4 py-2 rounded-full text-xs sm:text-sm font-bold inline-flex items-center gap-1.5 transition-colors bg-[#78c6b5] hover:bg-[#68b8a7] text-[#0e241f] dark:bg-[#3d5f83] dark:hover:bg-[#4a729c] dark:text-[#ffffff] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#2d7365] dark:focus-visible:outline-[#6a92be]"
                >
                  <span>Começar</span>
                </a>

                {/* Botão de Menu para Celular */}
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen((prev) => !prev)}
                  aria-expanded={mobileMenuOpen}
                  aria-label="Abrir menu de navegação"
                  className="lg:hidden w-10 h-10 rounded-full border flex items-center justify-center transition-colors border-[#d5d3c8] bg-[#faf9f4] hover:bg-[#eae8de] text-[#18191b] dark:border-[#333333] dark:bg-[#252526] dark:hover:bg-[#2e2e2f] dark:text-[#d4d4d4] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5fa899] dark:focus-visible:outline-[#4a729c]"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    {mobileMenuOpen ? (
                      <path d="M6 18L18 6M6 6l12 12" />
                    ) : (
                      <path d="M4 6h16M4 12h16M4 18h16" />
                    )}
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Menu gaveta retrátil no mobile */}
        {isLandingRoute && mobileMenuOpen && (
          <nav
            aria-label="Menu móvel da página inicial"
            className="lg:hidden border-t border-[#dfddd2] bg-[#faf9f4] dark:border-[#2d2d2d] dark:bg-[#252526] px-4 py-4 space-y-2 shadow-lg"
          >
            <a
              href="#o-que-recebe"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#18191b] dark:text-[#d4d4d4] hover:bg-[#efeee6] dark:hover:bg-[#1e1e1e]"
            >
              O que você recebe
            </a>
            <a
              href="#exemplo"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#18191b] dark:text-[#d4d4d4] hover:bg-[#efeee6] dark:hover:bg-[#1e1e1e]"
            >
              Exemplo de Resultado
            </a>
            <a
              href="#como-funciona"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#18191b] dark:text-[#d4d4d4] hover:bg-[#efeee6] dark:hover:bg-[#1e1e1e]"
            >
              Como funciona o teste
            </a>
            <a
              href="#eixos"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#18191b] dark:text-[#d4d4d4] hover:bg-[#efeee6] dark:hover:bg-[#1e1e1e]"
            >
              Os 4 Eixos
            </a>
            <a
              href="#temperamentos"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#18191b] dark:text-[#d4d4d4] hover:bg-[#efeee6] dark:hover:bg-[#1e1e1e]"
            >
              Os 4 Temperamentos
            </a>
            <a
              href="#faq"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2.5 rounded-lg text-sm font-medium text-[#18191b] dark:text-[#d4d4d4] hover:bg-[#efeee6] dark:hover:bg-[#1e1e1e]"
            >
              Perguntas Frequentes (FAQ)
            </a>
            {latestResult && (
              <Link
                to={`/#scores=${encodeResultToBase64(latestResult)}`}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2.5 rounded-lg text-sm font-semibold text-[#1b5247] dark:text-[#9fc0e5] bg-[#daf0eb] dark:bg-[#1e2d3d]"
              >
                Abrir Meu Resultado Salvo
              </Link>
            )}
          </nav>
        )}
      </header>

      {/* Conteúdo Principal com padding lateral seguro e largura máxima centralizada */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {children}
      </main>

      {!isQuizRoute && (
        <footer className="border-t mt-12 sm:mt-16 border-[#dfddd2] bg-[#eae8de] dark:border-[#2d2d2d] dark:bg-[#181818]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[#18191b] dark:text-[#e2e0d8]">
                <span className="font-extrabold text-[#2d7365] dark:text-[#6a92be]">4</span>T • Temperamentos
              </p>
              <p className="text-xs text-[#4e5056] dark:text-[#969696]">
                Modelagem psicométrica baseada em H. J. Eysenck (PEN) e Helen Fisher (FTI). Processamento local tolerante a falhas.
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs text-[#5c5e64] dark:text-[#969696]">
              <a
                href="/variacoes/classico.html"
                className="py-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5fa899] dark:focus-visible:outline-[#4a729c] rounded"
              >
                v1 clássico
              </a>
              <span aria-hidden="true">·</span>
              <a
                href="/variacoes/temperamentos_gradiente.html"
                className="py-2 hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#5fa899] dark:focus-visible:outline-[#4a729c] rounded"
              >
                v2 gradiente
              </a>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
