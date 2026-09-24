import { useEffect, useRef, useState, type FormEvent } from 'react'
import { FileUp, Plus, Save } from 'lucide-react'
import { supabase } from '../../lib/supabase'

type ToolPage = 'experience' | 'education' | 'portfolio'

const pageCopy: Record<ToolPage, { title: string; description: string }> = {
  experience: { title: 'Adicionar experiência', description: 'Registre os trabalhos que fortalecem seu perfil.' },
  education: { title: 'Adicionar formação', description: 'Inclua cursos, graduações e certificações.' },
  portfolio: { title: 'Adicionar projeto ao portfólio', description: 'Mostre trabalhos e projetos relevantes.' },
}

export function ProfileEditor() {
  const [form, setForm] = useState({ full_name: '', phone: '', headline: '', bio: '', city: '', state: '', is_pcd: false })
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => { void (async () => {
    const { data: auth } = await supabase.auth.getUser(); if (!auth.user) return
    const { data } = await supabase.from('profiles').select('full_name, phone, headline, bio, city, state, is_pcd').eq('id', auth.user.id).single()
    if (data) setForm({ full_name: data.full_name ?? '', phone: data.phone ?? '', headline: data.headline ?? '', bio: data.bio ?? '', city: data.city ?? '', state: data.state ?? '', is_pcd: data.is_pcd ?? false })
  })() }, [])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage('')
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) { setMessage('Faça login para editar o perfil.'); setSaving(false); return }
    const { error } = await supabase.from('profiles').update({ ...form, state: form.state.toUpperCase() || null, profile_completed_at: new Date().toISOString() }).eq('id', auth.user.id)
    setMessage(error ? `Não foi possível salvar: ${error.message}` : 'Perfil atualizado com sucesso.')
    setSaving(false)
  }
  const set = (field: keyof typeof form, value: string | boolean) => setForm(current => ({ ...current, [field]: value }))
  return <section className="workspace-card editor-card"><span className="section-eyebrow">PERFIL PROFISSIONAL</span><h2>Edite seu perfil</h2><p>Essas informações ajudam empresas a conhecer você melhor.</p><form className="opportunity-form" onSubmit={submit}><div className="opportunity-form-grid"><label className="form-field"><span>Nome completo</span><input required value={form.full_name} onChange={e => set('full_name', e.target.value)} /></label><label className="form-field"><span>Telefone</span><input value={form.phone} onChange={e => set('phone', e.target.value)} /></label><label className="form-field form-field-full"><span>Título profissional</span><input value={form.headline} onChange={e => set('headline', e.target.value)} placeholder="Ex.: Assistente administrativo" /></label><label className="form-field form-field-full"><span>Sobre você</span><textarea rows={4} value={form.bio} onChange={e => set('bio', e.target.value)} placeholder="Conte um pouco sobre sua trajetória e objetivos." /></label><label className="form-field"><span>Cidade</span><input value={form.city} onChange={e => set('city', e.target.value)} /></label><label className="form-field"><span>UF</span><input maxLength={2} value={form.state} onChange={e => set('state', e.target.value)} /></label></div><label className="form-check"><input type="checkbox" checked={form.is_pcd} onChange={e => set('is_pcd', e.target.checked)} /><span>Quero informar que sou uma pessoa com deficiência (PCD).</span></label>{message && <p className="form-message">{message}</p>}<div className="form-actions"><button className="workspace-primary" disabled={saving}><Save size={16} />{saving ? 'Salvando...' : 'Salvar perfil'}</button></div></form></section>
}

export function CareerEditor({ page }: { page: ToolPage }) {
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({ company: '', title: '', description: '', institution: '', course: '', level: '', url: '', started_on: '', ended_on: '', current: false })
  const copy = pageCopy[page]
  const set = (field: keyof typeof form, value: string | boolean) => setForm(current => ({ ...current, [field]: value }))
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage('')
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) { setMessage('Faça login para continuar.'); setSaving(false); return }
    const result = page === 'experience'
      ? await supabase.from('experiences').insert({ candidate_id: auth.user.id, company: form.company, title: form.title, description: form.description || null, started_on: form.started_on, ended_on: form.current ? null : form.ended_on || null, current: form.current })
      : page === 'education'
        ? await supabase.from('educations').insert({ candidate_id: auth.user.id, institution: form.institution, course: form.course, level: form.level || null, started_on: form.started_on || null, ended_on: form.current ? null : form.ended_on || null, current: form.current })
        : await supabase.from('portfolios').insert({ candidate_id: auth.user.id, title: form.title, description: form.description || null, url: form.url })
    const { error } = result
    setMessage(error ? `Não foi possível salvar: ${error.message}` : 'Registro adicionado com sucesso.')
    if (!error) setForm({ company: '', title: '', description: '', institution: '', course: '', level: '', url: '', started_on: '', ended_on: '', current: false })
    setSaving(false)
  }
  return <section className="workspace-card editor-card"><span className="section-eyebrow">DESENVOLVIMENTO PROFISSIONAL</span><h2>{copy.title}</h2><p>{copy.description}</p><form className="opportunity-form" onSubmit={submit}><div className="opportunity-form-grid">{page === 'experience' && <><label className="form-field"><span>Empresa *</span><input required value={form.company} onChange={e => set('company', e.target.value)} /></label><label className="form-field"><span>Cargo *</span><input required value={form.title} onChange={e => set('title', e.target.value)} /></label></>}{page === 'education' && <><label className="form-field"><span>Instituição *</span><input required value={form.institution} onChange={e => set('institution', e.target.value)} /></label><label className="form-field"><span>Curso *</span><input required value={form.course} onChange={e => set('course', e.target.value)} /></label><label className="form-field form-field-full"><span>Nível</span><input value={form.level} onChange={e => set('level', e.target.value)} placeholder="Ex.: Técnico, graduação ou curso livre" /></label></>}{page === 'portfolio' && <><label className="form-field"><span>Nome do projeto *</span><input required value={form.title} onChange={e => set('title', e.target.value)} /></label><label className="form-field"><span>Link *</span><input required type="url" value={form.url} onChange={e => set('url', e.target.value)} placeholder="https://" /></label></>}{page !== 'portfolio' && <><label className="form-field"><span>Data de início *</span><input required type="date" value={form.started_on} onChange={e => set('started_on', e.target.value)} /></label><label className="form-field"><span>Data de término</span><input disabled={form.current} type="date" value={form.ended_on} onChange={e => set('ended_on', e.target.value)} /></label><label className="form-check form-field-full"><input type="checkbox" checked={form.current} onChange={e => set('current', e.target.checked)} /><span>Ainda estou nesta atividade.</span></label></>}<label className="form-field form-field-full"><span>Descrição</span><textarea rows={4} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Descreva suas atividades, aprendizados ou o projeto." /></label></div>{message && <p className="form-message">{message}</p>}<div className="form-actions"><button className="workspace-primary" disabled={saving}><Plus size={16} />{saving ? 'Salvando...' : 'Adicionar ao perfil'}</button></div></form></section>
}

export function ResumeUploader() {
  const input = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState('')
  const [uploading, setUploading] = useState(false)
  async function upload() {
    const file = input.current?.files?.[0]
    if (!file) { setMessage('Selecione um arquivo PDF.'); return }
    if (file.type !== 'application/pdf') { setMessage('Envie seu currículo em formato PDF.'); return }
    setUploading(true); setMessage('')
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) { setMessage('Faça login para enviar o currículo.'); setUploading(false); return }
    const path = `${auth.user.id}/curriculo-${Date.now()}.pdf`
    const { error: uploadError } = await supabase.storage.from('resumes').upload(path, file, { upsert: true })
    if (uploadError) { setMessage(`Não foi possível enviar: ${uploadError.message}`); setUploading(false); return }
    const { error } = await supabase.from('resumes').upsert({ candidate_id: auth.user.id, file_name: file.name, file_url: path, updated_at: new Date().toISOString() }, { onConflict: 'candidate_id' })
    setMessage(error ? `Arquivo enviado, mas não foi possível registrar: ${error.message}` : 'Currículo atualizado com sucesso.')
    setUploading(false)
  }
  return <section className="workspace-card editor-card"><span className="section-eyebrow">DOCUMENTOS</span><h2>Atualize seu currículo</h2><p>Envie um PDF atualizado para disponibilizá-lo nas suas candidaturas.</p><div className="document-upload"><FileUp size={28} /><input ref={input} type="file" accept="application/pdf" /><button className="workspace-primary" type="button" disabled={uploading} onClick={() => void upload()}>{uploading ? 'Enviando...' : 'Enviar currículo'}</button></div>{message && <p className="form-message">{message}</p>}</section>
}

export function SkillsEditor() {
  const [name, setName] = useState('')
  const [level, setLevel] = useState('3')
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  async function add() {
    if (!name.trim()) { setMessage('Informe uma competência.'); return }
    setSaving(true); setMessage('')
    const { data: auth } = await supabase.auth.getUser()
    if (!auth.user) { setMessage('Faça login para continuar.'); setSaving(false); return }
    const { data: existing, error: searchError } = await supabase.from('skills').select('id').eq('name', name.trim()).maybeSingle()
    let skill = existing
    if (!skill && !searchError) {
      const { data, error } = await supabase.from('skills').insert({ name: name.trim() }).select('id').single()
      if (error) { setMessage(`Não foi possível salvar: ${error.message}`); setSaving(false); return }
      skill = data
    }
    if (searchError || !skill) { setMessage(`Não foi possível salvar: ${searchError?.message ?? 'erro desconhecido'}`); setSaving(false); return }
    const { error } = await supabase.from('candidate_skills').upsert({ candidate_id: auth.user.id, skill_id: skill.id, level: Number(level) })
    setMessage(error ? `Não foi possível associar a competência: ${error.message}` : 'Competência adicionada ao seu perfil.')
    if (!error) setName('')
    setSaving(false)
  }
  return <section className="workspace-card editor-card"><span className="section-eyebrow">COMPETÊNCIAS</span><h2>Adicione uma competência</h2><p>Informe tecnologias, conhecimentos e habilidades que representam seu perfil.</p><div className="skill-editor"><input value={name} onChange={e => setName(e.target.value)} placeholder="Ex.: Excel, atendimento ou React" /><select value={level} onChange={e => setLevel(e.target.value)} aria-label="Nível de domínio"><option value="1">Nível 1 — básico</option><option value="2">Nível 2</option><option value="3">Nível 3 — intermediário</option><option value="4">Nível 4</option><option value="5">Nível 5 — avançado</option></select><button className="workspace-primary" disabled={saving} onClick={() => void add()}><Plus size={16} />Adicionar</button></div>{message && <p className="form-message">{message}</p>}</section>
}

export function PreferencesEditor() {
  const [form, setForm] = useState({ availability: '', salary_expectation: '', linkedin_url: '' })
  const [message, setMessage] = useState(''); const [saving, setSaving] = useState(false)
  useEffect(() => { void (async () => { const { data: auth } = await supabase.auth.getUser(); if (!auth.user) return; const { data } = await supabase.from('profiles').select('availability, salary_expectation, linkedin_url').eq('id', auth.user.id).single(); if (data) setForm({ availability: data.availability ?? '', salary_expectation: data.salary_expectation?.toString() ?? '', linkedin_url: data.linkedin_url ?? '' }) })() }, [])
  async function save(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSaving(true); setMessage(''); const { data: auth } = await supabase.auth.getUser(); if (!auth.user) { setMessage('Faça login para salvar preferências.'); setSaving(false); return }; const { error } = await supabase.from('profiles').update({ availability: form.availability || null, salary_expectation: form.salary_expectation ? Number(form.salary_expectation) : null, linkedin_url: form.linkedin_url || null }).eq('id', auth.user.id); setMessage(error ? `Não foi possível salvar: ${error.message}` : 'Preferências atualizadas.'); setSaving(false) }
  return <section className="workspace-card editor-card"><span className="section-eyebrow">PREFERÊNCIAS PROFISSIONAIS</span><h2>Defina suas preferências</h2><p>Essas informações ajudam a encontrar oportunidades mais alinhadas ao seu momento.</p><form className="opportunity-form" onSubmit={save}><div className="opportunity-form-grid"><label className="form-field"><span>Disponibilidade</span><select value={form.availability} onChange={e => setForm(current => ({ ...current, availability: e.target.value }))}><option value="">Não informar</option><option value="Imediata">Imediata</option><option value="Até 15 dias">Até 15 dias</option><option value="Até 30 dias">Até 30 dias</option><option value="A combinar">A combinar</option></select></label><label className="form-field"><span>Pretensão salarial</span><input min="0" step="0.01" type="number" value={form.salary_expectation} onChange={e => setForm(current => ({ ...current, salary_expectation: e.target.value }))} placeholder="0,00" /></label><label className="form-field form-field-full"><span>LinkedIn</span><input type="url" value={form.linkedin_url} onChange={e => setForm(current => ({ ...current, linkedin_url: e.target.value }))} placeholder="https://linkedin.com/in/seu-perfil" /></label></div>{message && <p className="form-message">{message}</p>}<div className="form-actions"><button className="workspace-primary" disabled={saving}><Save size={16} />{saving ? 'Salvando...' : 'Salvar preferências'}</button></div></form></section>
}
