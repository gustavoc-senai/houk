import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Mail,
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { isValidEmail, normalizeEmail } from '../../lib/validation'
import './ForgotPassword.css'

export default function ForgotPassword() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleResetPassword(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault()

    setError('')
    setSuccess(false)
    const normalizedEmail = normalizeEmail(email)

    if (!isValidEmail(normalizedEmail)) {
      setError('Digite um e-mail válido.')
      return
    }
    setLoading(true)

    const { error: resetError } =
      await supabase.auth.resetPasswordForEmail(
        normalizedEmail,
        {
          redirectTo: `${window.location.origin}/redefinir-senha`,
        },
      )

    if (resetError) {
      console.error(resetError)
      setError(
        'Não foi possível enviar o e-mail. Verifique o endereço informado.',
      )
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  return (
    <main className="forgot-page">

      {/* LADO ESQUERDO */}

      <section className="forgot-showcase">

        <div className="forgot-background">
          <div className="forgot-circle forgot-circle-one" />
          <div className="forgot-circle forgot-circle-two" />
          <div className="forgot-grid" />
        </div>

        <div className="forgot-showcase-content">

          <button
            type="button"
            className="back-login"
            onClick={() => navigate('/login')}
          >
            <ArrowLeft size={17} />
            Voltar para o login
          </button>

          <div className="forgot-brand">

            <div className="forgot-logo">
              H
            </div>

            <span>HOUK</span>

          </div>

          <div className="forgot-presentation">

            <span className="forgot-label">
              RECUPERE O ACESSO
            </span>

            <h1>
              Sua jornada
              <strong> continua aqui.</strong>
            </h1>

            <p>
              Esqueceu sua senha? Não se preocupe.
              Vamos ajudar você a recuperar o acesso
              à sua conta HOUK.
            </p>

            <div className="forgot-benefits">

              <div className="forgot-benefit">

                <div className="forgot-benefit-icon">
                  <Mail size={17} />
                </div>

                <span>
                  Receba um link de recuperação por e-mail
                </span>

              </div>

              <div className="forgot-benefit">

                <div className="forgot-benefit-icon">
                  <Check size={17} />
                </div>

                <span>
                  Crie uma nova senha com segurança
                </span>

              </div>

            </div>

          </div>

          <div className="forgot-showcase-footer">
            HOUK · Conectando pessoas a oportunidades.
          </div>

        </div>

      </section>

      {/* LADO DIREITO */}

      <section className="forgot-section">

        <div className="forgot-container">

          <div className="forgot-mobile-brand">

            <div className="forgot-mobile-logo">
              H
            </div>

            <span>HOUK</span>

          </div>

          <div className="forgot-header">

            <span className="forgot-eyebrow">
              RECUPERAÇÃO DE SENHA
            </span>

            <h2>
              Esqueceu sua senha?
            </h2>

            <p>
              Informe seu e-mail e enviaremos um link
              para você criar uma nova senha.
            </p>

          </div>

          {!success ? (
            <form
              className="forgot-form"
              onSubmit={handleResetPassword}
            >

              <div className="forgot-field">

                <label htmlFor="forgotEmail">
                  E-mail
                </label>

                <div className="forgot-input-wrapper">

                  <Mail size={18} />

                  <input
                    id="forgotEmail"
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

              </div>

              {error && (
                <div className="forgot-error">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="forgot-button"
                disabled={loading}
              >
                <span>
                  {loading
                    ? 'Enviando...'
                    : 'Enviar link de recuperação'}
                </span>

                {!loading && (
                  <ArrowRight size={18} />
                )}
              </button>

            </form>
          ) : (
            <div className="forgot-success">

              <div className="forgot-success-icon">
                <Check size={25} />
              </div>

              <h3>
                E-mail enviado!
              </h3>

              <p>
                Enviamos as instruções de recuperação
                para <strong>{email}</strong>.
              </p>

              <p className="forgot-success-tip">
                Verifique também sua caixa de spam ou
                lixo eletrônico.
              </p>

              <button
                type="button"
                className="forgot-back-button"
                onClick={() => navigate('/login')}
              >
                Voltar para o login
              </button>

            </div>
          )}

          {!success && (
            <div className="forgot-login">

              <span>
                Lembrou da senha?
              </span>

              <button
                type="button"
                onClick={() => navigate('/login')}
              >
                Voltar para o login
              </button>

            </div>
          )}

          <div className="forgot-security">

            <span className="security-dot" />

            Seus dados estão protegidos pelo HOUK

          </div>

        </div>

      </section>

    </main>
  )
}
