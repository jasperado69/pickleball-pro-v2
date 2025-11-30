import { useGamification } from '../context/GamificationContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Trash2 } from 'lucide-react';

export function History() {
    const { history, deleteEntry } = useGamification();

    if (!history.length) {
        return (
            <Card className="text-center py-10">
                <p className="text-text-muted">No entries yet. Start training!</p>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-2">Recent Activity</h2>
            {history.map(item => (
                <Card key={item.id} className="p-3 relative group">
                    <div className="flex justify-between items-start pr-6">
                        <div>
                            <div className="font-bold text-sm">{item.drill || item.drill_id || 'Unknown Drill'}</div>
                            <div className="text-[10px] text-text-muted mt-0.5">
                                {item.created_at
                                    ? new Date(item.created_at).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
                                    : (item.date || 'No Date')} • {item.category}
                            </div>
                            {(item.result || item.score) && (
                                <div className="text-xs mt-1 text-text-main font-medium">{item.result || item.score}</div>
                            )}
                        </div>
                        <div className="text-right">
                            {item.success && (
                                <div className="font-bold text-success text-sm">{item.success}%</div>
                            )}
                            <div className="inline-block px-1.5 py-0.5 rounded bg-white/5 text-[10px] text-text-muted mt-1">
                                {item.mastery}/5
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (confirm('Delete this entry?')) deleteEntry(item.id);
                        }}
                        className="absolute top-2 right-2 text-text-muted/20 hover:text-red-500 transition-colors p-1"
                    >
                        <Trash2 className="w-3 h-3" />
                    </button>
                </Card>
            ))}
        </div>
    );
}
