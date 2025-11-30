import { useState } from 'react';
import { useGamification } from '../context/GamificationContext';
import { useUser } from '../context/UserContext';
import { Flame, Trophy, PlusCircle, History, Calendar, User } from 'lucide-react';
import { cn } from '../lib/utils';

export function Layout({ children, activeTab, onTabChange }) {
    const { streak, level } = useGamification();
    const { user } = useUser();

    return (
        <div className="min-h-screen pb-24">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-bg-body/80 backdrop-blur-md border-b border-white/10 px-5 py-4 flex justify-between items-center">
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-text-muted bg-clip-text text-transparent">
                    Pickleball Pro
                </h1>
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-warning font-bold text-sm">
                        <Flame className="w-4 h-4 fill-current" />
                        <span>{streak}</span>
                    </div>
                    <div className="flex items-center gap-1 bg-primary/10 text-primary px-2.5 py-1 rounded-full border border-primary/20 text-xs font-bold">
                        <span>{level.current.name}</span>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="container max-w-md mx-auto p-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
                {children}
            </main>

            {/* Bottom Nav */}
            <nav className="fixed bottom-0 left-0 right-0 bg-bg-card/90 backdrop-blur-lg border-t border-white/10 pb-[env(safe-area-inset-bottom)] z-50">
                <div className="flex justify-around p-2">
                    <NavItem
                        icon={PlusCircle}
                        label="Log"
                        isActive={activeTab === 'log'}
                        onClick={() => onTabChange('log')}
                    />
                    <NavItem
                        icon={History}
                        label="History"
                        isActive={activeTab === 'history'}
                        onClick={() => onTabChange('history')}
                    />
                    <NavItem
                        icon={Trophy}
                        label="Rank"
                        isActive={activeTab === 'leaderboard'}
                        onClick={() => onTabChange('leaderboard')}
                    />
                    <NavItem
                        icon={Calendar}
                        label="Weekly"
                        isActive={activeTab === 'weekly'}
                        onClick={() => onTabChange('weekly')}
                    />
                    <NavItem
                        icon={User}
                        label="Profile"
                        isActive={activeTab === 'profile'}
                        onClick={() => onTabChange('profile')}
                    />
                </div>
            </nav>
        </div>
    );
}

function NavItem({ icon: Icon, label, isActive, onClick }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all w-16",
                isActive ? "text-primary bg-primary/10" : "text-text-muted hover:text-text-main"
            )}
        >
            <Icon className={cn("w-6 h-6 transition-transform", isActive && "scale-110")} />
            <span className="text-[10px] font-medium">{label}</span>
        </button>
    );
}
