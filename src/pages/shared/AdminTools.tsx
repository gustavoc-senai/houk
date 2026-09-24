import { useEffect, useState, type FormEvent } from 'react'
import { CheckCircle2, Pencil, Plus, Trash2, XCircle } from 'lucide-react'
import { supabase } from '../../lib/supabase'

type PendingOpportunity = { id: string; title: string; city: string | null; state: string | null; created_at: string }

export function ModerationPage() {
  const [items, setItems] = useState<PendingOpportunity[]>([])
  const [message, setMessage] = useState('')
  const [working, setWorking] = useState('')
  async function load() {
    const { data, error } = await supabase.from('opportunities').select('id, title, city, state, created_at').eq('status', 'DRAFT').order('created_at', { ascending: false })
    if (error) setMessage(`Não foi possível carregar a fila: ${error.message}`)
    else setItems(data ?? [])
  }
  useEffect(() => { void load() }, [])
  async function moderate(id: string, status: 'ACTIVE' | 'CLOSED') {
    setWorking(id); setMessage('')
    const { error } = await supabase.from('opportunities').update({ status, published_at: status === 'ACTIVE' ? new Date().toISOString() : null }).eq('id', id)
    if (error) setMessage(`Não foi possível atualizar: ${error.message}`)
    else setItems(current => current.filter(item => item.id !== id))
    setWorking('')
  }
  return <section className="workspace-card editor-card"><span className="section-eyebrow">MODERAÇÃO DE OPORTUNIDADES</span><h2>Fila de aprovação</h2><p>Oportunidades criadas por contratantes precisam de aprovação antes de ficarem visíveis aos candidatos.</p><div className="moderation-summary"><strong>{items.length}</strong><span>oportunidade(s) aguardando análise</span></div>{message && <p className="form-message">{message}</p>}{items.length === 0 ? <div className="empty-page compact"><CheckCircle2 size={28} /><h3>Fila em dia</h3><p>Não há oportunidades aguardando moderação.</p></div> : <div className="moderation-list">{items.map(item => <article key={item.id} className="moderation-item"><div><strong>{item.title}</strong><small>{[item.city, item.state].filter(Boolean).join(', ') || 'Local não informado'}</small></div><div><button className="workspace-secondary" disabled={working === item.id} onClick={() => void moderate(item.id, 'CLOSED')}><XCircle size={16} /> {working === item.id ? 'Processando...' : 'Recusar'}</button><button className="workspace-primary" disabled={working === item.id} onClick={() => void moderate(item.id, 'ACTIVE')}><CheckCircle2 size={16} /> Aprovar e publicar</button></div></article>)}</div>}</section>
}

type Category = { id: string; name: string; slug: string | null; description: string | null; icon: string | null; active: boolean }

export function CategoriesManager() {
  const [items, setItems] = useState<Category[]>([])
  const [editing, setEditing] = useState<Category | null>(null)
  const [form, setForm] = useState({ name: '', description: '', icon: '', active: true })
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)
  const slug = (value: string) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  async function load() { const { data, error } = await supabase.from('categories').select('id, name, slug, description, icon, active').order('name'); if (error) setMessage(`Não foi possível carregar categorias: ${error.message}`); else setItems(data ?? []) }
  useEffect(() => { void load() }, [])
  function startEdit(item: Category) { setEditing(item); setForm({ name: item.name, description: item.description ?? '', icon: item.icon ?? '', active: item.active }); setMessage('') }
  function reset() { setEditing(null); setForm({ name: '', description: '', icon: '', active: true }); setMessage('') }
  async function save(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setSaving(true); setMessage(''); const payload = { name: form.name.trim(), slug: slug(form.name), description: form.description.trim() || null, icon: form.icon.trim() || null, active: form.active }; const result = editing ? await supabase.from('categories').update(payload).eq('id', editing.id) : await supabase.from('categories').insert(payload); if (result.error) setMessage(`Não foi possível salvar: ${result.error.message}`); else { reset(); await load() }; setSaving(false) }
  async function remove(item: Category) { if (!window.confirm(`Excluir a categoria "${item.name}"?`)) return; setMessage(''); const { error } = await supabase.from('categories').delete().eq('id', item.id); if (error) setMessage(`Não foi possível excluir: ${error.message}`); else { if (editing?.id === item.id) reset(); await load() } }
  return <section className="workspace-card editor-card"><span className="section-eyebrow">CATEGORIAS</span><h2>Gerencie as categorias de oportunidades</h2><p>Crie, altere ou remova áreas profissionais usadas nas vagas.</p><form className="opportunity-form" onSubmit={save}><div className="opportunity-form-grid"><label className="form-field"><span>Nome *</span><input required value={form.name} onChange={e => setForm(current => ({ ...current, name: e.target.value }))} placeholder="Ex.: Tecnologia" /></label><label className="form-field"><span>Ícone</span><input value={form.icon} onChange={e => setForm(current => ({ ...current, icon: e.target.value }))} placeholder="Ex.: Code2" /></label><label className="form-field form-field-full"><span>Descrição</span><textarea rows={3} value={form.description} onChange={e => setForm(current => ({ ...current, description: e.target.value }))} /></label></div><label className="form-check"><input type="checkbox" checked={form.active} onChange={e => setForm(current => ({ ...current, active: e.target.checked }))} /><span>Categoria ativa e disponível em novas oportunidades.</span></label>{message && <p className="form-message">{message}</p>}<div className="form-actions">{editing && <button className="workspace-secondary" type="button" onClick={reset}>Cancelar edição</button>}<button className="workspace-primary" disabled={saving}><Plus size={16} />{saving ? 'Salvando...' : editing ? 'Salvar categoria' : 'Adicionar categoria'}</button></div></form><div className="categories-admin-list">{items.map(item => <article key={item.id}><div><strong>{item.name}</strong><small>{item.description || 'Sem descrição'} · {item.active ? 'Ativa' : 'Inativa'}</small></div><div><button className="workspace-secondary" type="button" onClick={() => startEdit(item)}><Pencil size={15} /> Editar</button><button className="danger-button" type="button" onClick={() => void remove(item)}><Trash2 size={15} /> Excluir</button></div></article>)}</div></section>
}
