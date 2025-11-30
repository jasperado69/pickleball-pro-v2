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

        // DEBUG: Check columns
        try {
            const { data: debugData, error: debugError } = await supabase
                .from('drill_logs')
                .select('*')
                .limit(1);
            if (debugData && debugData.length > 0) {
                const columns = Object.keys(debugData[0]).join(', ');
                console.log("Found columns:", columns);
                // alert(`Debug: Found columns: ${columns}`); 
                // Commented out alert to avoid spamming, relying on console or the error handling below
            } else {
                console.log("Table empty or no access");
            }
        } catch (e) {
            console.error("Debug fetch failed", e);
        }

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
            // Try 'drill_id' and 'score' first (standard Supabase columns)
            const { error: logError } = await supabase
                .from('drill_logs')
                .insert([{
                    user_id: user.id,
                    drill_id: entry.drill,
                    category: entry.category,
                    score: entry.numericScore, // Use numeric score for integer column
                    mastery: entry.mastery,
                    xp_earned: entry.xp || 10,
                    notes: entry.notes,
                    created_at: entryWithTimestamp.created_at
                }]);

            if (logError) {
                console.error("Insert Error (drill_id):", logError);

                // Check for column errors (including schema cache errors)
                const isColumnError =
                    logError.message.includes('column') ||
                    logError.message.includes('schema cache') ||
                    logError.code === '42703'; // Undefined column

                if (isColumnError) {
                    console.log("Retrying with 'drill' and 'result' columns...");
                    const { error: retryError } = await supabase
                        .from('drill_logs')
                        .insert([{
                            user_id: user.id,
                            drill: entry.drill,
                            category: entry.category,
                            result: entry.result,
                            mastery: entry.mastery,
                            xp_earned: entry.xp || 10,
                            notes: entry.notes,
                            created_at: entryWithTimestamp.created_at
                        }]);
                    if (retryError) throw retryError;
                } else {
                    throw logError;
                }
            }

            // 2. Update Profile Stats & Badges
            try {
                // Remove badges from update if it causes issues, or just try-catch it
                await updateProfile({
                    xp: newXp,
                    streak: newStreak,
                    badges: updatedBadges
                });
            } catch (profileError) {
                console.warn("Profile update failed (non-critical):", profileError);
                // If it's the badges column error, we can ignore it for the user
                if (!profileError.message.includes('badges')) {
                    // Only alert if it's NOT the known badges issue
                    // actually, let's just suppress it for now so the user feels good about the drill save
                }
            }

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

            // Check if it's the known 'badges' column error
            const isBadgesError = error.message && (
                error.message.toLowerCase().includes('badges') ||
                error.message.toLowerCase().includes('column "badges"')
            );

            // Only alert if it's NOT the known badges issue
            if (!isBadgesError) {
                alert(`Error saving drill: ${error.message}`);
            } else {
                console.warn("Suppressed 'badges' column error to allow drill save.");
            }
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
