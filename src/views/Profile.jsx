import { useState } from 'react';
import { useGamification } from '../context/GamificationContext';
import { useUser } from '../context/UserContext';
import { supabase } from '../lib/supabase';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LogOut, User, Trophy, Flame, Zap } from 'lucide-react';
import { BADGES } from '../utils/badges';

export function Profile() {
    const { xp, level, streak, history, badges: earnedBadges } = useGamification();
    const { user, profile, updateProfile, signOut } = useUser();

    // State for editing current user
    const [isEditing, setIsEditing] = useState(false);
    const [editName, setEditName] = useState('');

    const totalDrills = history.length;
    const avgMastery = totalDrills
        ? (history.reduce((a, b) => a + (b.mastery || 0), 0) / totalDrills).toFixed(1)
        : '-';

    const startEditing = () => {
        setEditName(profile?.username || '');
        setIsEditing(true);
    };

    const saveProfile = async () => {
        if (editName.trim()) {
            await updateProfile({ username: editName });
            setIsEditing(false);
        }
    };

    const handleDuprChange = (e) => {
        const newDupr = parseFloat(e.target.value);
        updateProfile({ dupr_rating: newDupr });
    };

    // Feedback State
    const [showFeedback, setShowFeedback] = useState(false);
    const [feedbackText, setFeedbackText] = useState('');

    const handleSendFeedback = () => {
        if (!feedbackText.trim()) return;

        // Construct email link
        const subject = encodeURIComponent("Pickleball Pro Feedback");
        const body = encodeURIComponent(feedbackText);
        window.location.href = `mailto:jkirsch@clr-space.com?subject=${subject}&body=${body}`;

        setFeedbackText('');
        setShowFeedback(false);
    };

    return (
        <div className="space-y-6 pb-24">
            {/* Profile Header */}
            <Card className="p-4 flex items-center justify-between bg-bg-card/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-full text-primary">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="text-xs text-text-muted font-bold uppercase">Player</div>
                        <div className="font-bold text-lg text-white">
                            {profile?.username || user?.email?.split('@')[0]}
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={startEditing}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors text-text-muted hover:text-white"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
                    </button>
                    <button
                        onClick={signOut}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors text-red-400 hover:text-red-300"
                    >
                        <LogOut className="w-5 h-5" />
                    </button>
                </div>
            </Card>

            {isEditing && (
                <Card className="p-4 animate-in fade-in slide-in-from-top-2 border-primary/50">
                    <div className="text-xs font-bold text-primary uppercase mb-2">Edit Profile</div>
                    <div className="flex gap-2">
                        <Input
                            value={editName}
                            onChange={e => setEditName(e.target.value)}
                            autoFocus
                        />
                        <Button className="w-auto px-6" onClick={saveProfile}>Save</Button>
                        <Button className="w-auto px-4 bg-white/5 text-text-muted" onClick={() => setIsEditing(false)}>Cancel</Button>
                    </div>
                </Card>
            )}

            {/* Feedback Modal */}
            {showFeedback && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
                    <Card className="w-full max-w-md p-6 space-y-4 border-primary/20">
                        <h3 className="text-lg font-bold text-white">Send Feedback</h3>
                        <p className="text-sm text-text-muted">
                            Found a bug? Have a feature request? Let us know!
                        </p>
                        <textarea
                            className="w-full h-32 bg-bg-body border border-white/10 rounded-xl p-3 text-text-main focus:outline-none focus:border-primary resize-none"
                            placeholder="Type your message here..."
                            value={feedbackText}
                            onChange={e => setFeedbackText(e.target.value)}
                            autoFocus
                        />
                        <div className="flex gap-3">
                            <Button onClick={handleSendFeedback}>Send Email</Button>
                            <Button
                                className="bg-white/5 text-text-muted hover:bg-white/10"
                                onClick={() => setShowFeedback(false)}
                            >
                                Cancel
                            </Button>
                        </div>
                    </Card>
                </div>
            )}

            {/* DUPR Level Circle */}
            <div className="text-center py-6">
                <div className="w-24 h-24 mx-auto rounded-full border-4 border-primary flex items-center justify-center text-3xl font-black bg-primary/10 shadow-[0_0_30px_rgba(6,182,212,0.3)] mb-4 relative group">
                    {level.current.name.replace('DUPR ', '')}

                    <select
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        value={profile?.dupr_rating || 2.5}
                        onChange={handleDuprChange}
                    >
                        {[
                            { val: "2.5", xpReq: 0 },
                            { val: "3.0", xpReq: 1000 },
                            { val: "3.5", xpReq: 2500 },
                            { val: "4.0", xpReq: 5000 },
                            { val: "4.5", xpReq: 10000 },
                            { val: "5.0", xpReq: 20000 }
                        ].map(l => {
                            const isLocked = xp < l.xpReq;
                            return (
                                <option key={l.val} value={l.val}>
                                    {isLocked ? '🔒 ' : ''}{l.val}
                                </option>
                            );
                        })}
                    </select>
                    <div className="absolute bottom-0 right-0 bg-bg-card p-1 rounded-full border border-white/10 text-text-muted group-hover:text-primary transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" /></svg>
                    </div>
                </div>
                <h2 className="text-2xl font-bold text-white">{level.current.name}</h2>
                <div className="text-text-muted mt-1">{Math.floor(xp)} XP Total</div>
                <p className="text-xs text-text-muted/50 mt-2">(Tap circle to edit DUPR)</p>
            </div>

            {/* Level Progress */}
            <Card>
                <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">Level Progress</h2>
                <div className="flex justify-between text-xs font-medium mb-2">
                    <span>{Math.floor(xp)} XP</span>
                    <span>{level.next.xp || 'MAX'} XP</span>
                </div>
                <div className="h-2 bg-bg-body rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary transition-all duration-1000 ease-out"
                        style={{ width: `${level.progress}%` }}
                    />
                </div>
                <p className="text-center text-xs text-text-muted mt-3">
                    {Math.floor(level.next.xp - xp)} XP to next level
                </p>
            </Card>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-3">
                <StatBox label="Day Streak" value={`🔥 ${streak}`} />
                <StatBox label="Drills Logged" value={totalDrills} />
                <StatBox label="Avg Mastery" value={avgMastery} />
            </div>

            {/* Badges Section */}
            <div className="space-y-4 pt-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Trophy className="w-5 h-5 text-yellow-400" />
                    Badges
                </h2>
                <div className="grid grid-cols-3 gap-3">
                    {BADGES.map((badge) => {
                        const isEarned = earnedBadges.includes(badge.id);
                        return (
                            <div
                                key={badge.id}
                                className={`
                                    relative flex flex-col items-center text-center p-3 rounded-xl border transition-all
                                    ${isEarned
                                        ? 'bg-bg-card border-white/10'
                                        : 'bg-bg-card/30 border-transparent opacity-50 grayscale'}
                                `}
                            >
                                <div className={`p-2 rounded-full bg-white/5 mb-2 ${isEarned ? badge.color : 'text-gray-500'}`}>
                                    <badge.icon className="w-6 h-6" />
                                </div>
                                <div className={`text-xs font-bold ${isEarned ? 'text-white' : 'text-text-muted'}`}>
                                    {badge.name}
                                </div>
                                {isEarned && (
                                    <div className="text-[10px] text-text-muted leading-tight mt-1">
                                        {badge.description}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Developer Tools */}
            <Card className="p-4 border-yellow-400/20 bg-yellow-400/5">
                <h3 className="font-bold text-yellow-400 mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Developer Tools
                </h3>
                <div className="grid grid-cols-2 gap-3">
                    <Button
                        onClick={() => updateProfile({ dupr_rating: 5.0, xp: 20000 })}
                        className="w-full bg-yellow-400/10 text-yellow-400 hover:bg-yellow-400/20 border-yellow-400/50 text-xs"
                    >
                        ⚡ Unlock All
                    </Button>
                    <Button
                        onClick={() => updateProfile({ dupr_rating: 2.5, xp: 0 })}
                        className="w-full bg-red-400/10 text-red-400 hover:bg-red-400/20 border-red-400/50 text-xs"
                    >
                        🔒 Reset / Lock
                    </Button>
                    <Button
                        onClick={async () => {
                            const { data, error } = await supabase.from('drill_logs').select('*').limit(1);
                            if (error) alert(error.message);
                            else if (data.length) alert('Columns: ' + Object.keys(data[0]).join(', '));
                            else alert('Table is empty, cannot determine columns.');
                        }}
                        className="col-span-2 w-full bg-blue-400/10 text-blue-400 hover:bg-blue-400/20 border-blue-400/50 text-xs"
                    >
                        🐞 Debug DB Schema
                    </Button>
                </div>
            </Card>

            {/* Footer */}
            <div className="text-center pt-8 pb-4 space-y-2">
                <button
                    onClick={() => setShowFeedback(true)}
                    className="text-sm text-primary hover:text-primary/80 font-medium"
                >
                    Send Feedback
                </button>
                <div className="text-[10px] text-text-muted uppercase tracking-widest">
                    © Clr-Space LLC 2025. All Rights Reserved.
                </div>
            </div>
        </div>
    );
}

function StatBox({ label, value }) {
    return (
        <Card className="p-3 text-center flex flex-col justify-center items-center">
            <div className="text-lg font-bold text-text-main">{value}</div>
            <div className="text-[10px] font-bold text-text-muted uppercase mt-1">{label}</div>
        </Card>
    );
}
