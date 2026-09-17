import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  BriefcaseBusiness,
  Eye,
  EyeOff,
  UserRound,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { isValidEmail, normalizeEmail } from '../../lib/validation'
import './Login.css'

export default function Login() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError('')
    const normalizedEmail = normalizeEmail(email)

    if (!isValidEmail(normalizedEmail)) {
      setError('Digite um e-mail válido.')
      return
    }
    setLoading(true)

    const { data, error: loginError } =
      await supabase.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      })

    if (loginError) {
      setError('E-mail ou senha inválidos.')
      setLoading(false)
      return
    }

    if (!data.user) {
      setError('Não foi possível identificar o usuário.')
      setLoading(false)
      return
    }

    const { data: profile, error: profileError } =
      await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single()

    if (profileError || !profile) {
      setError('Perfil do usuário não encontrado.')
      setLoading(false)
      return
    }

    if (profile.role === 'candidate') {
      navigate('/candidato')
    } else if (profile.role === 'contractor') {
      navigate('/contratante')
    } else if (profile.role === 'admin') {
      navigate('/admin')
    } else {
      setError('Tipo de usuário inválido.')
    }

    setLoading(false)
  }

  return (
    <main className="login-page">

      {/* LADO ESQUERDO */}

      <section className="login-showcase">

        <div className="showcase-background">
          <div className="showcase-circle circle-one" />
          <div className="showcase-circle circle-two" />
          <div className="showcase-grid" />
        </div>

        <div className="showcase-content">

          <div className="showcase-brand">
            <div className="showcase-logo">
              H
            </div>

            <span>HOUK</span>
          </div>

          <div className="showcase-main">

            <span className="showcase-label">
              OPORTUNIDADES COMEÇAM AQUI
            </span>

            <h1>
              Encontre seu próximo
              <strong> passo profissional.</strong>
            </h1>

            <p>
              Conectamos profissionais, empresas e oportunidades
              de trabalho em um só lugar.
            </p>

            <div className="showcase-divider" />

            <div className="showcase-features">

              <div className="feature">
                <div className="feature-icon">
                  <UserRound size={19} />
                </div>

                <div>
                  <strong>Para profissionais</strong>
                  <span>Encontre oportunidades para o seu perfil.</span>
                </div>
              </div>

              <div className="feature">
                <div className="feature-icon">
                  <BriefcaseBusiness size={19} />
                </div>

                <div>
                  <strong>Para contratantes</strong>
                  <span>Encontre pessoas para fazer seu negócio crescer.</span>
                </div>
              </div>

            </div>

          </div>

          <div className="showcase-footer">
            <span>HOUK</span>
            <span>Conectando pessoas a oportunidades.</span>
          </div>

        </div>

      </section>

      {/* LADO DIREITO */}

      <section className="login-section">

        <div className="login-container">

          <div className="mobile-brand">

            <div className="mobile-logo">
              H
            </div>

            <span>HOUK</span>

          </div>

          <div className="login-header">

            <span className="login-eyebrow">
              BEM-VINDO DE VOLTA
            </span>

            <h2>
              Entre na sua conta
            </h2>

            <p>
              Acesse o HOUK e continue sua jornada profissional.
            </p>

          </div>

          <form
            className="login-form"
            onSubmit={handleLogin}
          >

            <div className="form-field">

              <label htmlFor="email">
                E-mail
              </label>

              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                onBlur={() => setEmail(normalizeEmail(email))}
                placeholder="Digite seu e-mail"
                autoComplete="email"
                required
              />

            </div>

            <div className="form-field">

              <div className="field-header">

                <label htmlFor="password">
                  Senha
                </label>

                <button
                    type="button"
                    className="forgot-password"
                    onClick={() => navigate('/esqueci-senha')}
                    >
                    Esqueci minha senha
                </button>

              </div>

              <div className="password-wrapper">

                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Digite sua senha"
                  autoComplete="current-password"
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword((current) => !current)
                  }
                  aria-label={
                    showPassword
                      ? 'Ocultar senha'
                      : 'Mostrar senha'
                  }
                >
                  {showPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>

              </div>

            </div>

            {error && (
              <div className="login-error">
                {error}
              </div>
            )}

            <button
              className="login-button"
              type="submit"
              disabled={loading}
            >
              <span>
                {loading
                  ? 'Entrando...'
                  : 'Entrar na minha conta'}
              </span>

              {!loading && (
                <ArrowRight size={18} />
              )}
            </button>

          </form>

          <div className="login-footer">

            <span>
              Ainda não possui uma conta?
            </span>

            <button
                type="button"
                className="create-account"
                onClick={() => navigate('/cadastro')}
                >
                Criar minha conta
            </button>
          </div>

          <div className="login-security">
            <span className="security-dot" />
            Seus dados estão protegidos pelo HOUK
          </div>

        </div>

      </section>

    </main>
  )
}
