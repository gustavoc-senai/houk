import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Eye, EyeOff, CheckCircle2, ArrowLeft } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import './ResetPassword.css'

function ResetPassword() {
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    setError('')

    if (password.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres.')
      return
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.updateUser({
      password,
    })

    setLoading(false)

    if (error) {
      setError('Não foi possível redefinir a senha. Tente novamente.')
      return
    }

    setSuccess(true)
  }

  if (success) {
    return (
      <main className="reset-page">
        <section className="reset-brand-panel">
          <div className="reset-brand-content">
            <div className="reset-logo">H</div>

            <span className="reset-brand-name">HOUK</span>

            <h1>
              Sua nova senha está
              <span> pronta.</span>
            </h1>

            <p>
              Sua conta está protegida com a nova senha.
              Agora você já pode voltar ao HOUK.
            </p>
          </div>
        </section>

        <section className="reset-form-panel">
          <div className="reset-card success-card">
            <div className="success-icon">
              <CheckCircle2 size={30} />
            </div>

            <h2>Senha alterada!</h2>

            <p>
              Sua senha foi redefinida com sucesso.
              Você já pode entrar novamente na sua conta.
            </p>

            <button
              type="button"
              className="reset-submit"
              onClick={() => navigate('/login')}
            >
              Voltar para o login
            </button>
          </div>
        </section>
      </main>
    )
  }

  return (
    <main className="reset-page">
      <section className="reset-brand-panel">
        <div className="reset-brand-content">
          <div className="reset-logo">H</div>

          <span className="reset-brand-name">HOUK</span>

          <h1>
            Recupere o acesso
            <span> à sua conta.</span>
          </h1>

          <p>
            Crie uma nova senha e continue conectado
            às oportunidades que combinam com você.
          </p>

          <div className="reset-info">
            <div className="reset-info-icon">
              <Lock size={19} />
            </div>

            <div>
              <strong>Conta protegida</strong>
              <span>
                Use uma senha que você não utiliza em outros serviços.
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="reset-form-panel">
        <div className="reset-card">
          <button
            type="button"
            className="back-login"
            onClick={() => navigate('/login')}
          >
            <ArrowLeft size={17} />
            Voltar para o login
          </button>

          <div className="reset-heading">
            <div className="reset-mobile-logo">H</div>

            <h2>Redefinir senha</h2>

            <p>
              Escolha uma nova senha para sua conta HOUK.
            </p>
          </div>

          {error && (
            <div className="reset-error">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="reset-field">
              <label htmlFor="password">
                Nova senha
              </label>

              <div className="reset-input-wrapper">
                <Lock size={18} />

                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Digite sua nova senha"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowPassword(!showPassword)
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

            <div className="reset-field">
              <label htmlFor="confirmPassword">
                Confirmar nova senha
              </label>

              <div className="reset-input-wrapper">
                <Lock size={18} />

                <input
                  id="confirmPassword"
                  type={
                    showConfirmPassword
                      ? 'text'
                      : 'password'
                  }
                  placeholder="Digite a senha novamente"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  disabled={loading}
                  required
                />

                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword(
                      !showConfirmPassword
                    )
                  }
                  aria-label={
                    showConfirmPassword
                      ? 'Ocultar senha'
                      : 'Mostrar senha'
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={18} />
                  ) : (
                    <Eye size={18} />
                  )}
                </button>
              </div>
            </div>

            <div className="password-rules">
              <span
                className={
                  password.length >= 6
                    ? 'valid'
                    : ''
                }
              >
                • Pelo menos 6 caracteres
              </span>

              <span
                className={
                  password &&
                  password === confirmPassword
                    ? 'valid'
                    : ''
                }
              >
                • As senhas devem coincidir
              </span>
            </div>

            <button
              type="submit"
              className="reset-submit"
              disabled={loading}
            >
              {loading
                ? 'Salvando...'
                : 'Redefinir senha'}
            </button>
          </form>

          <p className="reset-footer">
            Ao continuar, sua nova senha será aplicada
            à sua conta HOUK.
          </p>
        </div>
      </section>
    </main>
  )
}

export default ResetPassword