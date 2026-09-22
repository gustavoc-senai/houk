import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  BriefcaseBusiness,
  Building2,
  ChevronRight,
  CircleUserRound,
  ClipboardList,
  LogOut,
  Plus,
  Search,
  UsersRound,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import './Dashboard.css'

type Opportunity = {
  id: string
  title: string
  opportunity_type: 'CLT' | 'PJ' | 'APPRENTICE'
  work_model: 'PRESENTIAL' | 'REMOTE' | 'HYBRID'
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'CLOSED'
  city: string | null
  state: string | null
  vacancies: number
  created_at: string
}

type ContractorProfile = {
  full_name: string
  email: string
  avatar_url: string | null
}

export default function Dashboard() {
  const navigate = useNavigate()

  const [profile, setProfile] =
    useState<ContractorProfile | null>(null)

  const [opportunities, setOpportunities] =
    useState<Opportunity[]>([])

  const [applicationsCount, setApplicationsCount] =
    useState(0)

  const [loading, setLoading] = useState(true)

  async function loadDashboard() {
    setLoading(true)

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      navigate('/login')
      return
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('full_name, email, avatar_url')
      .eq('id', user.id)
      .single()

    if (profileData) {
      setProfile(profileData)
    }

    const { data: opportunitiesData } =
      await supabase
        .from('opportunities')
        .select(
          `
            id,
            title,
            opportunity_type,
            work_model,
            status,
            city,
            state,
            vacancies,
            created_at
          `,
        )
        .eq('contractor_id', user.id)
        .order('created_at', {
          ascending: false,
        })

    if (opportunitiesData) {
      setOpportunities(opportunitiesData)
    }

    if (opportunitiesData?.length) {
      const opportunityIds =
        opportunitiesData.map(
          (opportunity) => opportunity.id,
        )

      const { count } = await supabase
        .from('applications')
        .select('id', {
          count: 'exact',
          head: true,
        })
        .in('opportunity_id', opportunityIds)

      setApplicationsCount(count ?? 0)
    }

    setLoading(false)
  }

  useEffect(() => {
    loadDashboard()
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const activeOpportunities =
    opportunities.filter(
      (opportunity) =>
        opportunity.status === 'ACTIVE',
    ).length

  const pausedOpportunities =
    opportunities.filter(
      (opportunity) =>
        opportunity.status === 'PAUSED',
    ).length

  function formatOpportunityType(
    type: Opportunity['opportunity_type'],
  ) {
    if (type === 'APPRENTICE') {
      return 'Jovem Aprendiz'
    }

    return type
  }

  function formatWorkModel(
    model: Opportunity['work_model'],
  ) {
    if (model === 'PRESENTIAL') {
      return 'Presencial'
    }

    if (model === 'REMOTE') {
      return 'Remoto'
    }

    return 'Híbrido'
  }

  function formatDate(date: string) {
    return new Intl.DateTimeFormat(
      'pt-BR',
      {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      },
    ).format(new Date(date))
  }

  return (
    <main className="contractor-dashboard">

      {/* SIDEBAR */}

      <aside className="contractor-sidebar">

        <div className="contractor-brand">
          <div className="contractor-brand-logo">
            H
          </div>

          <span>HOUK</span>
        </div>

        <nav className="contractor-navigation">

          <span className="navigation-label">
            MENU
          </span>

          <button
            className="navigation-item active"
            type="button"
          >
            <ClipboardList size={18} />
            <span>Visão geral</span>
          </button>

          <button
            className="navigation-item"
            type="button"
          >
            <BriefcaseBusiness size={18} />
            <span>Oportunidades</span>
          </button>

          <button
            className="navigation-item"
            type="button"
          >
            <UsersRound size={18} />
            <span>Candidatos</span>
          </button>

          <button
            className="navigation-item"
            type="button"
          >
            <Building2 size={18} />
            <span>Meu negócio</span>
          </button>

        </nav>

        <div className="sidebar-bottom">

          <button
            className="navigation-item"
            type="button"
          >
            <CircleUserRound size={18} />
            <span>Meu perfil</span>
          </button>

          <button
            className="navigation-item logout-item"
            type="button"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            <span>Sair</span>
          </button>

        </div>

      </aside>

      {/* CONTEÚDO */}

      <section className="contractor-main">

        <header className="contractor-header">

          <div>
            <span className="dashboard-eyebrow">
              PAINEL DO CONTRATANTE
            </span>

            <h1>
              Olá,{' '}
              {profile?.full_name ||
                'Contratante'}
              .
            </h1>

            <p>
              Acompanhe suas oportunidades e encontre
              os profissionais certos para sua equipe.
            </p>
          </div>

          <div className="header-actions">

            <button
              type="button"
              className="notification-button"
              aria-label="Notificações"
            >
              <Bell size={19} />
              <span />
            </button>

            <div className="header-avatar">
              {profile?.full_name
                ?.charAt(0)
                .toUpperCase() || 'H'}
            </div>

          </div>

        </header>

        {/* AÇÃO PRINCIPAL */}

        <div className="dashboard-action">

          <div>
            <span>
              PRECISA DE NOVOS PROFISSIONAIS?
            </span>

            <h2>
              Publique uma nova oportunidade.
            </h2>

            <p>
              Encontre pessoas qualificadas para fazer
              seu negócio crescer.
            </p>
          </div>

          <button
            type="button"
            className="new-opportunity-button"
          >
            <Plus size={18} />
            Nova oportunidade
          </button>

        </div>

        {/* INDICADORES */}

        <section className="dashboard-section">

          <div className="section-heading">

            <div>
              <span className="section-eyebrow">
                DESEMPENHO
              </span>

              <h2>
                Visão geral
              </h2>
            </div>

          </div>

          <div className="metric-grid">

            <article className="metric-card">

              <div className="metric-icon blue">
                <BriefcaseBusiness size={20} />
              </div>

              <div className="metric-content">

                <span>
                  Oportunidades
                </span>

                <strong>
                  {loading
                    ? '—'
                    : opportunities.length}
                </strong>

                <small>
                  Publicadas por você
                </small>

              </div>

            </article>

            <article className="metric-card">

              <div className="metric-icon green">
                <ClipboardList size={20} />
              </div>

              <div className="metric-content">

                <span>
                  Ativas
                </span>

                <strong>
                  {loading
                    ? '—'
                    : activeOpportunities}
                </strong>

                <small>
                  Recebendo candidaturas
                </small>

              </div>

            </article>

            <article className="metric-card">

              <div className="metric-icon red">
                <UsersRound size={20} />
              </div>

              <div className="metric-content">

                <span>
                  Candidaturas
                </span>

                <strong>
                  {loading
                    ? '—'
                    : applicationsCount}
                </strong>

                <small>
                  Em todas as oportunidades
                </small>

              </div>

            </article>

            <article className="metric-card">

              <div className="metric-icon navy">
                <Search size={20} />
              </div>

              <div className="metric-content">

                <span>
                  Pausadas
                </span>

                <strong>
                  {loading
                    ? '—'
                    : pausedOpportunities}
                </strong>

                <small>
                  Oportunidades pausadas
                </small>

              </div>

            </article>

          </div>

        </section>

        {/* OPORTUNIDADES */}

        <section className="dashboard-section">

          <div className="section-heading section-heading-row">

            <div>
              <span className="section-eyebrow">
                SUAS VAGAS
              </span>

              <h2>
                Oportunidades recentes
              </h2>
            </div>

            <button
              type="button"
              className="view-all-button"
            >
              Ver todas
              <ChevronRight size={16} />
            </button>

          </div>

          <div className="opportunities-card">

            {loading ? (
              <div className="empty-dashboard">
                Carregando oportunidades...
              </div>
            ) : opportunities.length === 0 ? (
              <div className="empty-dashboard">

                <div className="empty-icon">
                  <BriefcaseBusiness size={22} />
                </div>

                <h3>
                  Você ainda não publicou oportunidades.
                </h3>

                <p>
                  Crie sua primeira oportunidade para
                  começar a receber candidaturas.
                </p>

                <button
                  type="button"
                  className="empty-action"
                >
                  <Plus size={17} />
                  Criar oportunidade
                </button>

              </div>
            ) : (
              <div className="opportunity-list">

                {opportunities
                  .slice(0, 5)
                  .map((opportunity) => (
                    <article
                      className="opportunity-row"
                      key={opportunity.id}
                    >

                      <div className="opportunity-logo">
                        <BriefcaseBusiness
                          size={20}
                        />
                      </div>

                      <div className="opportunity-info">

                        <h3>
                          {opportunity.title}
                        </h3>

                        <div className="opportunity-meta">

                          <span>
                            {formatOpportunityType(
                              opportunity.opportunity_type,
                            )}
                          </span>

                          <span>
                            {formatWorkModel(
                              opportunity.work_model,
                            )}
                          </span>

                          <span>
                            {opportunity.city ||
                              'Local não informado'}
                            {opportunity.state
                              ? `, ${opportunity.state}`
                              : ''}
                          </span>

                        </div>

                      </div>

                      <div className="opportunity-status">

                        <span
                          className={`status-badge ${opportunity.status.toLowerCase()}`}
                        >
                          {opportunity.status ===
                          'ACTIVE'
                            ? 'Ativa'
                            : opportunity.status ===
                              'PAUSED'
                            ? 'Pausada'
                            : opportunity.status ===
                              'CLOSED'
                            ? 'Encerrada'
                            : 'Rascunho'}
                        </span>

                        <small>
                          {opportunity.vacancies}{' '}
                          {opportunity.vacancies ===
                          1
                            ? 'vaga'
                            : 'vagas'}
                        </small>

                      </div>

                      <div className="opportunity-date">
                        {formatDate(
                          opportunity.created_at,
                        )}
                      </div>

                      <button
                        type="button"
                        className="opportunity-arrow"
                        aria-label="Abrir oportunidade"
                      >
                        <ChevronRight size={18} />
                      </button>

                    </article>
                  ))}

              </div>
            )}

          </div>

        </section>

      </section>

    </main>
  )
}
