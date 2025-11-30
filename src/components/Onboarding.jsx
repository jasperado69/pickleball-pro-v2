import { useState } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Target, TrendingUp, Trophy, ArrowRight } from 'lucide-react';

export function Onboarding({ onFinish }) {
    const [step, setStep] = useState(0);

    const steps = [
        {
            icon: <Trophy className="w-12 h-12 text-primary mb-4" />,
            title: "Welcome to Pickleball Pro",
            desc: "The ultimate training companion to track your drills, improve your DUPR, and level up your game."
        },
        {
            icon: <Target className="w-12 h-12 text-primary mb-4" />,
            title: "Log Your Drills",
            desc: "Choose from curated drills for Dinking, Volleys, and Serves. Track your success rate and earn XP."
        },
        {
            icon: <TrendingUp className="w-12 h-12 text-primary mb-4" />,
            title: "Track Progress",
            desc: "Watch your DUPR rating climb as you master skills. Unlock advanced drills as you level up!"
        }
    ];

    const handleNext = () => {
        if (step < steps.length - 1) {
            setStep(step + 1);
        } else {
            onFinish();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-bg-body animate-in fade-in">
            <Card className="w-full max-w-sm p-8 text-center flex flex-col items-center">
                <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
                    <div className="animate-in zoom-in duration-500 key={step}">
                        {steps[step].icon}
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-3 animate-in slide-in-from-bottom-2 duration-500 delay-100 key={step}-title">
                        {steps[step].title}
                    </h2>
                    <p className="text-text-muted leading-relaxed animate-in slide-in-from-bottom-2 duration-500 delay-200 key={step}-desc">
                        {steps[step].desc}
                    </p>
                </div>

                <div className="w-full space-y-6 mt-8">
                    <div className="flex justify-center gap-2">
                        {steps.map((_, i) => (
                            <div
                                key={i}
                                className={`w-2 h-2 rounded-full transition-all duration-300 ${i === step ? 'bg-primary w-6' : 'bg-white/10'
                                    }`}
                            />
                        ))}
                    </div>

                    <Button onClick={handleNext} className="w-full py-4 text-lg shadow-lg shadow-primary/20">
                        {step === steps.length - 1 ? "Get Started" : "Next"}
                        {step !== steps.length - 1 && <ArrowRight className="w-5 h-5 ml-2" />}
                    </Button>
                </div>
            </Card>
        </div>
    );
}
