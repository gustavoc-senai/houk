import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Check,
  Eye,
  EyeOff,
  UserRound,
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { isValidEmail, normalizeEmail } from '../lib/validation'
import './Register.css'

type UserType = 'candidate' | 'contractor'

export default function Register() {
  const navigate = useNavigate()

  const [userType, setUserType] = useState<UserType>('candidate')

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setError('')
    setSuccess(false)

    if (password.length < 6) {
      setError('A senha precisa ter pelo menos 6 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    if (!fullName.trim()) {
      setError('Digite seu nome completo.')
      return
    }

    const normalizedEmail = normalizeEmail(email)

    if (!isValidEmail(normalizedEmail)) {
      setError('Digite um e-mail válido, como nome@exemplo.com.')
      return
    }

    setLoading(true)

    const { data, error: signUpError } =
      await supabase.auth.signUp({
        email: normalizedEmail,
        password,
        options: {
        data: {
            full_name: fullName.trim(),
            phone: phone.trim(),
            role: userType,
        },
        },
      })

    if (signUpError) {
      console.error(signUpError)

      if (
        signUpError.message.toLowerCase().includes('already registered')
      ) {
        setError('Este e-mail já está cadastrado.')
      } else if (signUpError.message.toLowerCase().includes('email')) {
        setError('Não foi possível validar o e-mail. Apague o campo e digite-o novamente.')
      } else {
        setError('Não foi possível criar a conta agora. Tente novamente em instantes.')
      }

      setLoading(false)
      return
    }

    if (!data.user) {
      setError('Não foi possível criar sua conta.')
      setLoading(false)
      return
    }

    /*
      O trigger do Supabase cria o perfil automaticamente
      com role = candidate.

      Para contratantes, a role será ajustada posteriormente
      através de um fluxo administrativo seguro.
    */

    setSuccess(true)
    setLoading(false)
  }

  return (
    <main className="register-page">

      {/* =========================================
          LADO ESQUERDO
      ========================================== */}

      <section className="register-showcase">

        <div className="register-background">
          <div className="register-circle register-circle-one" />
          <div className="register-circle register-circle-two" />
          <div className="register-grid" />
        </div>

        <div className="register-showcase-content">

          <button
            type="button"
            className="back-login"
            onClick={() => navigate('/login')}
          >
            <ArrowLeft size={17} />
            Voltar para o login
          </button>

          <div className="register-brand">

            <div className="register-logo">
              H
            </div>

            <span>HOUK</span>

          </div>

          <div className="register-presentation">

            <span className="register-label">
              COMEÇE SUA JORNADA
            </span>

            <h1>
              Oportunidades podem
              <strong> começar com você.</strong>
            </h1>

            <p>
              Crie seu perfil no HOUK e faça parte de uma
              plataforma que conecta pessoas e oportunidades
              de trabalho.
            </p>

            <div className="register-benefits">

              <div className="register-benefit">
                <div className="benefit-check">
                  <Check size={15} />
                </div>

                <span>
                  Perfil profissional completo
                </span>
              </div>

              <div className="register-benefit">
                <div className="benefit-check">
                  <Check size={15} />
                </div>

                <span>
                  Acesso a novas oportunidades
                </span>
              </div>

              <div className="register-benefit">
                <div className="benefit-check">
                  <Check size={15} />
                </div>

                <span>
                  Conexão entre profissionais e contratantes
                </span>
              </div>

            </div>

          </div>

          <div className="register-showcase-footer">
            HOUK · Conectando pessoas a oportunidades.
          </div>

        </div>

      </section>

      {/* =========================================
          FORMULÁRIO
      ========================================== */}

      <section className="register-section">

        <div className="register-container">

          <div className="register-mobile-brand">

            <div className="register-mobile-logo">
              H
            </div>

            <span>HOUK</span>

          </div>

          <div className="register-header">

            <span className="register-eyebrow">
              CRIAR CONTA
            </span>

            <h2>
              Faça parte do HOUK
            </h2>

            <p>
              Preencha seus dados para começar.
            </p>

          </div>

          {/* =====================================
              TIPO DE CONTA
          ====================================== */}

          <div className="account-type">

            <span className="account-type-label">
              Como você pretende usar o HOUK?
            </span>

            <div className="account-options">

              <button
                type="button"
                className={`account-option ${
                  userType === 'candidate'
                    ? 'active'
                    : ''
                }`}
                onClick={() => setUserType('candidate')}
              >

                <div className="account-option-icon">
                  <UserRound size={20} />
                </div>

                <div className="account-option-text">
                  <strong>
                    Quero trabalhar
                  </strong>

                  <span>
                    Encontrar oportunidades
                  </span>
                </div>

                {userType === 'candidate' && (
                  <div className="selected-check">
                    <Check size={13} />
                  </div>
                )}

              </button>

              <button
                type="button"
                className={`account-option ${
                  userType === 'contractor'
                    ? 'active'
                    : ''
                }`}
                onClick={() => setUserType('contractor')}
              >

                <div className="account-option-icon">
                  <BriefcaseBusiness size={20} />
                </div>

                <div className="account-option-text">
                  <strong>
                    Quero contratar
                  </strong>

                  <span>
                    Encontrar profissionais
                  </span>
                </div>

                {userType === 'contractor' && (
                  <div className="selected-check">
                    <Check size={13} />
                  </div>
                )}

              </button>

            </div>

          </div>

          {/* =====================================
              FORMULÁRIO
          ====================================== */}

          <form
            className="register-form"
            onSubmit={handleRegister}
          >

            <div className="form-row">

              <div className="register-field">

                <label htmlFor="fullName">
                  Nome completo
                </label>

                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(event) =>
                    setFullName(event.target.value)
                  }
                  placeholder="Seu nome completo"
                  autoComplete="name"
                  required
                />

              </div>

              <div className="register-field">

                <label htmlFor="phone">
                  Telefone
                </label>

                <input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value)
                  }
                  placeholder="(15) 99999-9999"
                  autoComplete="tel"
                />

              </div>

            </div>

            <div className="register-field">

              <label htmlFor="registerEmail">
                E-mail
              </label>

              <input
                id="registerEmail"
                type="email"
                value={email}
                onChange={(event) =>
                  setEmail(event.target.value)
                }
                onBlur={() => setEmail(normalizeEmail(email))}
                placeholder="seu@email.com"
                autoComplete="email"
                required
              />

            </div>

            <div className="form-row">

              <div className="register-field">

                <label htmlFor="registerPassword">
                  Senha
                </label>

                <div className="register-password">

                  <input
                    id="registerPassword"
                    type={
                      showPassword
                        ? 'text'
                        : 'password'
                    }
                    value={password}
                    onChange={(event) =>
                      setPassword(event.target.value)
                    }
                    placeholder="Mínimo 6 caracteres"
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    className="register-password-toggle"
                    onClick={() =>
                      setShowPassword(
                        (current) => !current,
                      )
                    }
                    aria-label={
                      showPassword
                        ? 'Ocultar senha'
                        : 'Mostrar senha'
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>

                </div>

              </div>

              <div className="register-field">

                <label htmlFor="confirmPassword">
                  Confirmar senha
                </label>

                <div className="register-password">

                  <input
                    id="confirmPassword"
                    type={
                      showConfirmPassword
                        ? 'text'
                        : 'password'
                    }
                    value={confirmPassword}
                    onChange={(event) =>
                      setConfirmPassword(
                        event.target.value,
                      )
                    }
                    placeholder="Repita sua senha"
                    autoComplete="new-password"
                    required
                  />

                  <button
                    type="button"
                    className="register-password-toggle"
                    onClick={() =>
                      setShowConfirmPassword(
                        (current) => !current,
                      )
                    }
                    aria-label={
                      showConfirmPassword
                        ? 'Ocultar senha'
                        : 'Mostrar senha'
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>

                </div>

              </div>

            </div>

            {error && (
              <div className="register-error">
                {error}
              </div>
            )}

            {success && (
              <div className="register-success">
                <div className="success-icon">
                  <Check size={16} />
                </div>

                <div>
                  <strong>
                    Conta criada com sucesso!
                  </strong>

                  <span>
                    {userType === 'candidate'
                      ? 'Sua conta de profissional está pronta.'
                      : 'Sua conta de contratante foi criada.'}
                  </span>
                </div>
              </div>
            )}

            <button
              type="submit"
              className="register-button"
              disabled={loading || success}
            >

              <span>
                {loading
                  ? 'Criando conta...'
                  : 'Criar minha conta'}
              </span>

              {!loading && !success && (
                <ArrowRight size={18} />
              )}

            </button>

          </form>

          <div className="register-login">

            <span>
              Já possui uma conta?
            </span>

            <button
              type="button"
              onClick={() => navigate('/login')}
            >
              Entrar no HOUK
            </button>

          </div>

          <p className="register-terms">
            Ao criar sua conta, você concorda com os
            termos de uso e a política de privacidade do HOUK.
          </p>

        </div>

      </section>

    </main>
  )
}
