import { Trophy } from 'lucide-react';

export function SplashScreen({ onFinish }) {
    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg-body animate-out fade-out duration-700 fill-mode-forwards"
            onAnimationEnd={onFinish}>
            <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-xl rounded-full animate-pulse" />
                <Trophy className="w-24 h-24 text-primary relative z-10 animate-bounce" />
            </div>
            <h1 className="text-4xl font-black text-white mt-8 tracking-tighter">
                PICKLEBALL
                <span className="text-primary block text-center text-2xl">PRO</span>
            </h1>
            <div className="mt-8 flex gap-2">
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]" />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]" />
                <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
            </div>
            <div className="absolute bottom-8 text-xs text-text-muted uppercase tracking-widest">
                © Clr-Space LLC 2025
            </div>
        </div>
    );
}
