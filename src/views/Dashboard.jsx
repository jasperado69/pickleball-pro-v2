import { useDrills } from '../context/DrillsContext';
import { Card } from '../components/ui/Card';
import { Target, Zap, Activity, Trophy } from 'lucide-react';

export function Dashboard({ onSelectCategory }) {
    const { drills } = useDrills();
    const categories = [...new Set(drills.map(d => d.category))].sort();

    // Helper to get icon based on category name (simple mapping)
    const getIcon = (cat) => {
        const lower = cat.toLowerCase();
        if (lower.includes('dink')) return Activity;
        if (lower.includes('drop')) return Target;
        if (lower.includes('serve') || lower.includes('drive')) return Zap;
        return Trophy;
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center space-y-2 py-4">
                <h2 className="text-2xl font-black text-white tracking-tight">
                    What are we training?
                </h2>
                <p className="text-text-muted text-sm">
                    Select a category to start logging
                </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {categories.map(cat => {
                    const Icon = getIcon(cat);
                    return (
                        <button
                            key={cat}
                            onClick={() => onSelectCategory(cat)}
                            className="group relative flex flex-col items-center justify-center p-6 rounded-2xl bg-bg-card border border-white/5 hover:border-primary/50 hover:bg-bg-card/80 transition-all active:scale-95 aspect-square shadow-lg"
                        >
                            <div className="mb-3 p-3 rounded-full bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                                <Icon className="w-8 h-8" />
                            </div>
                            <span className="font-bold text-white text-center text-sm group-hover:text-primary transition-colors">
                                {cat}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Quick Stats or Motivation could go here */}
            <Card className="bg-gradient-to-br from-primary/20 to-purple-500/20 border-primary/20">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary rounded-full text-white">
                        <Trophy className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="text-xs font-bold text-primary uppercase tracking-wider">Pro Tip</div>
                        <div className="text-sm text-white font-medium">
                            Consistency is key! Log at least one drill every day to keep your streak alive.
                        </div>
                    </div>
                </div>
            </Card>
        </div>
    );
}
