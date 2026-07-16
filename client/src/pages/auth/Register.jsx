import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';

export default function Register() {
  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm({
    defaultValues: { role: 'user' },
  });
  const { register: doRegister } = useAuth();
  const navigate = useNavigate();
  const role = watch('role');

  const onSubmit = async (data) => {
    try {
      const user = await doRegister(data);
      if (user.role === 'owner') {
        toast.success('Registered! Your owner account is pending admin approval.');
        navigate('/login');
      } else {
        toast.success(`Welcome to ParkEase, ${user.name.split(' ')[0]}`);
        navigate('/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-md mx-auto px-4 pt-16 pb-16">
        <h1 className="text-2xl font-semibold mb-1">Create your account</h1>
        <p className="text-slate-500 text-sm mb-8">Book parking, or list your mall as an owner.</p>

        <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-4">
          <div>
            <label className="label">I am a...</label>
            <div className="grid grid-cols-2 gap-2">
              {['user', 'owner'].map((r) => (
                <label key={r} className={`border rounded-lg px-3 py-2.5 text-sm text-center cursor-pointer capitalize ${role === r ? 'border-signal bg-signal/5 text-signal' : 'border-slate-300'}`}>
                  <input type="radio" value={r} {...register('role')} className="hidden" />
                  {r === 'user' ? 'Driver' : 'Mall Owner'}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Full name</label>
            <input className="input" {...register('name', { required: true })} />
            {errors.name && <p className="text-rose text-xs mt-1">Name is required</p>}
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" {...register('email', { required: true })} />
            {errors.email && <p className="text-rose text-xs mt-1">Email is required</p>}
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" {...register('phone')} />
          </div>
          <div>
            <label className="label">Password</label>
            <input className="input" type="password" {...register('password', { required: true, minLength: 6 })} />
            {errors.password && <p className="text-rose text-xs mt-1">Minimum 6 characters</p>}
          </div>
          <button className="btn-primary w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-slate-500 text-center mt-6">
          Already have an account? <Link to="/login" className="text-signal hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
}
