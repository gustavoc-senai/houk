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
import {
  CreateOpportunityPage,
  OpportunityDetailsPage,
  ApplyPage,
  ApplicationSuccessPage,
  ApplicationDetailsPage,
} from './pages/shared/OpportunityFlows'
import {
  CareerEditor,
  ProfileEditor,
  ResumeUploader,
  SkillsEditor,
  PreferencesEditor,
} from './pages/shared/CandidateTools'
import {
  BusinessEditor,
  OpportunityEditor,
} from './pages/shared/ContractorTools'
import {
  CategoriesManager,
  ModerationPage,
} from './pages/shared/AdminTools'
import {
  CandidateDetailsPage,
  ReviewsPage,
} from './pages/shared/PeopleTools'

import './pages/shared/Pages.css'

/* =========================================================
   PÁGINAS DO CANDIDATO
========================================================= */

const candidatePages = [
  'dashboard',
  'opportunities',
  'applications',
  'favorites',
  'notifications',
  'profile',
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
  'candidates',
  'applications',
  'business',
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
  'contractors',
  'candidates',
  'reports',
  'notifications',
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

      <Route
        path="/candidato/opportunity-details"
        element={<WorkspacePage role="candidate" page="opportunity-details"><OpportunityDetailsPage role="candidate" /></WorkspacePage>}
      />

      <Route
        path="/candidato/apply"
        element={<WorkspacePage role="candidate" page="apply"><ApplyPage /></WorkspacePage>}
      />

      <Route
        path="/candidato/application-success"
        element={<WorkspacePage role="candidate" page="application-success"><ApplicationSuccessPage /></WorkspacePage>}
      />

      <Route
        path="/candidato/application-details"
        element={<WorkspacePage role="candidate" page="application-details"><ApplicationDetailsPage role="candidate" /></WorkspacePage>}
      />

      <Route path="/candidato/edit-profile" element={<WorkspacePage role="candidate" page="edit-profile"><ProfileEditor /></WorkspacePage>} />
      <Route path="/candidato/resume" element={<WorkspacePage role="candidate" page="resume"><ResumeUploader /></WorkspacePage>} />
      <Route path="/candidato/skills" element={<WorkspacePage role="candidate" page="skills"><SkillsEditor /></WorkspacePage>} />
      <Route path="/candidato/experience" element={<WorkspacePage role="candidate" page="experience"><CareerEditor page="experience" /></WorkspacePage>} />
      <Route path="/candidato/education" element={<WorkspacePage role="candidate" page="education"><CareerEditor page="education" /></WorkspacePage>} />
      <Route path="/candidato/portfolio" element={<WorkspacePage role="candidate" page="portfolio"><CareerEditor page="portfolio" /></WorkspacePage>} />
      <Route path="/candidato/reviews" element={<WorkspacePage role="candidate" page="reviews"><ReviewsPage role="candidate" /></WorkspacePage>} />
      <Route path="/candidato/preferences" element={<WorkspacePage role="candidate" page="preferences"><PreferencesEditor /></WorkspacePage>} />
      <Route path="/candidato/settings" element={<WorkspacePage role="candidate" page="settings"><PreferencesEditor /></WorkspacePage>} />


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

      <Route
        path="/contratante/create-opportunity"
        element={<WorkspacePage role="contractor" page="create-opportunity"><CreateOpportunityPage role="contractor" /></WorkspacePage>}
      />

      <Route
        path="/contratante/opportunity-details"
        element={<WorkspacePage role="contractor" page="opportunity-details"><OpportunityDetailsPage role="contractor" /></WorkspacePage>}
      />

      <Route
        path="/contratante/application-details"
        element={<WorkspacePage role="contractor" page="application-details"><ApplicationDetailsPage role="contractor" /></WorkspacePage>}
      />

      <Route path="/contratante/edit-opportunity" element={<WorkspacePage role="contractor" page="edit-opportunity"><OpportunityEditor /></WorkspacePage>} />
      <Route path="/contratante/edit-business" element={<WorkspacePage role="contractor" page="edit-business"><BusinessEditor /></WorkspacePage>} />
      <Route path="/contratante/edit-profile" element={<WorkspacePage role="contractor" page="edit-profile"><ProfileEditor /></WorkspacePage>} />
      <Route path="/contratante/candidate-details" element={<WorkspacePage role="contractor" page="candidate-details"><CandidateDetailsPage /></WorkspacePage>} />
      <Route path="/contratante/reviews" element={<WorkspacePage role="contractor" page="reviews"><ReviewsPage role="contractor" /></WorkspacePage>} />


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

      <Route
        path="/admin/create-opportunity"
        element={<WorkspacePage role="admin" page="create-opportunity"><CreateOpportunityPage role="admin" /></WorkspacePage>}
      />

      <Route
        path="/admin/opportunity-details"
        element={<WorkspacePage role="admin" page="opportunity-details"><OpportunityDetailsPage role="admin" /></WorkspacePage>}
      />

      <Route path="/admin/moderation" element={<WorkspacePage role="admin" page="moderation"><ModerationPage /></WorkspacePage>} />
      <Route path="/admin/reviews" element={<WorkspacePage role="admin" page="reviews"><ReviewsPage role="admin" /></WorkspacePage>} />
      <Route path="/admin/categories" element={<WorkspacePage role="admin" page="categories"><CategoriesManager /></WorkspacePage>} />


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
