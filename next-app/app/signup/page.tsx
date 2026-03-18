// app/signup/page.tsx - RESTORED FULL UI WITH PASSWORD TOGGLE
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import '../pages.css';

export default function Signup() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [userType, setUserType] = useState<'farmer' | 'dealer' | 'officer'>('farmer');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [passwordStrength, setPasswordStrength] = useState('weak');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    const type = searchParams.get('type');
    if (type === 'dealer' || type === 'officer' || type === 'farmer') {
      setUserType(type);
    }
  }, [searchParams]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'password') {
      let strength = 0;
      if (value.length >= 8) strength++;
      if (/[A-Z]/.test(value)) strength++;
      if (/[a-z]/.test(value)) strength++;
      if (/[0-9]/.test(value)) strength++;
      if (/[^A-Za-z0-9]/.test(value)) strength++;
      
      if (strength <= 2) setPasswordStrength('weak');
      else if (strength <= 4) setPasswordStrength('good');
      else setPasswordStrength('strong');
    }
    
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    
    if (!formData.fullName.trim()) {
      setError('Full name is required');
      return;
    }
    if (!formData.email.trim() || !/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          role: userType
        })
      });
      
      const result = await response.json();
      
      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(true);
        setFormData({ fullName: '', email: '', password: '', confirmPassword: '' });
        alert('Account created successfully!');
        setTimeout(() => router.push('/login'), 2000);
      }
    } catch (error: any) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'officer': return 'Market Officer';
      case 'dealer': return 'Agro-Dealer';
      case 'farmer': return 'Farmer';
      default: return 'User';
    }
  };

  // Eye Icon SVG component
  const EyeIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  );

  const EyeOffIcon = () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L5.136 5.136m13.728 13.728L14.122 14.122M17.657 16.657c.557-.691 1.012-1.466 1.343-2.315a10.022 10.022 0 00-18.317-7" />
    </svg>
  );

  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="auth-header">
          <Link href="/" className="back-home">
            <i className="fas fa-arrow-left"></i> Back to Home
          </Link>
          <div className="logo">
            <i className="fas fa-tractor"></i>
            <span>Agri Price</span>
          </div>
        </div>

        <div className="auth-card">
          <div className="auth-card-content">
            <div className="auth-card-header">
              <div className="user-type-indicator">
                <span className={`type-badge ${userType}`}>
                  <i className={`fas ${userType === 'officer' ? 'fa-user-tie' : userType === 'dealer' ? 'fa-store' : 'fa-seedling'}`}></i>
                  {getRoleDisplayName(userType)}
                </span>
              </div>
              <h1>Create your account</h1>
              <p className="auth-subtitle" style={{ color: '#666', marginTop: '0.5rem', fontSize: '0.9rem' }}>
                {userType === 'officer' 
                  ? 'Join as a certified market officer to help farmers and dealers thrive.'
                  : userType === 'dealer'
                  ? 'Join as an agro-dealer to connect with farmers and expand your business.'
                  : 'Join as a farmer to sell your produce directly to verified markets.'}
              </p>
            </div>

            {error && <div className="error-message"><i className="fas fa-exclamation-circle"></i> {error}</div>}
            {success && <div className="success-message"><i className="fas fa-check-circle"></i> Account created successfully! Redirecting to login...</div>}

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="fullName">Full Name *</label>
                <div className="input-wrapper" style={{ position: 'relative' }}>
                  <input type="text" id="fullName" name="fullName" placeholder="e.g. Johnathan Smith" value={formData.fullName} onChange={handleInputChange} required disabled={loading} style={{ width: '100%' }} />
                  <i className="fas fa-user" style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: '#ccc' }}></i>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <div className="input-wrapper" style={{ position: 'relative' }}>
                  <input type="email" id="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleInputChange} required disabled={loading} autoComplete="email" style={{ width: '100%' }} />
                  <i className="fas fa-envelope" style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', color: '#ccc' }}></i>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="password">Create Password *</label>
                <div className="password-input-wrapper" style={{ position: 'relative' }}>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    id="password" 
                    name="password" 
                    placeholder="Create a secure password" 
                    value={formData.password} 
                    onChange={handleInputChange} 
                    required 
                    disabled={loading} 
                    minLength={8} 
                    style={{ width: '100%', paddingRight: '45px' }}
                    autoComplete="new-password"
                  />
                  <i className="fas fa-lock" style={{ position: 'absolute', right: '40px', top: '50%', transform: 'translateY(-50%)', color: '#ccc', display: 'none' }}></i>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#666',
                      cursor: 'pointer',
                      padding: '5px',
                      zIndex: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
                <div className="password-strength">
                  <div className="strength-indicator"><div className={`strength-bar ${passwordStrength}`}></div></div>
                  <div className="strength-text-wrapper">
                    <span className="strength-text">Strength: </span>
                    <span className={`strength-value ${passwordStrength}`}>{passwordStrength.charAt(0).toUpperCase() + passwordStrength.slice(1)}</span>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password *</label>
                <div className="password-input-wrapper" style={{ position: 'relative' }}>
                  <input 
                    type={showConfirmPassword ? "text" : "password"} 
                    id="confirmPassword" 
                    name="confirmPassword" 
                    placeholder="Re-enter your password" 
                    value={formData.confirmPassword} 
                    onChange={handleInputChange} 
                    required 
                    disabled={loading} 
                    minLength={8} 
                    style={{ width: '100%', paddingRight: '45px' }}
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      color: '#666',
                      cursor: 'pointer',
                      padding: '5px',
                      zIndex: 10,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                    title={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <div className="form-group terms-agreement">
                <input type="checkbox" id="terms" required disabled={loading} />
                <label htmlFor="terms">By signing up, you agree to our <Link href="/terms">Terms of Service</Link> and <Link href="/privacy">Privacy Policy</Link></label>
              </div>

              <button type="submit" className={`btn btn-primary btn-auth ${userType}`} disabled={loading} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', color: 'white', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
                {loading ? 'Creating Account...' : `Create ${getRoleDisplayName(userType)} Account`}
              </button>

              <div className="auth-footer" style={{ textAlign: 'center', marginTop: '20px' }}>
                <p>Already have an account? <Link href="/login" style={{ color: '#059669', fontWeight: 'bold' }}>Log In</Link></p>
                <div className="switch-role" style={{ marginTop: '15px', borderTop: '1px solid #eee', paddingTop: '15px' }}>
                  <p style={{ fontSize: '0.85rem', color: '#666' }}>Not a {getRoleDisplayName(userType)}?</p>
                  <div className="role-links" style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginTop: '5px', flexWrap: 'wrap' }}>
                    <Link href="/signup?type=officer" onClick={() => setUserType('officer')} style={{ fontSize: '0.85rem', color: '#059669' }}>Join as Officer</Link>
                    <Link href="/signup?type=dealer" onClick={() => setUserType('dealer')} style={{ fontSize: '0.85rem', color: '#059669' }}>Join as Dealer</Link>
                    <Link href="/signup?type=farmer" onClick={() => setUserType('farmer')} style={{ fontSize: '0.85rem', color: '#059669' }}>Join as Farmer</Link>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
