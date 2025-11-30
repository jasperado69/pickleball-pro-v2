import { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from './UserContext';
import { supabase } from '../lib/supabase';
import { triggerConfetti } from '../utils/confetti';
import { playSound } from '../utils/sound';
import { BADGES } from '../utils/badges';

const GamificationContext = createContext();

export function GamificationProvider({ children }) {
    const { user, profile, updateProfile } = useUser();
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [earnedBadges, setEarnedBadges] = useState([]);

    // Load history when user changes
    useEffect(() => {
        if (user) {
            fetchHistory();
        } else {
            setHistory([]);
            setEarnedBadges([]);
            setLoading(false);
        }
    }, [user]);

    // Load badges from profile
    useEffect(() => {
        if (profile?.badges) {
            setEarnedBadges(profile.badges);
        }
    }, [profile]);

    const fetchHistory = async () => {
        try {
            const { data, error } = await supabase
                .from('drill_logs')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setHistory(data);
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setLoading(false);
        }
    };

    const xp = profile?.xp || 0;
    const currentDupr = profile?.dupr_rating || 2.5;

    // Calculate Level based on XP
    const calculateLevel = (currentXp) => {
        const levels = [
            { name: 'DUPR 2.5', xp: 0 },
            { name: 'DUPR 3.0', xp: 1000 },
            { name: 'DUPR 3.5', xp: 2500 },
            { name: 'DUPR 4.0', xp: 5000 },
            { name: 'DUPR 4.5', xp: 10000 },
            { name: 'DUPR 5.0', xp: 20000 },
        ];

        const currentLevelIndex = levels.findIndex((l, i) =>
            currentXp >= l.xp && (!levels[i + 1] || currentXp < levels[i + 1].xp)
        );

        const currentLevel = levels[currentLevelIndex];
        const nextLevel = levels[currentLevelIndex + 1] || { name: 'MAX', xp: currentXp };

        const progress = nextLevel.name === 'MAX'
            ? 100
            : ((currentXp - currentLevel.xp) / (nextLevel.xp - currentLevel.xp)) * 100;

        return { current: currentLevel, next: nextLevel, progress };
    };

    const level = calculateLevel(xp);

    const addEntry = async (entry) => {
        if (!user) return;

        console.log("Saving entry:", entry);

        const newXp = xp + (entry.xp || 10);
        const newStreak = (profile?.streak || 0) + 1;
        const newTotalDrills = history.length + 1;

        // Check for new badges
        const currentStats = {
            xp: newXp,
            streak: newStreak,
            totalDrills: newTotalDrills
        };

        const entryWithTimestamp = { ...entry, created_at: new Date().toISOString() };

        const newBadges = BADGES.filter(badge => {
            if (earnedBadges.includes(badge.id)) return false; // Already earned
            return badge.condition(currentStats, entryWithTimestamp);
        }).map(b => b.id);

        const updatedBadges = [...earnedBadges, ...newBadges];

        try {
            // 1. Insert Drill Log
            // Try 'drill' column first (most likely based on previous attempts)
            let insertError = null;

            const { error: logError } = await supabase
                .from('drill_logs')
                .insert([{
                    user_id: user.id,
                    drill: entry.drill,
                    category: entry.category,
                    result: entry.result,
                    mastery: entry.mastery,
                    xp_earned: entry.xp || 10,
                    created_at: entryWithTimestamp.created_at
                }]);

            if (logError) {
                console.error("Insert Error (drill):", logError);
                // If 'drill' column doesn't exist, try 'drill_id' and 'score'
                if (logError.message.includes('column "drill" does not exist') || logError.message.includes('column "result" does not exist')) {
                    const { error: retryError } = await supabase
                        .from('drill_logs')
                        .insert([{
                            user_id: user.id,
                            drill_id: entry.drill,
                            category: entry.category,
                            score: entry.result,
                            mastery: entry.mastery,
                            xp_earned: entry.xp || 10,
                            created_at: entryWithTimestamp.created_at
                        }]);
                    if (retryError) throw retryError;
                } else {
                    throw logError;
                }
            }

            // 2. Update Profile Stats & Badges
            await updateProfile({
                xp: newXp,
                streak: newStreak,
                badges: updatedBadges
            });

            // 3. Update Local State
            setHistory(prev => [entry, ...prev]);
            setEarnedBadges(updatedBadges);

            // 4. Effects
            console.log("Triggering confetti!");
            triggerConfetti();
            playSound('coin');

            if (newBadges.length > 0) {
                playSound('levelup');
            }

            const oldLevel = calculateLevel(xp);
            const newLevelCalc = calculateLevel(newXp);
            if (newLevelCalc.current.name !== oldLevel.current.name) {
                playSound('levelup');
            }

        } catch (error) {
            console.error('Error logging drill:', error);
            alert(`Error saving drill: ${error.message}`);
        }
    };

    // Calculate Category Stats
    const categoryStats = history.reduce((acc, entry) => {
        const cat = entry.category || 'Uncategorized';
        acc[cat] = (acc[cat] || 0) + (entry.xp_earned || 0);
        return acc;
    }, {});

    const getCategoryLevel = (xp) => {
        if (xp < 100) return 1;
        if (xp < 500) return 2;
        if (xp < 1000) return 3;
        if (xp < 2500) return 4;
        return 5;
    };

    const deleteEntry = async (id) => {
        try {
            const { error } = await supabase
                .from('drill_logs')
                .delete()
                .eq('id', id);

            if (error) throw error;

            setHistory(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            console.error('Error deleting entry:', error);
        }
    };

    const value = {
        xp,
        level,
        history,
        streak: profile?.streak || 0,
        badges: earnedBadges,
        addEntry,
        deleteEntry,
        loading,
        categoryStats,
        getCategoryLevel
    };

    return (
        <GamificationContext.Provider value={value}>
            {!loading && children}
        </GamificationContext.Provider>
    );
}

export const useGamification = () => useContext(GamificationContext);
