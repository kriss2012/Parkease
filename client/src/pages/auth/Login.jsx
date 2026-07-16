import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';

export default function Login() {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();
  const { login } = useAuth();
  const navigate = useNavigate();

  const roleHome = { admin: '/admin', owner: '/owner', guard: '/guard', user: '/dashboard' };

  const onSubmit = async (data) => {
    try {
      const user = await login(data.email, data.password);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}`);
      navigate(roleHome[user.role] || '/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-md mx-auto px-4 pt-16">
        <h1 className="text-2xl font-semibold mb-1">Log in to ParkEase</h1>
        <p className="text-slate-500 text-sm mb-8">Reserve a spot before you even leave the house.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" {...register('email', { required: true })} />
            {errors.email && <p className="text-rose text-xs mt-1">Email is required</p>}
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" {...register('password', { required: true })} />
            {errors.password && <p className="text-rose text-xs mt-1">Password is required</p>}
          </div>
          <div className="flex justify-end">
            <Link to="/forgot-password" className="text-sm text-signal hover:underline">Forgot password?</Link>
          </div>
          <button className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <p className="text-sm text-slate-500 text-center mt-6">
          Don't have an account? <Link to="/register" className="text-signal hover:underline">Register</Link>
        </p>
      </div>
    </div>
  );
}
