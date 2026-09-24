import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  MapPin,
  Send,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

type PublisherRole = 'admin' | 'contractor'

type OpportunityDetails = {
  id: string
  title: string
  description: string | null
  responsibilities: string | null
  city: string | null
  state: string | null
  neighborhood: string | null
  opportunity_type: string | null
  work_model: string | null
  salary_min: number | null
  salary_max: number | null
  accepts_pcd: boolean | null
  pcd_exclusive: boolean | null
  status: string
  created_at: string
}

const basePath = (role: PublisherRole | 'candidate') =>
  role === 'admin' ? '/admin' : role === 'contractor' ? '/contratante' : '/candidato'

export function CreateOpportunityPage({ role }: { role: PublisherRole }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: '',
    description: '',
    responsibilities: '',
    opportunityType: 'CLT',
    workModel: 'PRESENTIAL',
    city: '',
    state: '',
    neighborhood: '',
    salaryMin: '',
    salaryMax: '',
  })
  const [acceptsPcd, setAcceptsPcd] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [message, setMessage] = useState('')

  const update = (field: keyof typeof form, value: string) =>
    setForm(current => ({ ...current, [field]: value }))

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setMessage('')

    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) {
      setMessage('Faça login para publicar uma oportunidade.')
      setSubmitting(false)
      return
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', auth.user.id)
      .single()

    if (profileError || !profile || profile.role !== role) {
      setMessage('Sua conta não possui permissão para publicar nesta área.')
      setSubmitting(false)
      return
    }

    const { data, error } = await supabase
      .from('opportunities')
      .insert({
        contractor_id: auth.user.id,
        title: form.title.trim(),
        description: form.description.trim(),
        responsibilities: form.responsibilities.trim() || null,
        opportunity_type: form.opportunityType,
        work_model: form.workModel,
        city: form.city.trim() || null,
        state: form.state.trim().toUpperCase() || null,
        neighborhood: form.neighborhood.trim() || null,
        salary_min: form.salaryMin ? Number(form.salaryMin) : null,
        salary_max: form.salaryMax ? Number(form.salaryMax) : null,
        accepts_pcd: acceptsPcd,
        status: role === 'admin' ? 'ACTIVE' : 'DRAFT',
        published_at:
          role === 'admin'
            ? new Date().toISOString()
            : null,
      })
      .select('id')
      .single()

    if (error) {
      setMessage(`Não foi possível publicar: ${error.message}`)
      setSubmitting(false)
      return
    }

    navigate(`${basePath(role)}/opportunity-details?id=${data.id}`)
  }

  return (
    <section className="opportunity-flow">
      <Link className="flow-back" to={`${basePath(role)}/opportunities`}>
        <ArrowLeft size={16} /> Voltar para oportunidades
      </Link>
      <div className="page-intro">
        <div>
          <span className="section-eyebrow">NOVA OPORTUNIDADE</span>
          <h2>Publique uma oportunidade</h2>
          <p>{role === 'admin' ? 'A oportunidade será publicada imediatamente.' : 'Após o envio, a oportunidade ficará aguardando a aprovação da administração.'}</p>
        </div>
      </div>

      <form className="opportunity-form workspace-card" onSubmit={submit}>
        <div className="opportunity-form-grid">
          <label className="form-field form-field-full">
            <span>Título da oportunidade *</span>
            <input value={form.title} onChange={e => update('title', e.target.value)} placeholder="Ex.: Desenvolvedor(a) Front-end" required />
          </label>
          <label className="form-field">
            <span>Tipo de contratação *</span>
            <select value={form.opportunityType} onChange={e => update('opportunityType', e.target.value)}><option value="CLT">CLT</option><option value="PJ">PJ</option><option value="APPRENTICE">Jovem aprendiz</option><option value="INTERNSHIP">Estágio</option><option value="FREELANCE">Freelance</option></select>
          </label>
          <label className="form-field">
            <span>Modalidade *</span>
            <select value={form.workModel} onChange={e => update('workModel', e.target.value)}><option value="PRESENTIAL">Presencial</option><option value="HYBRID">Híbrido</option><option value="REMOTE">Remoto</option></select>
          </label>
          <label className="form-field form-field-full">
            <span>Descrição *</span>
            <textarea value={form.description} onChange={e => update('description', e.target.value)} placeholder="Apresente a oportunidade, o time e o que a pessoa encontrará." required rows={5} />
          </label>
          <label className="form-field form-field-full">
            <span>Responsabilidades</span>
            <textarea value={form.responsibilities} onChange={e => update('responsibilities', e.target.value)} placeholder="Liste as principais atividades da função." rows={4} />
          </label>
          <label className="form-field">
            <span>Cidade</span>
            <input value={form.city} onChange={e => update('city', e.target.value)} placeholder="Ex.: Itapetininga" />
          </label>
          <label className="form-field">
            <span>UF</span>
            <input value={form.state} onChange={e => update('state', e.target.value)} placeholder="SP" maxLength={2} />
          </label>
          <label className="form-field">
            <span>Bairro</span>
            <input value={form.neighborhood} onChange={e => update('neighborhood', e.target.value)} placeholder="Opcional" />
          </label>
          <label className="form-field">
            <span>Faixa salarial inicial</span>
            <input type="number" min="0" step="0.01" value={form.salaryMin} onChange={e => update('salaryMin', e.target.value)} placeholder="0,00" />
          </label>
          <label className="form-field">
            <span>Faixa salarial final</span>
            <input type="number" min="0" step="0.01" value={form.salaryMax} onChange={e => update('salaryMax', e.target.value)} placeholder="0,00" />
          </label>
        </div>
        <label className="form-check">
          <input type="checkbox" checked={acceptsPcd} onChange={e => setAcceptsPcd(e.target.checked)} />
          <span>A oportunidade aceita candidatos PCD.</span>
        </label>
        {message && <p className="form-message" role="alert">{message}</p>}
        <div className="form-actions">
          <Link className="workspace-secondary" to={`${basePath(role)}/opportunities`}>Cancelar</Link>
          <button className="workspace-primary" type="submit" disabled={submitting}>
            <Send size={16} /> {submitting ? 'Publicando...' : 'Publicar oportunidade'}
          </button>
        </div>
      </form>
    </section>
  )
}

export function OpportunityDetailsPage({ role }: { role: PublisherRole | 'candidate' }) {
  const [params] = useSearchParams()
  const [opportunity, setOpportunity] = useState<OpportunityDetails | null>(null)
  const [error, setError] = useState('')
  const id = params.get('id')

  useEffect(() => {
    async function load() {
      if (!id) {
        setError('Nenhuma oportunidade foi selecionada.')
        return
      }
      const { data, error: queryError } = await supabase
        .from('opportunities')
        .select('id, title, description, responsibilities, city, state, neighborhood, opportunity_type, work_model, salary_min, salary_max, accepts_pcd, pcd_exclusive, status, created_at')
        .eq('id', id)
        .single()
      if (queryError) setError('Não foi possível carregar os detalhes desta oportunidade.')
      else setOpportunity(data)
    }
    void load()
  }, [id])

  if (error) return <section className="workspace-card error-box"><BriefcaseBusiness size={22} /><div><h2>Oportunidade indisponível</h2><p>{error}</p></div></section>
  if (!opportunity) return <section className="workspace-card loading-card"><div className="loading-dot" /><span>Carregando oportunidade...</span></section>

  const salary = opportunity.salary_min || opportunity.salary_max
    ? `${opportunity.salary_min ? `R$ ${opportunity.salary_min.toLocaleString('pt-BR')}` : 'R$ —'} a ${opportunity.salary_max ? `R$ ${opportunity.salary_max.toLocaleString('pt-BR')}` : 'R$ —'}`
    : 'A combinar'
  const location = [opportunity.neighborhood, opportunity.city, opportunity.state].filter(Boolean).join(', ') || 'Local não informado'

  return <section className="opportunity-flow">
    <Link className="flow-back" to={`${basePath(role)}/opportunities`}><ArrowLeft size={16} /> Voltar para oportunidades</Link>
    <article className="opportunity-detail workspace-card">
      <div className="opportunity-detail-heading">
        <span className="detail-card-icon"><BriefcaseBusiness size={22} /></span>
        <div><span className="section-eyebrow">OPORTUNIDADE</span><h2>{opportunity.title}</h2></div>
        <span className="status-badge status-green">{opportunity.status}</span>
      </div>
      <div className="opportunity-meta"><span><MapPin size={16} />{location}</span><span>{salary}</span>{opportunity.work_model && <span>{opportunity.work_model}</span>}{opportunity.opportunity_type && <span>{opportunity.opportunity_type}</span>}</div>
      <div className="opportunity-content"><div><h3>Sobre a oportunidade</h3><p>{opportunity.description || 'Descrição não informada.'}</p></div>
      {opportunity.responsibilities && <div><h3>Responsabilidades</h3><p className="pre-line">{opportunity.responsibilities}</p></div>}
      {(opportunity.accepts_pcd || opportunity.pcd_exclusive) && <div className="opportunity-inclusive"><CheckCircle2 size={18} /> Esta oportunidade é inclusiva para pessoas com deficiência.</div>}</div>
      {role === 'candidate' && opportunity.status === 'ACTIVE' && <div className="form-actions"><Link className="workspace-primary" to={`/candidato/apply?id=${opportunity.id}`}><Send size={16} /> Candidatar-se</Link></div>}
      {role === 'contractor' && <div className="form-actions"><Link className="workspace-primary" to={`/contratante/edit-opportunity?id=${opportunity.id}`}>Editar oportunidade</Link></div>}
    </article>
  </section>
}

type ApplicationRecord = {
  id: string
  candidate_id?: string
  status: string
  created_at: string
  opportunities: { title: string; city: string | null; state: string | null } | null
}

export function ApplyPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [opportunity, setOpportunity] = useState<{ id: string; title: string } | null>(null)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const opportunityId = params.get('id')

  useEffect(() => {
    async function load() {
      if (!opportunityId) { setMessage('Selecione uma oportunidade antes de se candidatar.'); setLoading(false); return }
      const { data, error } = await supabase.from('opportunities').select('id, title').eq('id', opportunityId).eq('status', 'ACTIVE').single()
      if (error) setMessage('Esta oportunidade não está mais disponível.')
      else setOpportunity(data)
      setLoading(false)
    }
    void load()
  }, [opportunityId])

  async function apply() {
    if (!opportunity) return
    setSubmitting(true); setMessage('')
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) { setMessage('Faça login como candidato para continuar.'); setSubmitting(false); return }
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', auth.user.id).single()
    if (profile?.role !== 'candidate') { setMessage('Apenas contas de candidato podem se candidatar.'); setSubmitting(false); return }
    const { data: existing } = await supabase.from('applications').select('id').eq('candidate_id', auth.user.id).eq('opportunity_id', opportunity.id).maybeSingle()
    if (existing) { navigate(`/candidato/application-details?id=${existing.id}`); return }
    const { data, error } = await supabase.from('applications').insert({ candidate_id: auth.user.id, opportunity_id: opportunity.id, status: 'SENT' }).select('id').single()
    if (error) { setMessage(`Não foi possível enviar a candidatura: ${error.message}`); setSubmitting(false); return }
    navigate(`/candidato/application-success?id=${data.id}`)
  }

  if (loading) return <section className="workspace-card loading-card"><div className="loading-dot" /><span>Carregando oportunidade...</span></section>
  if (!opportunity) return <section className="workspace-card error-box"><BriefcaseBusiness size={22} /><div><h2>Candidatura indisponível</h2><p>{message}</p></div></section>
  return <section className="opportunity-flow"><Link className="flow-back" to={`/candidato/opportunity-details?id=${opportunity.id}`}><ArrowLeft size={16} /> Voltar aos detalhes</Link><article className="workspace-card confirmation-card"><CheckCircle2 size={30} /><span className="section-eyebrow">CANDIDATURA</span><h2>Pronto para se candidatar?</h2><p>Você enviará sua candidatura para <strong>{opportunity.title}</strong>. A empresa poderá consultar seu perfil profissional.</p>{message && <p className="form-message">{message}</p>}<div className="form-actions"><button className="workspace-primary" onClick={() => void apply()} disabled={submitting}><Send size={16} />{submitting ? 'Enviando...' : 'Enviar candidatura'}</button></div></article></section>
}

export function ApplicationSuccessPage() {
  const [params] = useSearchParams()
  return <section className="workspace-card confirmation-card"><CheckCircle2 size={34} /><span className="section-eyebrow">CANDIDATURA ENVIADA</span><h2>Tudo certo!</h2><p>Sua candidatura foi enviada. Você poderá acompanhar atualizações na área de candidaturas.</p><div className="form-actions"><Link className="workspace-secondary" to="/candidato/opportunities">Explorar oportunidades</Link><Link className="workspace-primary" to={`/candidato/application-details?id=${params.get('id') ?? ''}`}>Acompanhar candidatura</Link></div></section>
}

export function ApplicationDetailsPage({ role }: { role: 'candidate' | 'contractor' }) {
  const [params] = useSearchParams()
  const [application, setApplication] = useState<ApplicationRecord | null>(null)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const id = params.get('id')
  const base = basePath(role)

  useEffect(() => {
    async function load() {
      if (!id) { setMessage('Nenhuma candidatura foi selecionada.'); return }
      const { data, error } = await supabase.from('applications').select('id, candidate_id, status, created_at, opportunities(title, city, state)').eq('id', id).single()
      if (error) setMessage('Não foi possível carregar esta candidatura.')
      else setApplication({ ...data, opportunities: Array.isArray(data.opportunities) ? data.opportunities[0] ?? null : data.opportunities })
    }
    void load()
  }, [id])

  async function updateStatus(status: string) {
    if (!application) return
    setSaving(true)
    const { error } = await supabase.from('applications').update({ status }).eq('id', application.id)
    if (error) setMessage(`Não foi possível atualizar: ${error.message}`)
    else setApplication(current => current ? { ...current, status } : current)
    setSaving(false)
  }

  if (message && !application) return <section className="workspace-card error-box"><BriefcaseBusiness size={22} /><div><h2>Candidatura indisponível</h2><p>{message}</p></div></section>
  if (!application) return <section className="workspace-card loading-card"><div className="loading-dot" /><span>Carregando candidatura...</span></section>
  const location = [application.opportunities?.city, application.opportunities?.state].filter(Boolean).join(', ') || 'Local não informado'
  return <section className="opportunity-flow"><Link className="flow-back" to={`${base}/applications`}><ArrowLeft size={16} /> Voltar para candidaturas</Link><article className="workspace-card opportunity-detail"><div className="opportunity-detail-heading"><span className="detail-card-icon"><BriefcaseBusiness size={22} /></span><div><span className="section-eyebrow">CANDIDATURA</span><h2>{application.opportunities?.title ?? 'Oportunidade'}</h2></div><span className="status-badge status-blue">{application.status}</span></div><div className="opportunity-meta"><span><MapPin size={16} />{location}</span><span>Enviada em {new Intl.DateTimeFormat('pt-BR').format(new Date(application.created_at))}</span></div>{role === 'candidate' ? <p className="application-note">Acompanhe aqui as atualizações feitas pelo contratante. Você será notificado quando houver uma mudança de status.</p> : <div className="application-actions"><h3>Atualizar candidatura</h3>{application.candidate_id && <Link className="workspace-primary" to={`/contratante/candidate-details?id=${application.candidate_id}`}>Ver perfil do candidato</Link>}<div>{['VIEWED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED'].map(status => <button type="button" className="workspace-secondary" key={status} disabled={saving || application.status === status} onClick={() => void updateStatus(status)}>{status}</button>)}</div>{message && <p className="form-message">{message}</p>}</div>}</article></section>
}
