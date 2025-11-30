import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useUser } from '../context/UserContext';
import { Card } from '../components/ui/Card';
import { Trophy, Medal, Crown } from 'lucide-react';

export default function Leaderboard() {
    const { user } = useUser();
    const [leaders, setLeaders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeaderboard();
    }, []);

    const fetchLeaderboard = async () => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('username, xp, dupr_rating, id')
                .order('xp', { ascending: false })
                .limit(50);

            if (error) throw error;
            setLeaders(data);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRankIcon = (index) => {
        if (index === 0) return <Crown className="w-5 h-5 text-yellow-400" />;
        if (index === 1) return <Medal className="w-5 h-5 text-gray-300" />;
        if (index === 2) return <Medal className="w-5 h-5 text-amber-600" />;
        return <span className="text-sm font-bold text-text-muted w-5 text-center">{index + 1}</span>;
    };

    return (
        <div className="space-y-6 pb-24">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-white">Leaderboard</h1>
                    <p className="text-text-muted">Top players by XP</p>
                </div>
                <div className="p-2 bg-yellow-400/10 rounded-full">
                    <Trophy className="w-6 h-6 text-yellow-400" />
                </div>
            </div>

            {loading ? (
                <div className="text-center py-12 text-text-muted">Loading rankings...</div>
            ) : (
                <div className="space-y-3">
                    {leaders.map((player, index) => {
                        const isCurrentUser = player.id === user?.id;
                        return (
                            <Card
                                key={player.id}
                                className={`p-4 flex items-center gap-4 ${isCurrentUser ? 'border-primary/50 bg-primary/5' : 'border-transparent'}`}
                            >
                                <div className="flex-shrink-0 w-8 flex justify-center">
                                    {getRankIcon(index)}
                                </div>
                                <div className="flex-grow">
                                    <div className={`font-bold ${isCurrentUser ? 'text-primary' : 'text-white'}`}>
                                        {player.username || 'Anonymous Player'}
                                    </div>
                                    <div className="text-xs text-text-muted">
                                        DUPR {player.dupr_rating || 'N/A'}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="font-bold text-white">{Math.floor(player.xp).toLocaleString()}</div>
                                    <div className="text-[10px] text-text-muted uppercase">XP</div>
                                </div>
                            </Card>
                        );
                    })}

                    {leaders.length === 0 && (
                        <div className="text-center py-12 text-text-muted">
                            No players found yet. Be the first!
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
