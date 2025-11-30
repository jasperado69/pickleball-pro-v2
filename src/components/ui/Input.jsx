import { cn } from '../../lib/utils';

export function Input({ className, ...props }) {
    return (
        <input
            className={cn(
                "w-full bg-bg-body border border-white/10 rounded-xl p-3.5 text-text-main placeholder:text-text-muted/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all",
                className
            )}
            {...props}
        />
    );
}

export function Select({ className, ...props }) {
    return (
        <select
            className={cn(
                "w-full bg-bg-body border border-white/10 rounded-xl p-3.5 text-text-main focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all appearance-none",
                className
            )}
            {...props}
        />
    );
}

export function Label({ className, children, ...props }) {
    return (
        <label className={cn("block text-sm font-medium text-text-muted mb-1.5 ml-1", className)} {...props}>
            {children}
        </label>
    );
}
