import { cn } from '../../lib/utils';

export function Button({ className, variant = 'primary', ...props }) {
    const variants = {
        primary: "bg-primary text-bg-body hover:brightness-110 shadow-[0_0_20px_rgba(6,182,212,0.3)]",
        outline: "bg-transparent border border-white/10 text-text-muted hover:bg-white/5",
        ghost: "bg-transparent text-text-muted hover:text-primary hover:bg-primary/10",
        danger: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
    };

    return (
        <button
            className={cn(
                "w-full py-3.5 px-4 rounded-xl font-bold text-base transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none",
                variants[variant],
                className
            )}
            {...props}
        />
    );
}
