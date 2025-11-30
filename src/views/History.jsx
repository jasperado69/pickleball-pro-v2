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
                <Card key={item.id} className="p-4">
                    <div className="flex justify-between items-start">
                        <div>
                            <div className="font-bold text-base">{item.drill || item.drill_id || 'Unknown Drill'}</div>
                            <div className="text-xs text-text-muted mt-1">
                                {item.date || (item.created_at ? new Date(item.created_at).toLocaleDateString() : 'No Date')} • {item.category}
                            </div>
                            {(item.result || item.score) && (
                                <div className="text-sm mt-2 text-text-main">{item.result || item.score}</div>
                            )}
                        </div>
                        <div className="text-right">
                            {item.success && (
                                <div className="font-bold text-success">{item.success}%</div>
                            )}
                            <div className="inline-block px-2 py-0.5 rounded bg-white/5 text-xs text-text-muted mt-1">
                                {item.mastery}/5
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end mt-4 pt-3 border-t border-white/5">
                        <button
                            onClick={() => deleteEntry(item.id)}
                            className="text-text-muted hover:text-red-500 transition-colors p-2"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    </div>
                </Card>
            ))}
        </div>
    );
}
