import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff, FiUser, FiPhone } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { setUser } from '../../context/store';
import { authAPI } from '../../api';
import toast from 'react-hot-toast';

/* ── Shared Auth Shell ── */
function AuthShell({ title, subtitle, children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950 to-slate-900 flex items-center justify-center px-4 py-10">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_,i)=>(
          <motion.div key={i} className="absolute rounded-full bg-primary/10"
            style={{ width: 100+i*60, height: 100+i*60, top:`${10+i*15}%`, left:`${i%2===0?5:70}%` }}
            animate={{ y:[0,-20,0], rotate:[0,180,360] }}
            transition={{ duration: 8+i*2, repeat:Infinity, ease:'easeInOut', delay:i }}
          />
        ))}
      </div>
      <motion.div initial={{opacity:0,y:30,scale:0.97}} animate={{opacity:1,y:0,scale:1}} transition={{duration:0.5}}
        className="relative w-full max-w-md bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden">
        {/* Top accent */}
        <div className="h-2 bg-gradient-to-r from-primary via-accent to-primary"/>
        <div className="p-8">
          <Link to="/" className="flex items-center gap-2 mb-7">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">SS</span>
            </div>
            <span className="font-display font-bold text-secondary">Shommo<span className="text-primary">Store</span></span>
          </Link>
          <h1 className="font-display text-2xl font-bold text-secondary mb-1">{title}</h1>
          <p className="text-gray-500 text-sm mb-7">{subtitle}</p>
          {children}
        </div>
      </motion.div>
    </div>
  );
}

/* ── Input helper ── */
function Field({ label, icon:Icon, type='text', value, onChange, placeholder, error, right }) {
  return (
    <div>
      <label className="input-label">{label}</label>
      <div className="relative">
        <Icon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"/>
        <input type={type} value={value} onChange={onChange} placeholder={placeholder}
          className={`input-field pl-10 ${right?'pr-10':''} ${error?'border-red-400 focus:border-red-400':''}`}/>
        {right}
      </div>
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  );
}

/* ══════════════════════════════════════════
   LOGIN
══════════════════════════════════════════ */
export function LoginPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const [form,    setForm]    = useState({ email:'', password:'' });
  const [show,    setShow]    = useState(false);
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAPI.login(form);
      dispatch(setUser(data));
      toast.success(`Welcome back, ${data.name.split(' ')[0]}!`);
      navigate(data.role==='admin'?'/admin': data.role==='staff'?'/staff':'/');
    } catch(err) { toast.error(err.response?.data?.message||'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <AuthShell title="Welcome Back" subtitle="Sign in to your Shommo Store account">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Email Address" icon={FiMail} type="email" value={form.email} onChange={set('email')} placeholder="you@example.com"/>
        <Field label="Password" icon={FiLock} type={show?'text':'password'} value={form.password} onChange={set('password')} placeholder="Your password"
          right={<button type="button" onClick={()=>setShow(!show)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">{show?<FiEyeOff size={15}/>:<FiEye size={15}/>}</button>}/>
        <div className="flex justify-end">
          <Link to="/forgot-password" className="text-xs text-primary hover:underline">Forgot password?</Link>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-sm disabled:opacity-60">
          {loading ? <span className="flex items-center justify-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"/>Signing in...</span> : 'Sign In'}
        </button>
      </form>
      <div className="flex items-center gap-3 my-5"><span className="flex-1 h-px bg-gray-200"/><span className="text-xs text-gray-400">or</span><span className="flex-1 h-px bg-gray-200"/></div>
      <p className="text-center text-sm text-gray-500 mt-6">
        Don't have an account? <Link to="/register" className="text-primary font-semibold hover:underline">Create one</Link>
      </p>
    </AuthShell>
  );
}

/* ══════════════════════════════════════════
   REGISTER
══════════════════════════════════════════ */
export function RegisterPage() {
  const dispatch  = useDispatch();
  const navigate  = useNavigate();
  const [form,    setForm]    = useState({ name:'', email:'', phone:'', password:'', confirm:'' });
  const [show,    setShow]    = useState(false);
  const [errors,  setErrors]  = useState({});
  const [loading, setLoading] = useState(false);
  const set = k => e => { setForm(f=>({...f,[k]:e.target.value})); setErrors(er=>({...er,[k]:''})); };

  const validate = () => {
    const e = {};
    if (!form.name.trim())              e.name    = 'Name is required';
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (form.password.length < 6)       e.password= 'Min 6 characters';
    if (form.password !== form.confirm) e.confirm = 'Passwords do not match';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const { data } = await authAPI.register({ name:form.name, email:form.email, phone:form.phone, password:form.password });
      dispatch(setUser(data));
      toast.success('Account created! Welcome!');
      navigate('/');
    } catch(err) { toast.error(err.response?.data?.message||'Registration failed'); }
    finally { setLoading(false); }
  };

  return (
    <AuthShell title="Create Account" subtitle="Join Shommo Store — Bangladesh's premium shop">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Full Name" icon={FiUser} value={form.name} onChange={set('name')} placeholder="Your full name" error={errors.name}/>
        <Field label="Email Address" icon={FiMail} type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" error={errors.email}/>
        <Field label="Phone (optional)" icon={FiPhone} value={form.phone} onChange={set('phone')} placeholder="+880 1XXX-XXXXXX"/>
        <Field label="Password" icon={FiLock} type={show?'text':'password'} value={form.password} onChange={set('password')} placeholder="Min 6 characters" error={errors.password}
          right={<button type="button" onClick={()=>setShow(!show)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400">{show?<FiEyeOff size={15}/>:<FiEye size={15}/>}</button>}/>
        <Field label="Confirm Password" icon={FiLock} type="password" value={form.confirm} onChange={set('confirm')} placeholder="Repeat password" error={errors.confirm}/>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-sm disabled:opacity-60">
          {loading?'Creating account...':'Create Account'}
        </button>
      </form>
      <p className="text-center text-sm text-gray-500 mt-6">
        Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
      </p>
    </AuthShell>
  );
}

/* ══════════════════════════════════════════
   FORGOT PASSWORD
══════════════════════════════════════════ */
export function ForgotPassword() {
  const [email,   setEmail]   = useState('');
  const [sent,    setSent]    = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword({ email });
      setSent(true);
    } catch(err) { toast.error(err.response?.data?.message||'Error sending email'); }
    finally { setLoading(false); }
  };

  return (
    <AuthShell title="Reset Password" subtitle="Enter your email and we'll send a reset link">
      {sent ? (
        <div className="text-center py-4">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4"><span className="text-3xl">📧</span></div>
          <h3 className="font-bold text-gray-800 mb-2">Email Sent!</h3>
          <p className="text-sm text-gray-500 mb-6">Check your inbox for the reset link.</p>
          <Link to="/login" className="btn-primary px-6 py-2.5 text-sm">Back to Login</Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Email Address" icon={FiMail} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com"/>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-sm disabled:opacity-60">
            {loading?'Sending...':'Send Reset Link'}
          </button>
          <Link to="/login" className="block text-center text-sm text-primary hover:underline">Back to Login</Link>
        </form>
      )}
    </AuthShell>
  );
}

/* ══════════════════════════════════════════
   RESET PASSWORD
══════════════════════════════════════════ */
export function ResetPassword() {
  const { token } = require('react-router-dom').useParams();
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const [form,    setForm]    = useState({ password:'', confirm:'' });
  const [loading, setLoading] = useState(false);
  const set = k => e => setForm(f=>({...f,[k]:e.target.value}));

  const handleSubmit = async e => {
    e.preventDefault();
    if (form.password !== form.confirm) { toast.error('Passwords do not match'); return; }
    setLoading(true);
    try {
      const { data } = await authAPI.resetPassword(token, { password: form.password });
      dispatch(setUser(data));
      toast.success('Password reset successful!');
      navigate('/');
    } catch(err) { toast.error(err.response?.data?.message||'Reset failed'); }
    finally { setLoading(false); }
  };

  return (
    <AuthShell title="New Password" subtitle="Choose a strong new password">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="New Password" icon={FiLock} type="password" value={form.password} onChange={set('password')} placeholder="Min 6 characters"/>
        <Field label="Confirm Password" icon={FiLock} type="password" value={form.confirm} onChange={set('confirm')} placeholder="Repeat new password"/>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-sm disabled:opacity-60">
          {loading?'Resetting...':'Reset Password'}
        </button>
      </form>
    </AuthShell>
  );
}

export default LoginPage;
