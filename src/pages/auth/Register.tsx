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
import { supabase } from '../../lib/supabase'
import { isValidEmail, normalizeEmail } from '../../lib/validation'
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

  async function handleRegister(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setError('')
    setSuccess(false)

    // =========================================================
    // VALIDAÇÕES
    // =========================================================

    const trimmedName = fullName.trim()
    const trimmedPhone = phone.trim()
    const normalizedEmail = normalizeEmail(email)

    if (!trimmedName) {
      setError('Digite seu nome completo.')
      return
    }

    if (trimmedName.length < 3) {
      setError('Digite seu nome completo corretamente.')
      return
    }

    if (!isValidEmail(normalizedEmail)) {
      setError(
        'Digite um e-mail válido, como nome@exemplo.com.',
      )
      return
    }

    if (password.length < 6) {
      setError(
        'A senha precisa ter pelo menos 6 caracteres.',
      )
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)

    try {
      // =======================================================
      // CRIA USUÁRIO NO SUPABASE AUTH
      // =======================================================

      const { data, error: signUpError } =
        await supabase.auth.signUp({
          email: normalizedEmail,
          password,
          options: {
            data: {
              full_name: trimmedName,
              phone: trimmedPhone,
              role: userType,
            },
          },
        })

      // =======================================================
      // LOG PARA DEBUG
      // =======================================================

      console.log('HOUK — resultado do cadastro:', {
        data,
        error: signUpError,
        userType,
      })

      // =======================================================
      // ERRO DO SUPABASE
      // =======================================================

      if (signUpError) {
        console.error(
          'HOUK — erro completo do Supabase:',
          signUpError,
        )

        const message = signUpError.message.toLowerCase()

        if (
          message.includes('already registered') ||
          message.includes('user already registered')
        ) {
          setError(
            'Este e-mail já está cadastrado. Tente entrar ou use outro e-mail.',
          )
        } else if (
          message.includes(
            'database error saving new user',
          )
        ) {
          setError(
            `O banco rejeitou o cadastro.\n\nErro retornado pelo Supabase: ${signUpError.message}`,
          )
        } else if (
          message.includes('invalid email')
        ) {
          setError(
            'O e-mail informado não é válido.',
          )
        } else if (
          message.includes('password')
        ) {
          setError(
            `Problema com a senha: ${signUpError.message}`,
          )
        } else {
          setError(
            `Não foi possível criar a conta.\n\n${signUpError.message}`,
          )
        }

        setLoading(false)
        return
      }

      // =======================================================
      // SUPABASE NÃO RETORNOU USUÁRIO
      // =======================================================

      if (!data.user) {
        console.error(
          'HOUK — Supabase não retornou data.user:',
          data,
        )

        setError(
          'O cadastro não foi concluído porque o Supabase não retornou o usuário criado.',
        )

        setLoading(false)
        return
      }

      // =======================================================
      // SUCESSO
      // =======================================================

      console.log(
        'HOUK — usuário criado com sucesso:',
        data.user.id,
      )

      setSuccess(true)
      setLoading(false)

    } catch (caughtError) {
      console.error(
        'HOUK — erro inesperado no cadastro:',
        caughtError,
      )

      if (caughtError instanceof Error) {
        setError(
          `Erro inesperado ao criar a conta: ${caughtError.message}`,
        )
      } else {
        setError(
          'Não foi possível conectar ao serviço de cadastro. Verifique sua conexão e tente novamente.',
        )
      }

      setLoading(false)
    }
  }

  return (
    <main className="register-page">

      {/* =====================================================
          LADO ESQUERDO
      ====================================================== */}

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
              COMECE SUA JORNADA
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

      {/* =====================================================
          FORMULÁRIO
      ====================================================== */}

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

          {/* =================================================
              TIPO DE CONTA
          ================================================== */}

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
                onClick={() =>
                  setUserType('candidate')
                }
                disabled={loading}
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
                onClick={() =>
                  setUserType('contractor')
                }
                disabled={loading}
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

          {/* =================================================
              FORMULÁRIO
          ================================================== */}

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
                  disabled={loading}
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
                  disabled={loading}
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
                onBlur={() =>
                  setEmail(normalizeEmail(email))
                }
                placeholder="seu@email.com"
                autoComplete="email"
                required
                disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
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
                    disabled={loading}
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

            {/* =================================================
                ERRO
            ================================================== */}

            {error && (
              <div
                className="register-error"
                role="alert"
              >
                {error}
              </div>
            )}

            {/* =================================================
                SUCESSO
            ================================================== */}

            {success && (
              <div
                className="register-success"
                role="status"
              >

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

                  <span>
                    {`E-mail: ${normalizeEmail(email)}`}
                  </span>

                </div>

              </div>
            )}

            {/* =================================================
                BOTÃO
            ================================================== */}

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
              disabled={loading}
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