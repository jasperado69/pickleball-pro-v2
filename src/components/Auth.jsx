import { useState } from 'react';
import { useUser } from '../context/UserContext';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Trophy } from 'lucide-react';

export function Auth() {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const { signIn, signUp } = useUser();

    const handleAuth = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            if (isLogin) {
                await signIn(email, password);
            } else {
                await signUp(email, password);
                alert('Check your email for the confirmation link!');
            }
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-bg-body flex items-center justify-center p-6">
            <Card className="w-full max-w-sm p-8 space-y-6 border-primary/20">
                <div className="text-center">
                    <Trophy className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white">Pickleball Pro</h1>
                    <p className="text-text-muted mt-2">
                        {isLogin ? 'Welcome back, pro!' : 'Join the revolution.'}
                    </p>
                </div>

                <form onSubmit={handleAuth} className="space-y-4">
                    <Input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <Input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    {error && (
                        <div className="text-red-400 text-sm text-center bg-red-400/10 p-2 rounded">
                            {error}
                        </div>
                    )}

                    <Button type="submit" className="w-full py-3" disabled={loading}>
                        {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Sign Up')}
                    </Button>
                </form>

                <div className="text-center text-sm text-text-muted">
                    {isLogin ? "Don't have an account? " : "Already have an account? "}
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-primary hover:underline font-bold"
                    >
                        {isLogin ? 'Sign Up' : 'Sign In'}
                    </button>
                </div>
            </Card>
        </div>
    );
}
