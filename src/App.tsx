import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/auth/Login'
import Register from './pages/Register'
import ForgotPassword from './pages/auth/ForgotPassword'
import { AuthReset, DetailPage, PublicHome, SearchPage, WorkspacePage } from './pages/shared/PageTemplates'
import './pages/shared/Pages.css'
import ResetPassword from './pages/auth/ResetPassword'

const candidatePages = ['dashboard','opportunities','applications','application-details','favorites','notifications','profile','edit-profile','resume','skills','experience','education','portfolio','preferences','settings','apply','application-success','reviews','recommended','career','achievements','activity']
const contractorPages = ['dashboard','opportunities','create-opportunity','edit-opportunity','opportunity-details','candidates','candidate-details','applications','application-details','business','edit-business','reviews','reports','notifications','profile','settings']
const adminPages = ['dashboard','users','user-details','opportunities','opportunity-details','contractors','candidates','categories','reports','reviews','notifications','moderation','statistics','settings']
const publicPages = ['opportunities','opportunity-details','contractors','contractor-details','categories','about','how-it-works','faq','contact','map','nearby-opportunities','location-search']

export default function App() {
  return <Routes>
    <Route path="/" element={<PublicHome />} />
    <Route path="/login" element={<Login />} />
    <Route path="/cadastro" element={<Register />} />
    <Route path="/esqueci-senha" element={<ForgotPassword />} />
    <Route path="/redefinir-senha" element={<AuthReset />} />
    <Route path="/search" element={<SearchPage />} /><Route path="/search/:kind" element={<SearchPage />} />
    {publicPages.map(page => <Route key={page} path={`/${page}`} element={<DetailPage page={page} />} />)}
    <Route path="/notifications/:id" element={<WorkspacePage role="candidate" page="notification-details" />} />
    <Route path="/candidato" element={<Navigate to="/candidato/dashboard" replace />} /><Route path="/contratante" element={<Navigate to="/contratante/dashboard" replace />} /><Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />
    {candidatePages.map(page => <Route key={`c${page}`} path={`/candidato/${page}`} element={<WorkspacePage role="candidate" page={page} />} />)}
    {contractorPages.map(page => <Route key={`t${page}`} path={`/contratante/${page}`} element={<WorkspacePage role="contractor" page={page} />} />)}
    {adminPages.map(page => <Route key={`a${page}`} path={`/admin/${page}`} element={<WorkspacePage role="admin" page={page} />} />)}
    <Route path="*" element={<Navigate to="/" replace />} />
    <Route
  path="/redefinir-senha"
  element={<ResetPassword />}
/>
  </Routes>
}
