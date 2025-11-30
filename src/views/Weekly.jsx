import { useState, useEffect, useMemo } from 'react';
import { useGamification } from '../context/GamificationContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Label } from '../components/ui/Input';
import { BarChart3, TrendingUp, Calendar } from 'lucide-react';

export function Weekly() {
    const { history, xp } = useGamification();

    // --- Analytics Logic ---
    const last7Days = useMemo(() => {
        const days = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            days.push(d.toISOString().split('T')[0]);
        }
        return days;
    }, []);

    const dailyStats = useMemo(() => {
        return last7Days.map(date => {
            const dayDrills = history.filter(h => h.date === date);
            return {
                date,
                dayName: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
                count: dayDrills.length,
                xp: dayDrills.reduce((sum, d) => sum + (d.xp || 10), 0) // Approx XP if not saved directly
            };
        });
    }, [history, last7Days]);

    const maxDrills = Math.max(...dailyStats.map(d => d.count), 5); // Min scale of 5

    const weeklyTotal = dailyStats.reduce((sum, d) => sum + d.count, 0);
    const weeklyXp = Math.floor(weeklyTotal * 15); // Estimate

    // --- Goals Logic ---
    const [weeks, setWeeks] = useState(() => {
        const saved = localStorage.getItem('weeks');
        return saved ? JSON.parse(saved) : [];
    });

    useEffect(() => {
        localStorage.setItem('weeks', JSON.stringify(weeks));
    }, [weeks]);

    const [form, setForm] = useState({ num: '', focus: '', goal: '' });

    const handleSave = () => {
        if (!form.num || !form.focus) return;
        setWeeks(prev => [{ ...form, id: Date.now() }, ...prev]);
        setForm({ num: '', focus: '', goal: '' });
    };

    return (
        <div className="space-y-6">
            {/* Analytics Dashboard */}
            <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 flex flex-col items-center justify-center bg-gradient-to-br from-primary/20 to-bg-card border-primary/20">
                    <div className="p-2 bg-primary/20 rounded-full mb-2">
                        <BarChart3 className="w-5 h-5 text-primary" />
                    </div>
                    <div className="text-2xl font-black text-white">{weeklyTotal}</div>
                    <div className="text-[10px] font-bold text-text-muted uppercase">Drills (7d)</div>
                </Card>
                <Card className="p-4 flex flex-col items-center justify-center">
                    <div className="p-2 bg-white/5 rounded-full mb-2">
                        <TrendingUp className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="text-2xl font-black text-white">~{weeklyXp}</div>
                    <div className="text-[10px] font-bold text-text-muted uppercase">XP Earned</div>
                </Card>
            </div>

            {/* Chart */}
            <Card>
                <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-6 flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Activity (Last 7 Days)
                </h2>
                <div className="flex items-end justify-between h-32 gap-2">
                    {dailyStats.map((day, i) => (
                        <div key={day.date} className="flex flex-col items-center gap-2 flex-1 group">
                            <div className="w-full bg-white/5 rounded-t-sm relative h-full flex items-end overflow-hidden">
                                <div
                                    className="w-full bg-primary transition-all duration-1000 ease-out group-hover:bg-primary-light"
                                    style={{ height: `${(day.count / maxDrills) * 100}%` }}
                                />
                            </div>
                            <div className="text-[10px] font-bold text-text-muted uppercase">{day.dayName}</div>
                        </div>
                    ))}
                </div>
            </Card>

            {/* Goals Section */}
            <Card>
                <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">Set Weekly Focus</h2>
                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-1">
                            <Label>Week #</Label>
                            <Input
                                type="number"
                                placeholder="#"
                                value={form.num}
                                onChange={e => setForm({ ...form, num: e.target.value })}
                            />
                        </div>
                        <div className="col-span-2">
                            <Label>Focus Skill</Label>
                            <Input
                                placeholder="e.g. Drops"
                                value={form.focus}
                                onChange={e => setForm({ ...form, focus: e.target.value })}
                            />
                        </div>
                    </div>
                    <div>
                        <Label>Specific Goal</Label>
                        <Input
                            placeholder="e.g. Hit 50 drops in a row"
                            value={form.goal}
                            onChange={e => setForm({ ...form, goal: e.target.value })}
                        />
                    </div>
                    <Button onClick={handleSave}>Save Goal</Button>
                </div>
            </Card>

            {weeks.length > 0 && (
                <div className="space-y-3">
                    <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider">History</h2>
                    {weeks.map(w => (
                        <Card key={w.id} className="p-4 flex justify-between items-center">
                            <div>
                                <div className="font-bold text-primary text-sm">Week {w.num}: {w.focus}</div>
                                <div className="text-xs text-text-muted">{w.goal}</div>
                            </div>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
