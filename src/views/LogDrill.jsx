import { useState, useEffect } from 'react';
import { useDrills } from '../context/DrillsContext';
import { useGamification } from '../context/GamificationContext';
import { useUser } from '../context/UserContext';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input, Select, Label } from '../components/ui/Input';
import { CheckCircle, Info, User, Lock, Target, Trophy } from 'lucide-react';

export function LogDrill() {
    const { drills } = useDrills();
    const { addEntry, xp, level, categoryStats, getCategoryLevel } = useGamification();
    const { activeUser } = useUser();

    // Curated Training State
    const [focusArea, setFocusArea] = useState(null); // null = All

    const categories = [...new Set(drills.map(d => d.category))].sort();

    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [category, setCategory] = useState(categories[0]);
    const [drillName, setDrillName] = useState('');

    // Smart Inputs
    const [inputVal, setInputVal] = useState('');
    const [checklist, setChecklist] = useState([]);
    const [notes, setNotes] = useState('');
    const [saved, setSaved] = useState(false);

    // Filter drills based on Focus Area OR selected Category
    const filteredDrills = drills.filter(d => {
        if (focusArea) return d.category === focusArea;
        return d.category === category;
    });

    // Auto-select first drill
    useEffect(() => {
        if (filteredDrills.length > 0) {
            setDrillName(filteredDrills[0].name);
        }
    }, [category, focusArea]);

    const selectedDrill = drills.find(d => d.name === drillName);

    // Check if locked
    const currentDupr = parseFloat(level.current.name.replace('DUPR ', '')) || 2.5;
    const isLocked = selectedDrill?.minDupr && selectedDrill.minDupr > currentDupr;

    // Category Level
    const currentCategoryXp = categoryStats[selectedDrill?.category || category] || 0;
    const currentCategoryLevel = getCategoryLevel(currentCategoryXp);

    // Reset inputs
    useEffect(() => {
        setInputVal('');
        setChecklist([]);
    }, [drillName]);

    // Auto-calculate Mastery & Result
    let calculatedMastery = 3;
    let calculatedSuccess = null;
    let resultString = '';

    if (selectedDrill) {
        if (selectedDrill.type === 'reps') {
            const val = Math.max(0, parseInt(inputVal) || 0);
            const total = selectedDrill.config.total;
            calculatedSuccess = Math.round((val / total) * 100);
            resultString = `${val}/${total} ${selectedDrill.config.unit}`;

            for (let m = 5; m >= 1; m--) {
                if (val >= selectedDrill.thresholds[m]) {
                    calculatedMastery = m;
                    break;
                }
            }
        } else if (selectedDrill.type === 'counter') {
            const val = Math.max(0, parseInt(inputVal) || 0);
            resultString = `${val} ${selectedDrill.config.unit}`;

            if (selectedDrill.config.inverse) {
                for (let m = 5; m >= 1; m--) {
                    if (val <= selectedDrill.thresholds[m]) {
                        calculatedMastery = m;
                        break;
                    }
                }
            } else {
                for (let m = 5; m >= 1; m--) {
                    if (val >= selectedDrill.thresholds[m]) {
                        calculatedMastery = m;
                        break;
                    }
                }
            }
        } else if (selectedDrill.type === 'checklist') {
            const checkedCount = checklist.length;
            resultString = `${checkedCount} goals met`;
            for (let m = 5; m >= 1; m--) {
                if (checkedCount >= selectedDrill.thresholds[m]) {
                    calculatedMastery = m;
                    break;
                }
            }
        }
    }

    const handleSubmit = () => {
        // Validation
        if (selectedDrill.type === 'checklist') {
            if (checklist.length === 0) {
                alert("Please check at least one goal before saving!");
                return;
            }
        } else {
            if (!inputVal || parseInt(inputVal) === 0) {
                alert(`Please enter your ${selectedDrill.config.unit} before saving!`);
                return;
            }
        }

        addEntry({
            id: Math.random().toString(36).slice(2),
            date,
            category: selectedDrill?.category || category,
            drill: drillName,
            result: resultString,
            mastery: calculatedMastery,
            success: calculatedSuccess,
            notes
        });
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);

        setInputVal('');
        setChecklist([]);
        setNotes('');
    };

    const toggleChecklist = (item) => {
        if (checklist.includes(item)) {
            setChecklist(checklist.filter(i => i !== item));
        } else {
            setChecklist([...checklist, item]);
        }
    };

    return (
        <div className="space-y-6">
            {/* Focus Selector */}
            {!focusArea ? (
                <div className="grid grid-cols-2 gap-3">
                    <button onClick={() => setFocusArea(null)} className="col-span-2 p-3 rounded-xl bg-primary text-white font-bold text-sm shadow-lg shadow-primary/20">
                        All Drills
                    </button>
                    {categories.slice(0, 4).map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFocusArea(cat)}
                            className="p-3 rounded-xl bg-bg-card border border-white/5 hover:border-primary/50 transition-all text-left"
                        >
                            <div className="text-[10px] uppercase text-text-muted font-bold mb-1">Focus</div>
                            <div className="font-bold text-sm text-white">{cat}</div>
                        </button>
                    ))}
                </div>
            ) : (
                <div className="flex items-center justify-between bg-primary/10 p-3 rounded-xl border border-primary/20">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary rounded-full text-white">
                            <Target className="w-4 h-4" />
                        </div>
                        <div>
                            <div className="text-[10px] uppercase text-primary font-bold">Current Focus</div>
                            <div className="font-bold text-white">{focusArea}</div>
                        </div>
                    </div>
                    <button onClick={() => setFocusArea(null)} className="text-xs text-text-muted hover:text-white underline">
                        Change
                    </button>
                </div>
            )}

            <Card>
                <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-4">
                    <h2 className="text-xs font-bold text-text-muted uppercase tracking-wider">New Entry</h2>

                    {/* Category Level Badge */}
                    <div className="flex items-center gap-2 text-xs font-bold text-yellow-400 bg-yellow-400/10 px-2 py-1 rounded-full border border-yellow-400/20">
                        <Trophy className="w-3 h-3" />
                        <span>{selectedDrill?.category || category} Lvl {currentCategoryLevel}</span>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <Label>Date</Label>
                        <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
                    </div>

                    {!focusArea && (
                        <div>
                            <Label>Category</Label>
                            <Select value={category} onChange={e => setCategory(e.target.value)}>
                                {categories.map(c => <option key={c}>{c}</option>)}
                            </Select>
                        </div>
                    )}

                    <div>
                        <Label>Drill</Label>
                        <Select value={drillName} onChange={e => setDrillName(e.target.value)}>
                            {filteredDrills.map(d => {
                                const isDrillLocked = d.minDupr && d.minDupr > currentDupr;
                                return (
                                    <option key={d.name} value={d.name}>
                                        {isDrillLocked ? '🔒 ' : ''}{d.name}
                                    </option>
                                );
                            })}
                        </Select>
                    </div>

                    {/* Drill Details & Media */}
                    {selectedDrill && (
                        <div className="bg-bg-body/50 rounded-xl border border-white/5 overflow-hidden">
                            {/* Media Player */}
                            {selectedDrill.media && (
                                <div className="w-full aspect-video bg-black relative">
                                    {selectedDrill.media.type === 'video' ? (
                                        <video
                                            src={selectedDrill.media.url}
                                            poster={selectedDrill.media.poster}
                                            controls
                                            className="w-full h-full object-cover"
                                        />
                                    ) : selectedDrill.media.type === 'youtube' ? (
                                        <iframe
                                            src={selectedDrill.media.url.replace('watch?v=', 'embed/').replace('youtu.be/', 'www.youtube.com/embed/')}
                                            title={selectedDrill.name}
                                            className="w-full h-full object-cover"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                        />
                                    ) : (
                                        <img
                                            src={selectedDrill.media.url}
                                            alt={selectedDrill.name}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                            )}

                            <div className="p-4 space-y-4">
                                {isLocked ? (
                                    <div className="flex flex-col items-center justify-center py-8 text-center space-y-3 opacity-50">
                                        <Lock className="w-8 h-8 text-text-muted" />
                                        <p className="text-sm font-medium text-text-muted">
                                            Reach DUPR {selectedDrill.minDupr} to view instructions
                                        </p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Instructions */}
                                        <div className="space-y-2">
                                            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Instructions</h3>
                                            {selectedDrill.instructions.map((step, i) => (
                                                <div key={i} className="flex gap-3 text-sm text-text-muted">
                                                    <span className="font-bold text-primary">{i + 1}</span>
                                                    <span>{step}</span>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Goal & Duration */}
                                        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                            <div>
                                                <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Goal</div>
                                                <div className="font-semibold text-sm text-white">{selectedDrill.goal}</div>
                                            </div>
                                            <div>
                                                <div className="text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Duration</div>
                                                <div className="font-semibold text-sm text-white">{selectedDrill.duration}</div>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Dynamic Inputs */}
                    {selectedDrill && (
                        <div className="bg-bg-body/50 p-4 rounded-xl border border-white/5 space-y-3">
                            {isLocked ? (
                                <div className="text-center py-6">
                                    <div className="text-3xl mb-2">🔒</div>
                                    <h3 className="font-bold text-white">Drill Locked</h3>
                                    <p className="text-sm text-text-muted">
                                        Requires DUPR {selectedDrill.minDupr}
                                    </p>
                                    <div className="text-xs text-primary mt-2">
                                        Current: {currentDupr}
                                    </div>
                                </div>
                            ) : (
                                <>
                                    {selectedDrill.type === 'reps' && (
                                        <div>
                                            <Label>Successful {selectedDrill.config.unit} (out of {selectedDrill.config.total})</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={inputVal}
                                                onChange={e => setInputVal(e.target.value)}
                                                placeholder="0"
                                            />
                                        </div>
                                    )}

                                    {selectedDrill.type === 'counter' && (
                                        <div>
                                            <Label>Total {selectedDrill.config.unit}</Label>
                                            <Input
                                                type="number"
                                                min="0"
                                                value={inputVal}
                                                onChange={e => setInputVal(e.target.value)}
                                                placeholder="0"
                                            />
                                        </div>
                                    )}

                                    {selectedDrill.type === 'checklist' && (
                                        <div className="space-y-2">
                                            <Label>Goals Achieved</Label>
                                            {selectedDrill.config.items.map(item => (
                                                <div
                                                    key={item}
                                                    onClick={() => toggleChecklist(item)}
                                                    className={`p-3 rounded-lg border cursor-pointer transition-all ${checklist.includes(item)
                                                        ? 'bg-primary/20 border-primary text-primary'
                                                        : 'bg-bg-body border-white/10 text-text-muted'
                                                        }`}
                                                >
                                                    {item}
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Live Preview */}
                                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-wider text-text-muted pt-2">
                                        <div>Mastery: <span className="text-white">{calculatedMastery}/5</span></div>
                                        {calculatedSuccess !== null && <div>Success: <span className="text-white">{calculatedSuccess}%</span></div>}
                                    </div>
                                </>
                            )}
                        </div>
                    )}

                    <div>
                        <Label>Notes</Label>
                        <textarea
                            className="w-full bg-bg-body border border-white/10 rounded-xl p-3.5 text-text-main placeholder:text-text-muted/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/50 transition-all min-h-[80px]"
                            placeholder="What worked? What to adjust?"
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            disabled={isLocked}
                        />
                    </div>

                    <Button
                        onClick={handleSubmit}
                        disabled={saved || isLocked}
                        className={saved ? "bg-green-500 text-white shadow-none" : ""}
                    >
                        {saved ? (
                            <span className="flex items-center justify-center gap-2">
                                <CheckCircle className="w-5 h-5" /> Saved! +XP
                            </span>
                        ) : isLocked ? "Locked" : "Save Entry"}
                    </Button>
                </div>
            </Card>


        </div>
    );
}
