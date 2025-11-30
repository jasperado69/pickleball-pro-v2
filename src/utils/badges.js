import { Trophy, Flame, Moon, Sun, Swords, Target, Zap, Crown } from 'lucide-react';

export const BADGES = [
    {
        id: 'first_steps',
        name: 'First Steps',
        description: 'Log your first drill',
        icon: Trophy,
        color: 'text-yellow-400',
        condition: (stats) => stats.totalDrills >= 1
    },
    {
        id: 'on_fire',
        name: 'On Fire',
        description: 'Achieve a 3-day streak',
        icon: Flame,
        color: 'text-orange-500',
        condition: (stats) => stats.streak >= 3
    },
    {
        id: 'night_owl',
        name: 'Night Owl',
        description: 'Log a drill after 8 PM',
        icon: Moon,
        color: 'text-indigo-400',
        condition: (stats, currentEntry) => {
            if (!currentEntry) return false;
            const hour = new Date(currentEntry.created_at).getHours();
            return hour >= 20; // 8 PM
        }
    },
    {
        id: 'early_bird',
        name: 'Early Bird',
        description: 'Log a drill before 8 AM',
        icon: Sun,
        color: 'text-amber-400',
        condition: (stats, currentEntry) => {
            if (!currentEntry) return false;
            const hour = new Date(currentEntry.created_at).getHours();
            return hour < 8; // 8 AM
        }
    },
    {
        id: 'warrior',
        name: 'Warrior',
        description: 'Log 100 total drills',
        icon: Swords,
        color: 'text-red-500',
        condition: (stats) => stats.totalDrills >= 100
    },
    {
        id: 'sharpshooter',
        name: 'Sharpshooter',
        description: 'Achieve 5/5 Mastery',
        icon: Target,
        color: 'text-green-400',
        condition: (stats, currentEntry) => currentEntry?.mastery === 5
    },
    {
        id: 'dedicated',
        name: 'Dedicated',
        description: 'Reach Level 10 (DUPR 3.0)',
        icon: Crown,
        color: 'text-purple-400',
        condition: (stats) => stats.xp >= 1000
    }
];
