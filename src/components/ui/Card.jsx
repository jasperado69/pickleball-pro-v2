import { cn } from '../../lib/utils';

export function Card({ className, children, ...props }) {
    return (
        <div className={cn("bg-bg-card border border-white/5 rounded-2xl p-5 shadow-lg", className)} {...props}>
            {children}
        </div>
    );
}
