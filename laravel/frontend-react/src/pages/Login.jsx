import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Globe, Lock, User, Shield, ArrowRight } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await login(username, password);
      if (!res.success) {
        setErrorMsg(res.message || 'Login gagal. Periksa username dan password Anda.');
      }
    } catch (err) {
      setErrorMsg('Gagal terhubung ke server.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = (u, p) => {
    setUsername(u);
    setPassword(p);
  };

  return (
    <div 
      className="min-vh-100 d-flex align-items-center justify-content-center p-3 position-relative overflow-hidden" 
      style={{ 
        background: 'radial-gradient(circle at 15% 20%, rgba(37, 99, 235, 0.35) 0%, transparent 45%), radial-gradient(circle at 85% 80%, rgba(99, 102, 241, 0.3) 0%, transparent 45%), radial-gradient(circle at 50% 50%, rgba(14, 165, 233, 0.15) 0%, transparent 60%), #0a0f1d'
      }}
    >
      {/* Decorative ambient blurred glow spheres */}
      <div 
        className="position-absolute rounded-circle"
        style={{
          width: '380px',
          height: '380px',
          background: 'rgba(37, 99, 235, 0.22)',
          filter: 'blur(90px)',
          top: '10%',
          left: '15%',
          pointerEvents: 'none'
        }}
      />
      <div 
        className="position-absolute rounded-circle"
        style={{
          width: '320px',
          height: '320px',
          background: 'rgba(129, 140, 248, 0.2)',
          filter: 'blur(80px)',
          bottom: '12%',
          right: '18%',
          pointerEvents: 'none'
        }}
      />

      <div className="container position-relative" style={{ maxWidth: '440px', zIndex: 10 }}>
        {/* Transparent Glassmorphism Card */}
        <div 
          className="border-0 rounded-4 overflow-hidden"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 30px 60px -12px rgba(0, 0, 0, 0.65), inset 0 1px 1px rgba(255, 255, 255, 0.3)',
            borderRadius: '24px'
          }}
        >
          {/* Transparent Header & Logo BSM */}
          <div 
            className="pt-4 pb-3 px-4 text-center d-flex flex-column align-items-center justify-content-center"
            style={{
              background: 'transparent',
              borderBottom: '1px solid rgba(255, 255, 255, 0.12)'
            }}
          >
            <img 
              src="./img/logo.png" 
              alt="Logo BSM" 
              className="img-fluid mb-2"
              style={{ 
                maxHeight: '52px', 
                maxWidth: '85%', 
                objectFit: 'contain',
                filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.3))'
              }}
              onError={(e) => { e.target.src = './pic/logo.png'; }}
            />
            <small className="text-white-50 fw-medium" style={{ fontSize: '0.72rem', letterSpacing: '0.06em' }}>
              OPERATIONS &amp; VALIDATION PORTAL
            </small>
          </div>

          <div className="card-body p-4 pt-3.5">
            {errorMsg && (
              <div 
                className="alert py-2 small mb-3 text-center border-0" 
                role="alert"
                style={{
                  background: 'rgba(239, 68, 68, 0.25)',
                  color: '#fecaca',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(239, 68, 68, 0.4)',
                  borderRadius: '10px'
                }}
              >
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label fw-semibold text-white small mb-1.5" style={{ fontSize: '0.8rem', letterSpacing: '0.01em' }}>
                  Username
                </label>
                <div className="input-group">
                  <span 
                    className="input-group-text border-0 text-white-50"
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.09)',
                      borderTopLeftRadius: '12px',
                      borderBottomLeftRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.18)',
                      borderRight: 'none'
                    }}
                  >
                    <User size={16} />
                  </span>
                  <input 
                    type="text" 
                    className="form-control border-0 text-white ps-1"
                    placeholder="Masukan username akun anda"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    style={{
                      background: 'rgba(255, 255, 255, 0.09)',
                      borderTopRightRadius: '12px',
                      borderBottomRightRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.18)',
                      borderLeft: 'none',
                      color: '#ffffff',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold text-white small mb-1.5" style={{ fontSize: '0.8rem', letterSpacing: '0.01em' }}>
                  Password
                </label>
                <div className="input-group">
                  <span 
                    className="input-group-text border-0 text-white-50"
                    style={{ 
                      background: 'rgba(255, 255, 255, 0.09)',
                      borderTopLeftRadius: '12px',
                      borderBottomLeftRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.18)',
                      borderRight: 'none'
                    }}
                  >
                    <Lock size={16} />
                  </span>
                  <input 
                    type="password" 
                    className="form-control border-0 text-white ps-1"
                    placeholder="Masukkan password akun Anda"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                      background: 'rgba(255, 255, 255, 0.09)',
                      borderTopRightRadius: '12px',
                      borderBottomRightRadius: '12px',
                      border: '1px solid rgba(255, 255, 255, 0.18)',
                      borderLeft: 'none',
                      color: '#ffffff',
                      fontSize: '0.85rem'
                    }}
                  />
                </div>
              </div>

              <button 
                type="submit" 
                className="btn w-100 py-2.5 fw-bold text-white shadow-lg d-flex align-items-center justify-content-center gap-2"
                disabled={loading}
                style={{
                  background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
                  borderRadius: '12px',
                  boxShadow: '0 8px 20px rgba(37, 99, 235, 0.45)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  fontSize: '0.9rem',
                  letterSpacing: '0.02em',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>{loading ? 'Memverifikasi Akun...' : 'Login'}</span>
                <ArrowRight size={16} />
              </button>
            </form>

            {/* Quick Demo Credentials */}
            <div 
              className="mt-4 pt-3 text-center"
              style={{
                borderTop: '1px solid rgba(255, 255, 255, 0.12)'
              }}
            >
              <span className="text-white-50 d-block small mb-2.5 fw-semibold" style={{ fontSize: '0.72rem', letterSpacing: '0.03em' }}>
                PILIHAN AKUN DEMO CEPAT:
              </span>
              <div className="d-flex flex-wrap gap-1.5 justify-content-center">
                <button 
                  type="button" 
                  className="btn btn-sm text-xs py-1 px-2.5 fw-semibold" 
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    color: '#fde047',
                    borderRadius: '8px'
                  }}
                  onClick={() => handleDemoClick('master', 'master123')}
                >
                  👑 Master
                </button>
                <button 
                  type="button" 
                  className="btn btn-sm text-xs py-1 px-2.5 fw-semibold" 
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    color: '#67e8f9',
                    borderRadius: '8px'
                  }}
                  onClick={() => handleDemoClick('pandu', 'manager123')}
                >
                  🛡️ Manager
                </button>
                <button 
                  type="button" 
                  className="btn btn-sm text-xs py-1 px-2.5 fw-semibold" 
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    color: '#93c5fd',
                    borderRadius: '8px'
                  }}
                  onClick={() => handleDemoClick('boya', 'zone123')}
                >
                  🌐 Zone Mgr
                </button>
                <button 
                  type="button" 
                  className="btn btn-sm text-xs py-1 px-2.5 fw-semibold" 
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    color: '#fca5a5',
                    borderRadius: '8px'
                  }}
                  onClick={() => handleDemoClick('cristian', 'spv123')}
                >
                  📌 SPV
                </button>
                <button 
                  type="button" 
                  className="btn btn-sm text-xs py-1 px-2.5 fw-semibold" 
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    color: '#a78bfa',
                    borderRadius: '8px'
                  }}
                  onClick={() => handleDemoClick('tl', 'tl123')}
                >
                  ⚡ Team Leader
                </button>
                <button 
                  type="button" 
                  className="btn btn-sm text-xs py-1 px-2.5 fw-semibold" 
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    color: '#fdba74',
                    borderRadius: '8px'
                  }}
                  onClick={() => handleDemoClick('driver', 'driver123')}
                >
                  🚗 Lapangan
                </button>
                <button 
                  type="button" 
                  className="btn btn-sm text-xs py-1 px-2.5 fw-semibold" 
                  style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.18)',
                    color: '#86efac',
                    borderRadius: '8px'
                  }}
                  onClick={() => handleDemoClick('himawan', 'finance123')}
                >
                  💰 Finance
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
