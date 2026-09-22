import { Navigate, Route, Routes } from 'react-router-dom'

import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import ResetPassword from './pages/auth/ResetPassword'

import {
  DetailPage,
  PublicHome,
  SearchPage,
  WorkspacePage,
} from './pages/shared/PageTemplates'

import './pages/shared/Pages.css'

/* =========================================================
   PÁGINAS DO CANDIDATO
========================================================= */

const candidatePages = [
  'dashboard',
  'opportunities',
  'applications',
  'application-details',
  'favorites',
  'notifications',
  'profile',
  'edit-profile',
  'resume',
  'skills',
  'experience',
  'education',
  'portfolio',
  'preferences',
  'settings',
  'apply',
  'application-success',
  'reviews',
  'recommended',
  'career',
  'achievements',
  'activity',
]

/* =========================================================
   PÁGINAS DO CONTRATANTE
========================================================= */

const contractorPages = [
  'dashboard',
  'opportunities',
  'create-opportunity',
  'edit-opportunity',
  'opportunity-details',
  'candidates',
  'candidate-details',
  'applications',
  'application-details',
  'business',
  'edit-business',
  'reviews',
  'reports',
  'notifications',
  'profile',
  'settings',
]

/* =========================================================
   PÁGINAS DO ADMINISTRADOR
========================================================= */

const adminPages = [
  'dashboard',
  'users',
  'user-details',
  'opportunities',
  'opportunity-details',
  'contractors',
  'candidates',
  'categories',
  'reports',
  'reviews',
  'notifications',
  'moderation',
  'statistics',
  'settings',
]

/* =========================================================
   PÁGINAS PÚBLICAS
========================================================= */

const publicPages = [
  'opportunities',
  'opportunity-details',
  'contractors',
  'contractor-details',
  'categories',
  'about',
  'how-it-works',
  'faq',
  'contact',
  'map',
  'nearby-opportunities',
  'location-search',
]

/* =========================================================
   APP
========================================================= */

export default function App() {
  return (
    <Routes>

      {/* =====================================================
          HOME
      ===================================================== */}

      <Route
        path="/"
        element={<PublicHome />}
      />


      {/* =====================================================
          AUTENTICAÇÃO
      ===================================================== */}

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/cadastro"
        element={<Register />}
      />

      <Route
        path="/esqueci-senha"
        element={<ForgotPassword />}
      />

      <Route
        path="/redefinir-senha"
        element={<ResetPassword />}
      />


      {/* =====================================================
          BUSCA
      ===================================================== */}

      <Route
        path="/search"
        element={<SearchPage />}
      />

      <Route
        path="/search/:kind"
        element={<SearchPage />}
      />


      {/* =====================================================
          PÁGINAS PÚBLICAS
      ===================================================== */}

      {publicPages.map((page) => (
        <Route
          key={`public-${page}`}
          path={`/${page}`}
          element={<DetailPage page={page} />}
        />
      ))}


      {/* =====================================================
          DETALHES DE NOTIFICAÇÃO
      ===================================================== */}

      <Route
        path="/notifications/:id"
        element={
          <DetailPage page="notification-details" />
        }
      />


      {/* =====================================================
          ENTRADAS DAS ÁREAS
      ===================================================== */}

      <Route
        path="/candidato"
        element={
          <Navigate
            to="/candidato/dashboard"
            replace
          />
        }
      />

      <Route
        path="/contratante"
        element={
          <Navigate
            to="/contratante/dashboard"
            replace
          />
        }
      />

      <Route
        path="/admin"
        element={
          <Navigate
            to="/admin/dashboard"
            replace
          />
        }
      />


      {/* =====================================================
          ÁREA DO CANDIDATO
      ===================================================== */}

      {candidatePages.map((page) => (
        <Route
          key={`candidate-${page}`}
          path={`/candidato/${page}`}
          element={
            <WorkspacePage
              role="candidate"
              page={page}
            />
          }
        />
      ))}


      {/* =====================================================
          ÁREA DO CONTRATANTE
      ===================================================== */}

      {contractorPages.map((page) => (
        <Route
          key={`contractor-${page}`}
          path={`/contratante/${page}`}
          element={
            <WorkspacePage
              role="contractor"
              page={page}
            />
          }
        />
      ))}


      {/* =====================================================
          ÁREA DO ADMINISTRADOR
      ===================================================== */}

      {adminPages.map((page) => (
        <Route
          key={`admin-${page}`}
          path={`/admin/${page}`}
          element={
            <WorkspacePage
              role="admin"
              page={page}
            />
          }
        />
      ))}


      {/* =====================================================
          ROTA NÃO ENCONTRADA
      ===================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/"
            replace
          />
        }
      />

    </Routes>
  )
}