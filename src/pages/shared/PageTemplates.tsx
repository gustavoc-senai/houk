import { useEffect, useState, type ReactNode } from 'react'
import {
  Link,
  useLocation,
  useParams,
} from 'react-router-dom'
import {
  ArrowRight,
  Bell,
  BriefcaseBusiness,
  Building2,
  CheckCircle2,
  ChevronRight,
  CircleUserRound,
  ClipboardList,
  GraduationCap,
  LayoutDashboard,
  MapPin,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  TrendingUp,
  Users,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import './Pages.css'


/* =========================================================
   TIPOS
   ========================================================= */

type Role = 'candidate' | 'contractor' | 'admin'

type Props = {
  role: Role
  page: string
}

type Profile = {
  id: string
  full_name: string
  email: string
  role: string
  city: string | null
  headline?: string | null
  created_at: string
}

type Opportunity = {
  id: string
  title: string
  status: string
  city: string | null
  state: string | null
  created_at: string
}

type Application = {
  id: string
  status: string
  created_at: string
}

type Category = {
  id: string
  name: string
  description: string | null
  active: boolean
}

type Review = {
  id: string
  rating: number
  comment: string | null
  visible: boolean
}


/* =========================================================
   LABELS
   ========================================================= */

const labels: Record<string, string> = {
  dashboard: 'Dashboard',
  users: 'Usuários',
  opportunities: 'Oportunidades',
  categories: 'Categorias',
  moderation: 'Moderação',
  reports: 'Relatórios',
  contractors: 'Contratantes',
  candidates: 'Candidatos',
  reviews: 'Avaliações',
  statistics: 'Estatísticas',
  notifications: 'Notificações',
  settings: 'Configurações',
  applications: 'Candidaturas',
  favorites: 'Favoritos',
  profile: 'Meu perfil',
  recommended: 'Recomendadas',
  resume: 'Currículo',
  skills: 'Competências',
  experience: 'Experiência',
  education: 'Formação',
  portfolio: 'Portfólio',
  achievements: 'Conquistas',
  activity: 'Atividade',
  preferences: 'Preferências',
  'create-opportunity': 'Publicar oportunidade',
  'edit-opportunity': 'Editar oportunidade',
  'opportunity-details': 'Detalhes da oportunidade',
  'candidate-details': 'Detalhes do candidato',
  'application-details': 'Detalhes da candidatura',
  business: 'Minha empresa',
  'edit-business': 'Editar empresa',
  career: 'Carreira',
  apply: 'Candidatar-se',
  'application-success': 'Candidatura enviada',
}

const roleLabel: Record<Role, string> = {
  candidate: 'Candidato',
  contractor: 'Contratante',
  admin: 'Administração',
}

const pathFor = (role: Role) => {
  if (role === 'candidate') return '/candidato'
  if (role === 'contractor') return '/contratante'
  return '/admin'
}

const title = (page: string) => {
  return (
    labels[page] ??
    page
      .split('-')
      .map(
        word =>
          word.charAt(0).toUpperCase() + word.slice(1)
      )
      .join(' ')
  )
}

const date = (value: string) =>
  new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))


/* =========================================================
   MENU
   ========================================================= */

const nav: Record<
  Role,
  Array<{
    page: string
    label: string
    icon: typeof LayoutDashboard
  }>
> = {
  candidate: [
    {
      page: 'dashboard',
      label: 'Visão geral',
      icon: LayoutDashboard,
    },
    {
      page: 'opportunities',
      label: 'Oportunidades',
      icon: Search,
    },
    {
      page: 'applications',
      label: 'Minhas candidaturas',
      icon: ClipboardList,
    },
    {
      page: 'favorites',
      label: 'Salvas',
      icon: Star,
    },
    {
      page: 'profile',
      label: 'Meu perfil',
      icon: CircleUserRound,
    },
    {
      page: 'recommended',
      label: 'Recomendadas',
      icon: TrendingUp,
    },
    {
      page: 'resume',
      label: 'Currículo',
      icon: ClipboardList,
    },
    {
      page: 'skills',
      label: 'Competências',
      icon: Star,
    },
    {
      page: 'experience',
      label: 'Experiência',
      icon: BriefcaseBusiness,
    },
    {
      page: 'education',
      label: 'Formação',
      icon: GraduationCap,
    },
    {
      page: 'portfolio',
      label: 'Portfólio',
      icon: Building2,
    },
    {
      page: 'achievements',
      label: 'Conquistas',
      icon: ShieldCheck,
    },
  ],

  contractor: [
    {
      page: 'dashboard',
      label: 'Visão geral',
      icon: LayoutDashboard,
    },
    {
      page: 'opportunities',
      label: 'Minhas oportunidades',
      icon: BriefcaseBusiness,
    },
    {
      page: 'create-opportunity',
      label: 'Publicar vaga',
      icon: ClipboardList,
    },
    {
      page: 'candidates',
      label: 'Candidatos',
      icon: Users,
    },
    {
      page: 'applications',
      label: 'Candidaturas',
      icon: ClipboardList,
    },
    {
      page: 'business',
      label: 'Minha empresa',
      icon: Building2,
    },
    {
      page: 'reviews',
      label: 'Avaliações',
      icon: Star,
    },
    {
      page: 'reports',
      label: 'Relatórios',
      icon: TrendingUp,
    },
    {
      page: 'profile',
      label: 'Meu perfil',
      icon: CircleUserRound,
    },
  ],

  admin: [
    {
      page: 'dashboard',
      label: 'Visão geral',
      icon: LayoutDashboard,
    },
    {
      page: 'users',
      label: 'Usuários',
      icon: Users,
    },
    {
      page: 'opportunities',
      label: 'Oportunidades',
      icon: BriefcaseBusiness,
    },
    {
      page: 'create-opportunity',
      label: 'Publicar oportunidade',
      icon: ClipboardList,
    },
    {
      page: 'categories',
      label: 'Categorias',
      icon: SlidersHorizontal,
    },
    {
      page: 'moderation',
      label: 'Moderação',
      icon: ShieldCheck,
    },
    {
      page: 'reports',
      label: 'Relatórios',
      icon: TrendingUp,
    },
    {
      page: 'contractors',
      label: 'Contratantes',
      icon: Building2,
    },
    {
      page: 'candidates',
      label: 'Candidatos',
      icon: CircleUserRound,
    },
    {
      page: 'reviews',
      label: 'Avaliações',
      icon: Star,
    },
    {
      page: 'statistics',
      label: 'Estatísticas',
      icon: TrendingUp,
    },
  ],
}


/* =========================================================
   BADGE
   ========================================================= */

function Badge({
  children,
  tone = 'blue',
}: {
  children: string
  tone?: 'blue' | 'green' | 'yellow' | 'red' | 'gray'
}) {
  return (
    <span className={`status-badge status-${tone}`}>
      {children}
    </span>
  )
}


/* =========================================================
   LISTA PADRÃO
   ========================================================= */

function List({
  heading,
  rows,
}: {
  heading: string
  rows: Array<{
    name: string
    detail: string
    status: string
    href?: string
  }>
}) {
  return (
    <section className="workspace-card">
      <div className="card-heading">
        <div>
          <span className="section-eyebrow">REGISTROS</span>
          <h3>{heading}</h3>
        </div>
      </div>

      {rows.length === 0 ? (
        <div className="empty-page">
          <ClipboardList size={30} />
          <h3>Nenhum registro encontrado</h3>
          <p>
            Ainda não existem dados disponíveis para esta
            seção.
          </p>
        </div>
      ) : (
        <div className="records-table">
          {rows.map((row, index) => {
            const tone =
              row.status === 'ACTIVE' ||
              row.status === 'Ativa' ||
              row.status === 'Visível' ||
              row.status === 'Aprovada'
                ? 'green'
                : row.status === 'DRAFT' ||
                    row.status === 'Pendente' ||
                    row.status === 'Nova'
                  ? 'yellow'
                  : row.status === 'CLOSED' ||
                      row.status === 'REJECTED' ||
                      row.status === 'Oculta'
                    ? 'red'
                    : 'blue'

            return (
              <div
                className="record-row"
                key={`${row.name}-${index}`}
              >
                <span className="record-avatar">
                  {row.name[0]?.toUpperCase()}
                </span>

                <div className="record-main">
                  <strong>{row.name}</strong>
                  <small>{row.detail}</small>
                </div>

                <Badge tone={tone}>
                  {row.status}
                </Badge>

                {row.href ? (
                  <Link
                    className="icon-link"
                    to={row.href}
                    aria-label={`Abrir ${row.name}`}
                  >
                    <ChevronRight size={17} />
                  </Link>
                ) : (
                  <ChevronRight size={17} />
                )}
              </div>
            )
          })}
        </div>
      )}
    </section>
  )
}


/* =========================================================
   LISTA DE OPORTUNIDADES
   ========================================================= */

function OpportunityList({
  role,
  items,
}: {
  role: Role
  items: Opportunity[]
}) {
  return (
    <section className="workspace-card">
      <div className="card-heading">
        <div>
          <span className="section-eyebrow">
            OPORTUNIDADES
          </span>
          <h3>
            {items.length} oportunidade
            {items.length !== 1 ? 's' : ''}
          </h3>
        </div>

        <Link
          className="icon-link"
          to={`${pathFor(role)}/opportunities`}
        >
          Ver todas
          <ArrowRight size={16} />
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="empty-page compact">
          <BriefcaseBusiness size={28} />
          <h3>Nenhuma oportunidade</h3>
          <p>
            Ainda não existem oportunidades disponíveis.
          </p>
        </div>
      ) : (
        <div className="records-table">
          {items.map(item => (
            <div className="record-row" key={item.id}>
              <span className="record-avatar">
                <BriefcaseBusiness size={17} />
              </span>

              <div className="record-main">
                <strong>{item.title}</strong>

                <small>
                  <MapPin size={12} />
                  {item.city ?? 'Local não informado'}
                  {item.state
                    ? `, ${item.state}`
                    : ''}
                </small>
              </div>

              <Badge
                tone={
                  item.status === 'ACTIVE'
                    ? 'green'
                    : item.status === 'DRAFT'
                      ? 'yellow'
                      : 'blue'
                }
              >
                {item.status}
              </Badge>

              <Link
                className="icon-link"
                to={`${pathFor(
                  role
                )}/opportunity-details?id=${item.id}`}
                aria-label={`Abrir ${item.title}`}
              >
                <ChevronRight size={18} />
              </Link>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}


/* =========================================================
   WORKSPACE SHELL
   ========================================================= */

function Shell({
  role,
  page,
  children,
}: Props & { children: ReactNode }) {
  const location = useLocation()
  const base = pathFor(role)

  const initials =
    role === 'admin'
      ? 'A'
      : role === 'candidate'
        ? 'C'
        : 'E'

  return (
    <main className="workspace-v2">
      <aside className="workspace-sidebar">
        <Link
          className="workspace-brand"
          to="/"
        >
          <span>H</span>
          <strong>HOUK</strong>
        </Link>

        <div className="workspace-role">
          <span className="role-avatar">
            {initials}
          </span>

          <div>
            <strong>
              {role === 'admin'
                ? 'Equipe HOUK'
                : 'Minha conta'}
            </strong>

            <small>
              {roleLabel[role]}
            </small>
          </div>
        </div>

        <nav className="workspace-nav">
          <span className="nav-caption">
            MENU PRINCIPAL
          </span>

          {nav[role].map(item => {
            const Icon = item.icon
            const target = `${base}/${item.page}`

            return (
              <Link
                key={item.page}
                to={target}
                className={`workspace-nav-link ${
                  location.pathname === target
                    ? 'is-active'
                    : ''
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <nav className="workspace-nav workspace-nav-bottom">
          <Link
            className="workspace-nav-link"
            to={`${base}/notifications`}
          >
            <Bell size={18} />
            <span>Notificações</span>
          </Link>

          <Link
            className="workspace-nav-link"
            to={`${base}/settings`}
          >
            <Settings size={18} />
            <span>Configurações</span>
          </Link>

          <Link
            className="workspace-nav-link logout-link"
            to="/login"
          >
            Sair
          </Link>
        </nav>
      </aside>

      <section className="workspace-content">
        <header className="workspace-topbar">
          <div>
            <span className="breadcrumb">
              HOUK / {roleLabel[role]}
            </span>

            <h1>{title(page)}</h1>
          </div>

          <div className="topbar-actions">
            <button
              className="topbar-icon"
              type="button"
              aria-label="Notificações"
            >
              <Bell size={19} />
            </button>

            <span className="avatar">
              {initials}
            </span>
          </div>
        </header>

        <div className="workspace-body">
          {children}
        </div>
      </section>
    </main>
  )
}


/* =========================================================
   DADOS ADMIN
   ========================================================= */

function useAdminData() {
  const [state, setState] = useState<{
    profiles: Profile[]
    opportunities: Opportunity[]
    applications: Application[]
    categories: Category[]
    reviews: Review[]
    loading: boolean
    error: string
  }>({
    profiles: [],
    opportunities: [],
    applications: [],
    categories: [],
    reviews: [],
    loading: true,
    error: '',
  })

  useEffect(() => {
    async function load() {
      const { data: auth } =
        await supabase.auth.getUser()

      if (!auth.user) {
        setState(current => ({
          ...current,
          loading: false,
          error:
            'Faça login para acessar a administração.',
        }))
        return
      }

      const {
        data: current,
        error: currentError,
      } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', auth.user.id)
        .single()

      if (
        currentError ||
        current?.role !== 'admin'
      ) {
        setState(previous => ({
          ...previous,
          loading: false,
          error:
            'Sua conta não tem permissão de administração.',
        }))
        return
      }

      const [
        profiles,
        opportunities,
        applications,
        categories,
        reviews,
      ] = await Promise.all([
        supabase
          .from('profiles')
          .select(
            'id, full_name, email, role, city, created_at'
          )
          .order('created_at', {
            ascending: false,
          }),

        supabase
          .from('opportunities')
          .select(
            'id, title, status, city, state, created_at'
          )
          .order('created_at', {
            ascending: false,
          }),

        supabase
          .from('applications')
          .select(
            'id, status, created_at'
          )
          .order('created_at', {
            ascending: false,
          }),

        supabase
          .from('categories')
          .select(
            'id, name, description, active'
          )
          .order('name'),

        supabase
          .from('reviews')
          .select(
            'id, rating, comment, visible'
          )
          .order('created_at', {
            ascending: false,
          }),
      ])

      const error =
        profiles.error ??
        opportunities.error ??
        applications.error ??
        categories.error ??
        reviews.error

      setState({
        profiles: profiles.data ?? [],
        opportunities: opportunities.data ?? [],
        applications: applications.data ?? [],
        categories: categories.data ?? [],
        reviews: reviews.data ?? [],
        loading: false,
        error: error
          ? `Não foi possível carregar os dados: ${error.message}`
          : '',
      })
    }

    void load()
  }, [])

  return state
}


/* =========================================================
   PÁGINA ADMIN
   ========================================================= */

function AdminPage({
  page,
}: {
  page: string
}) {
  const {
    profiles,
    opportunities,
    applications,
    categories,
    reviews,
    loading,
    error,
  } = useAdminData()

  if (loading) {
    return (
      <section className="workspace-card loading-card">
        <div className="loading-dot" />
        <span>Carregando dados do banco...</span>
      </section>
    )
  }

  if (error) {
    return (
      <section className="workspace-card">
        <div className="error-box">
          <ShieldCheck size={22} />
          <div>
            <h2>Dados indisponíveis</h2>
            <p>{error}</p>
            <small>
              Verifique as políticas RLS e as migrations
              do Supabase.
            </small>
          </div>
        </div>
      </section>
    )
  }

  const candidates = profiles.filter(
    item => item.role === 'candidate'
  )

  const contractors = profiles.filter(
    item => item.role === 'contractor'
  )

  const active = opportunities.filter(
    item => item.status === 'ACTIVE'
  )

  const drafts = opportunities.filter(
    item => item.status === 'DRAFT'
  )

  if (page === 'dashboard') {
    return (
      <>
        <section className="page-intro">
          <div>
            <span className="section-eyebrow">
              DADOS DA PLATAFORMA
            </span>

            <h2>
              Visão geral da HOUK
            </h2>

            <p>
              Acompanhe os principais indicadores
              registrados atualmente na plataforma.
            </p>
          </div>
        </section>

        <div className="workspace-metrics">
          <article className="workspace-metric">
            <span>Usuários cadastrados</span>
            <strong>{profiles.length}</strong>
            <small>
              {candidates.length} candidatos ·{' '}
              {contractors.length} contratantes
            </small>
          </article>

          <article className="workspace-metric">
            <span>Oportunidades ativas</span>
            <strong>{active.length}</strong>
            <small>
              {drafts.length} aguardando moderação
            </small>
          </article>

          <article className="workspace-metric">
            <span>Candidaturas</span>
            <strong>
              {applications.length}
            </strong>
            <small>
              {
                applications.filter(
                  item =>
                    item.status ===
                    'UNDER_REVIEW'
                ).length
              }{' '}
              em análise
            </small>
          </article>
        </div>

        <List
          heading="Últimos usuários"
          rows={profiles
            .slice(0, 6)
            .map(item => ({
              name: item.full_name,
              detail: `${item.email} · ${date(
                item.created_at
              )}`,
              status: item.role,
            }))}
        />
      </>
    )
  }

  if (
    page === 'users' ||
    page === 'candidates' ||
    page === 'contractors'
  ) {
    const items =
      page === 'candidates'
        ? candidates
        : page === 'contractors'
          ? contractors
          : profiles

    return (
      <List
        heading={`${items.length} registro(s)`}
        rows={items.map(item => ({
          name: item.full_name,
          detail: `${item.email}${
            item.city
              ? ` · ${item.city}`
              : ''
          }`,
          status: item.role,
        }))}
      />
    )
  }

  if (
    page === 'opportunities' ||
    page === 'moderation'
  ) {
    const items =
      page === 'moderation'
        ? drafts
        : opportunities

    return (
      <List
        heading={`${items.length} oportunidade(s)`}
        rows={items.map(item => ({
          name: item.title,
          detail: `${
            item.city ??
            'Local não informado'
          }${
            item.state
              ? `, ${item.state}`
              : ''
          } · ${date(item.created_at)}`,
          status: item.status,
          href: `/admin/opportunity-details?id=${item.id}`,
        }))}
      />
    )
  }

  if (page === 'categories') {
    return (
      <List
        heading={`${categories.length} categoria(s)`}
        rows={categories.map(item => ({
          name: item.name,
          detail:
            item.description ??
            'Sem descrição',
          status: item.active
            ? 'Ativa'
            : 'Inativa',
        }))}
      />
    )
  }

  if (page === 'reviews') {
    return (
      <List
        heading={`${reviews.length} avaliação(ões)`}
        rows={reviews.map(item => ({
          name: `${item.rating}/5 estrelas`,
          detail:
            item.comment ??
            'Sem comentário',
          status: item.visible
            ? 'Visível'
            : 'Oculta',
        }))}
      />
    )
  }

  const rate = opportunities.length
    ? Math.round(
        (active.length * 100) /
          opportunities.length
      )
    : 0

  return (
    <>
      <section className="page-intro">
        <div>
          <span className="section-eyebrow">
            RELATÓRIO
          </span>

          <h2>{title(page)}</h2>

          <p>
            Resumo calculado com os registros
            atuais da plataforma.
          </p>
        </div>
      </section>

      <div className="workspace-metrics">
        <article className="workspace-metric">
          <span>Oportunidades ativas</span>
          <strong>{rate}%</strong>
          <small>
            {active.length} de{' '}
            {opportunities.length}
          </small>
        </article>

        <article className="workspace-metric">
          <span>Candidaturas aprovadas</span>
          <strong>
            {
              applications.filter(
                item =>
                  item.status ===
                  'APPROVED'
              ).length
            }
          </strong>
          <small>
            de {applications.length}{' '}
            candidaturas
          </small>
        </article>

        <article className="workspace-metric">
          <span>Categorias ativas</span>
          <strong>
            {
              categories.filter(
                item => item.active
              ).length
            }
          </strong>
          <small>
            de {categories.length}{' '}
            categorias
          </small>
        </article>
      </div>
    </>
  )
}


/* =========================================================
   DADOS DE CANDIDATO / CONTRATANTE
   ========================================================= */

function useWorkspaceData(
  role: Exclude<Role, 'admin'>
) {
  const [state, setState] = useState<{
    profile: Profile | null
    opportunities: any[]
    applications: any[]
    favorites: any[]
    notifications: any[]
    experiences: any[]
    educations: any[]
    portfolios: any[]
    skills: any[]
    businesses: any[]
    resumes: any[]
    loading: boolean
    error: string
  }>({
    profile: null,
    opportunities: [],
    applications: [],
    favorites: [],
    notifications: [],
    experiences: [],
    educations: [],
    portfolios: [],
    skills: [],
    businesses: [],
    resumes: [],
    loading: true,
    error: '',
  })

  useEffect(() => {
    async function load() {
      const { data: auth } =
        await supabase.auth.getUser()

      if (!auth.user) {
        setState(current => ({
          ...current,
          loading: false,
          error:
            'Faça login para acessar esta área.',
        }))
        return
      }

      const {
        data: profile,
        error: profileError,
      } = await supabase
        .from('profiles')
        .select(
          'id, full_name, email, role, city, headline, created_at'
        )
        .eq('id', auth.user.id)
        .single()

      if (
        profileError ||
        !profile ||
        profile.role !== role
      ) {
        setState(current => ({
          ...current,
          loading: false,
          error:
            'Sua conta não tem permissão para esta área.',
        }))
        return
      }

      const common = [
        supabase
          .from('notifications')
          .select(
            'id, title, body, type, created_at, read_at'
          )
          .eq(
            'recipient_id',
            auth.user.id
          )
          .order('created_at', {
            ascending: false,
          }),
      ]

      if (role === 'candidate') {
        const [
          notifications,
          opportunities,
          applications,
          favorites,
          experiences,
          educations,
          portfolios,
          skills,
          resumes,
        ] = await Promise.all([
          ...common,

          supabase
            .from('opportunities')
            .select(
              'id, title, status, city, state, created_at'
            )
            .eq('status', 'ACTIVE')
            .order('published_at', {
              ascending: false,
            }),

          supabase
            .from('applications')
            .select(
              'id, status, created_at, opportunities(title, city, state)'
            )
            .eq(
              'candidate_id',
              auth.user.id
            )
            .order('created_at', {
              ascending: false,
            }),

          supabase
            .from('favorites')
            .select(
              'created_at, opportunities(title, city, state)'
            )
            .eq(
              'candidate_id',
              auth.user.id
            )
            .order('created_at', {
              ascending: false,
            }),

          supabase
            .from('experiences')
            .select(
              'id, title, company, started_on, current'
            )
            .eq(
              'candidate_id',
              auth.user.id
            )
            .order('started_on', {
              ascending: false,
            }),

          supabase
            .from('educations')
            .select(
              'id, course, institution, current'
            )
            .eq(
              'candidate_id',
              auth.user.id
            ),

          supabase
            .from('portfolios')
            .select(
              'id, title, url'
            )
            .eq(
              'candidate_id',
              auth.user.id
            ),

          supabase
            .from('candidate_skills')
            .select(
              'level, skills(name)'
            )
            .eq(
              'candidate_id',
              auth.user.id
            ),

          supabase
            .from('resumes')
            .select(
              'id, file_name, updated_at'
            )
            .eq(
              'candidate_id',
              auth.user.id
            ),
        ])

        const error =
          notifications.error ??
          opportunities.error ??
          applications.error ??
          favorites.error ??
          experiences.error ??
          educations.error ??
          portfolios.error ??
          skills.error ??
          resumes.error

        setState({
          profile,
          notifications:
            notifications.data ?? [],
          opportunities:
            opportunities.data ?? [],
          applications:
            applications.data ?? [],
          favorites:
            favorites.data ?? [],
          experiences:
            experiences.data ?? [],
          educations:
            educations.data ?? [],
          portfolios:
            portfolios.data ?? [],
          skills:
            skills.data ?? [],
          resumes:
            resumes.data ?? [],
          businesses: [],
          loading: false,
          error: error
            ? `Não foi possível carregar seus dados: ${error.message}`
            : '',
        })
      } else {
        const [
          notifications,
          opportunities,
          applications,
          businesses,
        ] = await Promise.all([
          ...common,

          supabase
            .from('opportunities')
            .select(
              'id, title, status, city, state, created_at'
            )
            .eq(
              'contractor_id',
              auth.user.id
            )
            .order('created_at', {
              ascending: false,
            }),

          supabase
            .from('applications')
            .select(
              'id, status, created_at, candidate_id, opportunities!inner(title, contractor_id)'
            )
            .eq(
              'opportunities.contractor_id',
              auth.user.id
            )
            .order('created_at', {
              ascending: false,
            }),

          supabase
            .from('businesses')
            .select(
              'id, name, city, state, verified_at'
            )
            .eq(
              'contractor_id',
              auth.user.id
            ),
        ])

        const error =
          notifications.error ??
          opportunities.error ??
          applications.error ??
          businesses.error

        setState({
          profile,
          notifications:
            notifications.data ?? [],
          opportunities:
            opportunities.data ?? [],
          applications:
            applications.data ?? [],
          businesses:
            businesses.data ?? [],
          favorites: [],
          experiences: [],
          educations: [],
          portfolios: [],
          skills: [],
          resumes: [],
          loading: false,
          error: error
            ? `Não foi possível carregar seus dados: ${error.message}`
            : '',
        })
      }
    }

    void load()
  }, [role])

  return state
}


/* =========================================================
   HELPERS
   ========================================================= */

function relationName(value: any) {
  return Array.isArray(value)
    ? value[0]?.title ??
        value[0]?.name
    : value?.title ??
        value?.name
}


/* =========================================================
   STANDARD PAGE
   ========================================================= */

function StandardPage({
  role,
  page,
}: Props) {
  const isContractor =
    role === 'contractor'

  const data = useWorkspaceData(
    role as Exclude<Role, 'admin'>
  )

  if (data.loading) {
    return (
      <section className="workspace-card loading-card">
        <div className="loading-dot" />
        <span>
          Carregando dados do banco...
        </span>
      </section>
    )
  }

  if (data.error) {
    return (
      <section className="workspace-card">
        <div className="error-box">
          <ShieldCheck size={22} />
          <div>
            <h2>Dados indisponíveis</h2>
            <p>{data.error}</p>
          </div>
        </div>
      </section>
    )
  }

  if (page === 'dashboard') {
    const active =
      data.opportunities.filter(
        item =>
          item.status === 'ACTIVE'
      )

    const firstName =
      data.profile?.full_name
        ?.split(' ')[0] ?? ''

    return (
      <>
        <section className="page-intro">
          <div>
            <span className="section-eyebrow">
              HOUK • {roleLabel[role].toUpperCase()}
            </span>

            <h2>
              {isContractor
                ? 'Visão da sua empresa'
                : `Olá, ${firstName}`}
            </h2>

            <p>
              {isContractor
                ? 'Acompanhe suas oportunidades e candidaturas recebidas.'
                : 'Encontre oportunidades e acompanhe sua jornada profissional.'}
            </p>
          </div>

          {!isContractor && (
            <Link
              className="workspace-primary"
              to="/opportunities"
            >
              <Search size={17} />
              Explorar oportunidades
            </Link>
          )}

          {isContractor && (
            <Link
              className="workspace-primary"
              to="/contratante/create-opportunity"
            >
              <BriefcaseBusiness size={17} />
              Publicar oportunidade
            </Link>
          )}
        </section>

        <div className="workspace-metrics">
          <article className="workspace-metric">
            <div className="metric-icon">
              <BriefcaseBusiness size={18} />
            </div>

            <span>
              {isContractor
                ? 'Oportunidades publicadas'
                : 'Candidaturas enviadas'}
            </span>

            <strong>
              {isContractor
                ? data.opportunities.length
                : data.applications.length}
            </strong>

            <small>
              Dados atuais do banco
            </small>
          </article>

          <article className="workspace-metric">
            <div className="metric-icon">
              <Star size={18} />
            </div>

            <span>
              {isContractor
                ? 'Oportunidades ativas'
                : 'Oportunidades salvas'}
            </span>

            <strong>
              {isContractor
                ? active.length
                : data.favorites.length}
            </strong>

            <small>
              Dados atuais do banco
            </small>
          </article>

          <article className="workspace-metric">
            <div className="metric-icon">
              <Bell size={18} />
            </div>

            <span>
              Notificações não lidas
            </span>

            <strong>
              {
                data.notifications.filter(
                  item => !item.read_at
                ).length
              }
            </strong>

            <small>
              {data.notifications.length}{' '}
              no total
            </small>
          </article>
        </div>

        <div className="workspace-columns">
          <OpportunityList
            role={role}
            items={data.opportunities.slice(
              0,
              5
            )}
          />

          <section className="workspace-card">
            <div className="card-heading">
              <div>
                <span className="section-eyebrow">
                  ATIVIDADE
                </span>

                <h3>
                  Atualizações recentes
                </h3>
              </div>
            </div>

            {data.notifications.length ===
            0 ? (
              <div className="empty-page compact">
                <Bell size={27} />
                <h3>
                  Tudo tranquilo por aqui
                </h3>
                <p>
                  Você não possui novas
                  notificações.
                </p>
              </div>
            ) : (
              <div className="activity-list">
                {data.notifications
                  .slice(0, 5)
                  .map(item => (
                    <div
                      className="activity-item"
                      key={item.id}
                    >
                      <span className="activity-dot">
                        <Bell size={15} />
                      </span>

                      <div>
                        <strong>
                          {item.title}
                        </strong>

                        <small>
                          {item.body}
                        </small>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </section>
        </div>
      </>
    )
  }

  if (
    page === 'opportunities' ||
    (!isContractor &&
      page === 'recommended')
  ) {
    return (
      <OpportunityList
        role={role}
        items={data.opportunities}
      />
    )
  }

  if (
    page === 'applications' ||
    (isContractor &&
      page === 'candidates')
  ) {
    return (
      <List
        heading={`${data.applications.length} candidatura(s)`}
        rows={data.applications.map(
          item => ({
            name:
              relationName(
                item.opportunities
              ) ??
              'Oportunidade',
            detail: `Atualizada em ${date(
              item.created_at
            )}`,
            status: item.status,
            href: isContractor
              ? `/contratante/application-details?id=${item.id}`
              : `/candidato/application-details?id=${item.id}`,
          })
        )}
      />
    )
  }

  if (page === 'favorites') {
    return (
      <List
        heading={`${data.favorites.length} oportunidade(s) salva(s)`}
        rows={data.favorites.map(
          item => ({
            name:
              relationName(
                item.opportunities
              ) ??
              'Oportunidade',
            detail: `Salva em ${date(
              item.created_at
            )}`,
            status: 'Salva',
          })
        )}
      />
    )
  }

  if (page === 'notifications') {
    return (
      <List
        heading={`${data.notifications.length} notificação(ões)`}
        rows={data.notifications.map(
          item => ({
            name: item.title,
            detail: item.body,
            status: item.read_at
              ? 'Lida'
              : 'Nova',
          })
        )}
      />
    )
  }

  if (page === 'experience') {
    return (
      <List
        heading={`${data.experiences.length} experiência(s)`}
        rows={data.experiences.map(
          item => ({
            name: item.title,
            detail: `${item.company} · ${
              item.current
                ? 'Atual'
                : date(item.started_on)
            }`,
            status: item.current
              ? 'Atual'
              : 'Concluída',
          })
        )}
      />
    )
  }

  if (page === 'education') {
    return (
      <List
        heading={`${data.educations.length} formação(ões)`}
        rows={data.educations.map(
          item => ({
            name: item.course,
            detail: item.institution,
            status: item.current
              ? 'Em curso'
              : 'Concluída',
          })
        )}
      />
    )
  }

  if (page === 'portfolio') {
    return (
      <List
        heading={`${data.portfolios.length} item(ns)`}
        rows={data.portfolios.map(
          item => ({
            name: item.title,
            detail: item.url,
            status: 'Publicado',
          })
        )}
      />
    )
  }

  if (page === 'skills') {
    return (
      <List
        heading={`${data.skills.length} competência(s)`}
        rows={data.skills.map(
          item => ({
            name:
              relationName(
                item.skills
              ) ??
              'Competência',
            detail: `Nível ${
              item.level ??
              'não informado'
            }`,
            status: 'Ativa',
          })
        )}
      />
    )
  }

  if (page === 'resume') {
    return (
      <List
        heading="Currículo"
        rows={data.resumes.map(
          item => ({
            name: item.file_name,
            detail: `Atualizado em ${date(
              item.updated_at
            )}`,
            status: 'Disponível',
          })
        )}
      />
    )
  }

  if (!isContractor && page === 'career') {
    return (
      <section className="workspace-card editor-card">
        <span className="section-eyebrow">MINHA CARREIRA</span>
        <h2>Construa um perfil completo</h2>
        <p>
          Mantenha suas informações atualizadas para aumentar
          suas chances nas oportunidades.
        </p>
        <div className="career-links">
          <Link to="/candidato/experience">Adicionar experiência</Link>
          <Link to="/candidato/education">Adicionar formação</Link>
          <Link to="/candidato/skills">Adicionar competência</Link>
          <Link to="/candidato/portfolio">Adicionar projeto</Link>
          <Link to="/candidato/resume">Atualizar currículo</Link>
        </div>
      </section>
    )
  }

  if (!isContractor && page === 'achievements') {
    const completed = [
      data.profile?.headline,
      data.profile?.city,
      data.resumes.length,
      data.skills.length,
      data.experiences.length,
      data.educations.length,
    ].filter(Boolean).length
    return (
      <>
        <section className="page-intro">
          <div>
            <span className="section-eyebrow">PROGRESSO</span>
            <h2>Conquistas do perfil</h2>
            <p>Seu perfil possui {completed} de 6 etapas principais completas.</p>
          </div>
        </section>
        <div className="workspace-metrics">
          <article className="workspace-metric"><span>Competências</span><strong>{data.skills.length}</strong><small>registradas no perfil</small></article>
          <article className="workspace-metric"><span>Experiências</span><strong>{data.experiences.length}</strong><small>incluídas na carreira</small></article>
          <article className="workspace-metric"><span>Candidaturas</span><strong>{data.applications.length}</strong><small>enviadas até agora</small></article>
        </div>
      </>
    )
  }

  if (!isContractor && page === 'activity') {
    return (
      <List
        heading="Atividade recente"
        rows={data.notifications.map(item => ({
          name: item.title,
          detail: item.body,
          status: item.read_at ? 'Lida' : 'Nova',
        }))}
      />
    )
  }

  if (page === 'business') {
    return (
      <>
        <section className="page-intro">
          <div>
            <span className="section-eyebrow">EMPRESA</span>
            <h2>Minha empresa</h2>
            <p>Gerencie os dados que acompanham suas oportunidades.</p>
          </div>
          <Link className="workspace-primary" to="/contratante/edit-business">Editar empresa</Link>
        </section>
        <List
          heading="Minha empresa"
          rows={data.businesses.map(
            item => ({
              name: item.name,
              detail: `${
                item.city ??
                'Local não informado'
              }${
                item.state
                  ? `, ${item.state}`
                  : ''
              }`,
              status: item.verified_at
                ? 'Verificada'
                : 'Pendente',
            })
          )}
        />
      </>
    )
  }

  if (
    isContractor &&
    page === 'reports'
  ) {
    return (
      <>
        <section className="page-intro">
          <div>
            <span className="section-eyebrow">
              ANÁLISE
            </span>

            <h2>
              Relatórios
            </h2>

            <p>
              Indicadores calculados com os
              registros da sua conta.
            </p>
          </div>
        </section>

        <div className="workspace-metrics">
          <article className="workspace-metric">
            <span>
              Oportunidades ativas
            </span>

            <strong>
              {
                data.opportunities.filter(
                  item =>
                    item.status ===
                    'ACTIVE'
                ).length
              }
            </strong>

            <small>
              de {data.opportunities.length}{' '}
              oportunidade(s)
            </small>
          </article>

          <article className="workspace-metric">
            <span>
              Candidaturas recebidas
            </span>

            <strong>
              {data.applications.length}
            </strong>

            <small>
              Dados atuais do banco
            </small>
          </article>

          <article className="workspace-metric">
            <span>Em análise</span>

            <strong>
              {
                data.applications.filter(
                  item =>
                    item.status ===
                    'UNDER_REVIEW'
                ).length
              }
            </strong>

            <small>
              Candidaturas em análise
            </small>
          </article>
        </div>
      </>
    )
  }

  if (
    page === 'profile' ||
    page === 'settings' ||
    page === 'preferences'
  ) {
    return (
      <>
        <section className="page-intro">
          <div>
            <span className="section-eyebrow">
              SUA CONTA
            </span>

            <h2>
              {title(page)}
            </h2>

            <p>
              Consulte e organize suas
              informações no HOUK.
            </p>
          </div>
        </section>

        <section className="profile-card">
          <div className="profile-cover" />

          <div className="profile-avatar">
            {data.profile?.full_name
              ?.charAt(0)
              .toUpperCase()}
          </div>

          <h2>
            {data.profile?.full_name}
          </h2>

          <p>
            {data.profile?.email}
            {data.profile?.city
              ? ` · ${data.profile.city}`
              : ''}
          </p>

          <div className="profile-details-grid">
            <div>
              <span>Perfil</span>
              <strong>
                {roleLabel[role]}
              </strong>
            </div>

            <div>
              <span>Localização</span>
              <strong>
                {data.profile?.city ??
                  'Não informado'}
              </strong>
            </div>
          </div>

          {page === 'profile' && (
            <div className="profile-card-action">
              <Link
                className="workspace-primary"
                to={`${pathFor(role)}/edit-profile`}
              >
                Editar perfil
              </Link>
            </div>
          )}
        </section>
      </>
    )
  }

  return (
    <section className="workspace-card empty-page">
      <Sparkles size={30} />

      <span className="section-eyebrow">
        {roleLabel[role].toUpperCase()}
      </span>

      <h2>{title(page)}</h2>

      <p>
        Esta área está preparada para receber
        os recursos desta funcionalidade.
      </p>
    </section>
  )
}


/* =========================================================
   WORKSPACE PAGE
   ========================================================= */

export function WorkspacePage({
  role,
  page,
  children,
}: Props & { children?: ReactNode }) {
  return (
    <Shell
      role={role}
      page={page}
    >
      {children ?? (role === 'admin' ? (
        <AdminPage page={page} />
      ) : (
        <StandardPage
          role={role}
          page={page}
        />
      ))}
    </Shell>
  )
}


/* =========================================================
   HOME PÚBLICA
   ========================================================= */

export function PublicHome() {
  return (
    <main className="public-page">

      {/* NAVBAR */}
      <header className="public-nav">
        <Link
          className="brand"
          to="/"
        >
          <b>H</b>
          <span>HOUK</span>
        </Link>

        <nav className="public-nav-links">
          <a href="#como-funciona">
            Como funciona
          </a>

          <a href="#oportunidades">
            Oportunidades
          </a>

          <a href="#categorias">
            Categorias
          </a>
        </nav>

        <div className="public-nav-actions">
          <Link
            className="nav-login"
            to="/login"
          >
            Entrar
          </Link>

          <Link
            className="nav-cta"
            to="/cadastro"
          >
            Criar minha conta
          </Link>
        </div>
      </header>


      {/* HERO */}
      <section className="hero-houk">
        <div className="hero-content">
          <span className="eyebrow">
            TRABALHO COM PROPÓSITO
          </span>

          <h1>
            Encontre o próximo passo
            <span> da sua carreira.</span>
          </h1>

          <p>
            A HOUK conecta profissionais,
            empresas e oportunidades em um
            único lugar.
          </p>

          <div className="hero-buttons">
            <Link
              className="primary"
              to="/opportunities"
            >
              <Search size={18} />
              Quero trabalhar
            </Link>

            <Link
              className="secondary"
              to="/cadastro"
            >
              Quero contratar
              <ArrowRight size={17} />
            </Link>
          </div>

          <div className="hero-trust">
            <CheckCircle2 size={16} />
            <span>
              Oportunidades CLT, PJ e Jovem
              Aprendiz
            </span>
          </div>
        </div>


        {/* HERO CARD */}
        <div className="hero-visual">
          <div className="hero-card-main">
            <div className="hero-card-top">
              <span className="hero-card-icon">
                <BriefcaseBusiness size={20} />
              </span>

              <span className="hero-card-status">
                Disponível
              </span>
            </div>

            <span className="hero-card-label">
              OPORTUNIDADE
            </span>

            <h3>
              Desenvolvedor Web Júnior
            </h3>

            <p>
              HOUK Tecnologia e Serviços
            </p>

            <div className="hero-card-info">
              <span>
                <MapPin size={14} />
                Itapetininga, SP
              </span>

              <span>
                Híbrido
              </span>
            </div>

            <div className="hero-card-bottom">
              <strong>
                R$ 2.500 — R$ 3.500
              </strong>

              <span>CLT</span>
            </div>
          </div>

          <div className="floating-card floating-card-one">
            <CheckCircle2 size={18} />
            <div>
              <strong>Perfil completo</strong>
              <span>Pronto para se candidatar</span>
            </div>
          </div>

          <div className="floating-card floating-card-two">
            <Users size={18} />
            <div>
              <strong>Conexões</strong>
              <span>Profissionais + empresas</span>
            </div>
          </div>
        </div>
      </section>


      {/* FAIXA DE NÚMEROS */}
      <section className="stats-strip">
        <div>
          <strong>CLT</strong>
          <span>Contratação tradicional</span>
        </div>

        <div>
          <strong>PJ</strong>
          <span>Prestação de serviços</span>
        </div>

        <div>
          <strong>APRENDIZ</strong>
          <span>Primeiras oportunidades</span>
        </div>

        <div>
          <strong>HOUK</strong>
          <span>Conexão profissional</span>
        </div>
      </section>


      {/* COMO FUNCIONA */}
      <section
        className="home-section how-section"
        id="como-funciona"
      >
        <div className="section-heading">
          <span className="section-eyebrow">
            COMO FUNCIONA
          </span>

          <h2>
            Uma conexão mais simples
            entre pessoas e oportunidades.
          </h2>

          <p>
            A HOUK organiza o processo para
            que profissionais encontrem
            oportunidades e contratantes
            encontrem pessoas.
          </p>
        </div>

        <div className="steps-grid">
          <article className="step-card">
            <span className="step-number">
              01
            </span>

            <div className="step-icon">
              <CircleUserRound size={22} />
            </div>

            <h3>
              Crie seu perfil
            </h3>

            <p>
              Apresente suas experiências,
              competências, formação e
              objetivos profissionais.
            </p>
          </article>

          <article className="step-card">
            <span className="step-number">
              02
            </span>

            <div className="step-icon">
              <Search size={22} />
            </div>

            <h3>
              Encontre oportunidades
            </h3>

            <p>
              Pesquise vagas de acordo com
              área, localização, modalidade
              e tipo de contratação.
            </p>
          </article>

          <article className="step-card">
            <span className="step-number">
              03
            </span>

            <div className="step-icon">
              <CheckCircle2 size={22} />
            </div>

            <h3>
              Faça a conexão
            </h3>

            <p>
              Candidate-se às oportunidades
              e acompanhe o andamento da
              sua candidatura.
            </p>
          </article>
        </div>
      </section>


      {/* OPORTUNIDADES */}
      <section
        className="home-section opportunities-section"
        id="oportunidades"
      >
        <div className="section-heading section-heading-row">
          <div>
            <span className="section-eyebrow">
              OPORTUNIDADES
            </span>

            <h2>
              Encontre seu próximo desafio.
            </h2>

            <p>
              Explore oportunidades em
              diferentes áreas e modelos de
              trabalho.
            </p>
          </div>

          <Link
            className="text-link"
            to="/opportunities"
          >
            Ver oportunidades
            <ArrowRight size={16} />
          </Link>
        </div>

        <div className="job-grid">
          <article className="job-card">
            <button
              type="button"
              aria-label="Salvar oportunidade"
            >
              <Star size={18} />
            </button>

            <div className="job-logo">
              H
            </div>

            <span className="job-type">
              CLT
            </span>

            <h3>
              Desenvolvedor Web Júnior
            </h3>

            <p>
              HOUK Tecnologia e Serviços
            </p>

            <div className="job-meta">
              <span>
                <MapPin size={14} />
                Itapetininga, SP
              </span>

              <span>
                Híbrido
              </span>
            </div>

            <strong>
              R$ 2.500 — R$ 3.500
            </strong>

            <Link to="/opportunity-details">
              Ver oportunidade
              <ArrowRight size={15} />
            </Link>
          </article>


          <article className="job-card">
            <button
              type="button"
              aria-label="Salvar oportunidade"
            >
              <Star size={18} />
            </button>

            <div className="job-logo">
              D
            </div>

            <span className="job-type">
              PJ
            </span>

            <h3>
              Designer Gráfico Freelancer
            </h3>

            <p>
              Projeto remoto
            </p>

            <div className="job-meta">
              <span>
                <MapPin size={14} />
                Remoto
              </span>

              <span>
                Flexível
              </span>
            </div>

            <strong>
              R$ 1.800 — R$ 3.000
            </strong>

            <Link to="/opportunity-details">
              Ver oportunidade
              <ArrowRight size={15} />
            </Link>
          </article>


          <article className="job-card">
            <button
              type="button"
              aria-label="Salvar oportunidade"
            >
              <Star size={18} />
            </button>

            <div className="job-logo">
              A
            </div>

            <span className="job-type">
              APRENDIZ
            </span>

            <h3>
              Jovem Aprendiz —
              Auxiliar Administrativo
            </h3>

            <p>
              Oportunidade para início
              profissional
            </p>

            <div className="job-meta">
              <span>
                <MapPin size={14} />
                Itapetininga, SP
              </span>

              <span>
                Presencial
              </span>
            </div>

            <strong>
              R$ 900 — R$ 1.100
            </strong>

            <Link to="/opportunity-details">
              Ver oportunidade
              <ArrowRight size={15} />
            </Link>
          </article>
        </div>
      </section>


      {/* CATEGORIAS */}
      <section
        className="home-section categories-section"
        id="categorias"
      >
        <div className="section-heading">
          <span className="section-eyebrow">
            ÁREAS PROFISSIONAIS
          </span>

          <h2>
            Oportunidades para diferentes
            trajetórias.
          </h2>
        </div>

        <div className="categories-grid">
          {[
            'Administração',
            'Tecnologia',
            'Atendimento',
            'Comércio',
            'Construção',
            'Saúde',
            'Educação',
            'Marketing',
            'Design',
            'Logística',
            'Serviços Gerais',
            'Engenharia',
          ].map(category => (
            <Link
              className="category-card"
              to="/categories"
              key={category}
            >
              <span>
                {category}
              </span>

              <ChevronRight size={17} />
            </Link>
          ))}
        </div>
      </section>


      {/* CTA */}
      <section className="final-cta">
        <div>
          <span className="section-eyebrow">
            HOUK
          </span>

          <h2>
            Conectando pessoas a
            oportunidades.
          </h2>

          <p>
            Crie sua conta e dê o próximo
            passo profissional.
          </p>
        </div>

        <div className="final-cta-actions">
          <Link
            className="primary"
            to="/cadastro"
          >
            Criar minha conta
            <ArrowRight size={17} />
          </Link>

          <Link
            className="secondary"
            to="/login"
          >
            Já tenho uma conta
          </Link>
        </div>
      </section>


      {/* FOOTER */}
      <footer className="public-footer">
        <div className="footer-brand">
          <Link
            className="brand"
            to="/"
          >
            <b>H</b>
            <span>HOUK</span>
          </Link>

          <p>
            Conectando pessoas a
            oportunidades.
          </p>
        </div>

        <div className="footer-links">
          <Link to="/about">
            Sobre
          </Link>

          <Link to="/how-it-works">
            Como funciona
          </Link>

          <Link to="/faq">
            FAQ
          </Link>

          <Link to="/contact">
            Contato
          </Link>
        </div>

        <span className="footer-copy">
          © 2026 HOUK
        </span>
      </footer>
    </main>
  )
}


/* =========================================================
   DETALHES PÚBLICOS
   ========================================================= */

export function DetailPage({
  page,
}: {
  page: string
}) {
  return (
    <main className="public-page">
      <header className="public-nav">
        <Link
          className="brand"
          to="/"
        >
          <b>H</b>
          <span>HOUK</span>
        </Link>

        <div className="public-nav-actions">
          <Link
            className="nav-login"
            to="/login"
          >
            Entrar
          </Link>

          <Link
            className="nav-cta"
            to="/cadastro"
          >
            Criar minha conta
          </Link>
        </div>
      </header>

      <section className="detail-page">
        <span className="section-eyebrow">
          HOUK
        </span>

        <h1>{title(page)}</h1>

        <p>
          Consulte informações e recursos
          relacionados a esta área da
          plataforma HOUK.
        </p>

        <div className="detail-content">
          <article className="detail-card">
            <div className="detail-card-icon">
              <Sparkles size={21} />
            </div>

            <h2>
              {title(page)}
            </h2>

            <p>
              Esta página está integrada à
              estrutura principal da HOUK e
              preparada para receber os
              recursos desta funcionalidade.
            </p>
          </article>

          <aside className="detail-card detail-card-side">
            <span className="section-eyebrow">
              HOUK
            </span>

            <h3>
              Encontre novas
              possibilidades.
            </h3>

            <p>
              Explore oportunidades e
              descubra como a plataforma
              conecta profissionais e
              contratantes.
            </p>

            <Link
              className="primary"
              to="/opportunities"
            >
              Explorar oportunidades
              <ArrowRight size={16} />
            </Link>
          </aside>
        </div>
      </section>
    </main>
  )
}


/* =========================================================
   BUSCA
   ========================================================= */

export function SearchPage() {
  const { kind } = useParams()

  const heading = kind
    ? `Buscar ${kind}`
    : 'Buscar oportunidades'

  return (
    <main className="public-page">
      <header className="public-nav">
        <Link
          className="brand"
          to="/"
        >
          <b>H</b>
          <span>HOUK</span>
        </Link>

        <div className="public-nav-actions">
          <Link
            className="nav-login"
            to="/login"
          >
            Entrar
          </Link>

          <Link
            className="nav-cta"
            to="/cadastro"
          >
            Criar minha conta
          </Link>
        </div>
      </header>

      <section className="search-page">
        <span className="section-eyebrow">
          ENCONTRE SUA OPORTUNIDADE
        </span>

        <h1>{heading}</h1>

        <p>
          Pesquise por cargo, área,
          localização ou modalidade de
          trabalho.
        </p>

        <div className="search-bar">
          <Search size={20} />

          <input
            type="text"
            placeholder="Ex.: desenvolvedor, designer, Itapetininga..."
            aria-label="Buscar oportunidades"
          />

          <button type="button">
            Buscar
          </button>
        </div>

        <div className="search-filters">
          <button type="button">
            Todas as áreas
          </button>

          <button type="button">
            Todos os tipos
          </button>

          <button type="button">
            Todos os modelos
          </button>

          <button type="button">
            Localização
          </button>
        </div>

        <div className="search-results-heading">
          <div>
            <span className="section-eyebrow">
              RESULTADOS
            </span>

            <h2>
              Oportunidades disponíveis
            </h2>
          </div>

          <span className="result-count">
            3 oportunidades
          </span>
        </div>

        <div className="job-grid">
          <article className="job-card">
            <div className="job-logo">
              H
            </div>

            <span className="job-type">
              CLT
            </span>

            <h3>
              Desenvolvedor Web Júnior
            </h3>

            <p>
              HOUK Tecnologia e Serviços
            </p>

            <div className="job-meta">
              <span>
                <MapPin size={14} />
                Itapetininga, SP
              </span>

              <span>
                Híbrido
              </span>
            </div>

            <strong>
              R$ 2.500 — R$ 3.500
            </strong>

            <Link to="/opportunity-details">
              Ver oportunidade
              <ArrowRight size={15} />
            </Link>
          </article>

          <article className="job-card">
            <div className="job-logo">
              D
            </div>

            <span className="job-type">
              PJ
            </span>

            <h3>
              Designer Gráfico Freelancer
            </h3>

            <p>
              Trabalho remoto
            </p>

            <div className="job-meta">
              <span>
                <MapPin size={14} />
                Remoto
              </span>

              <span>
                Flexível
              </span>
            </div>

            <strong>
              R$ 1.800 — R$ 3.000
            </strong>

            <Link to="/opportunity-details">
              Ver oportunidade
              <ArrowRight size={15} />
            </Link>
          </article>

          <article className="job-card">
            <div className="job-logo">
              A
            </div>

            <span className="job-type">
              APRENDIZ
            </span>

            <h3>
              Jovem Aprendiz —
              Auxiliar Administrativo
            </h3>

            <p>
              Primeira oportunidade
              profissional
            </p>

            <div className="job-meta">
              <span>
                <MapPin size={14} />
                Itapetininga, SP
              </span>

              <span>
                Presencial
              </span>
            </div>

            <strong>
              R$ 900 — R$ 1.100
            </strong>

            <Link to="/opportunity-details">
              Ver oportunidade
              <ArrowRight size={15} />
            </Link>
          </article>
        </div>
      </section>
    </main>
  )
}


/* =========================================================
   RESET DE AUTENTICAÇÃO
   ========================================================= */

export function AuthReset() {
  return (
    <DetailPage page="Redefinir senha" />
  )
}
