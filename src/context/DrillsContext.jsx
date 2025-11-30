import { createContext, useContext, useState, useEffect } from 'react';

const DrillsContext = createContext();

const DEFAULT_DRILLS = [
    {
        category: "Serve & Return",
        name: "Deep Target Practice",
        description: "Alternate deep serves and deep returns crosscourt with your partner. Focus on depth and consistency.",
        goal: "8/10 serves and returns past the NVZ line",
        duration: "50 per side",
        type: "reps",
        media: {
            type: 'youtube',
            url: 'https://www.youtube.com/watch?v=J3N7t1eZgSE',
            poster: 'https://img.youtube.com/vi/J3N7t1eZgSE/maxresdefault.jpg'
        },
        config: { total: 10, unit: "serves" },
        thresholds: { 5: 9, 4: 8, 3: 6, 2: 4, 1: 0 },
        instructions: [
            "Partner stands at baseline.",
            "Serve deep to their backhand.",
            "They return deep to your backhand.",
            "Count how many land past the transition zone line."
        ]
    },
    {
        category: "Third Shot Drop",
        name: "Drop-to-Kitchen Drill",
        description: "Partner stands at NVZ; you hit third-shot drops aiming to land softly in the kitchen.",
        goal: "10 in a row without net/long",
        duration: "30 reps",
        type: "reps",
        media: {
            type: 'video',
            url: 'https://videos.pexels.com/video-files/4753337/4753337-hd_1920_1080_25fps.mp4',
            poster: 'https://images.pexels.com/photos/2277981/pexels-photo-2277981.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
        },
        config: { total: 10, unit: "drops" },
        thresholds: { 5: 10, 4: 8, 3: 6, 2: 4, 1: 0 },
        instructions: [
            "Partner feeds from NVZ.",
            "Hit a drop shot from baseline.",
            "Aim for the kitchen (no bounces high).",
            "Restart count if you miss."
        ]
    },
    {
        category: "Third Shot Drive",
        name: "Drive & Defend",
        description: "You drive third shots; partner blocks or resets into the kitchen.",
        goal: "≤2 unforced errors per rally",
        duration: "20 exchanges",
        type: "counter",
        media: {
            type: 'video',
            url: 'https://videos.pexels.com/video-files/5739227/5739227-hd_1920_1080_24fps.mp4',
            poster: 'https://images.pexels.com/photos/13061327/pexels-photo-13061327.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
        },
        config: { unit: "errors", inverse: true }, // Inverse means lower is better
        thresholds: { 5: 0, 4: 2, 3: 4, 2: 6, 1: 100 },
        instructions: [
            "Drive the ball low over the net.",
            "Partner blocks it back.",
            "Count your unforced errors (net/out)."
        ]
    },
    {
        category: "Dinking",
        name: "Crosscourt Dink Battle",
        description: "Crosscourt dinks only. Vary height and spin while staying low and balanced.",
        goal: "15 consecutive dinks each",
        duration: "5 rounds",
        type: "counter",
        media: {
            type: 'image',
            url: 'https://media.giphy.com/media/3o7btXkbsV26U95U08/giphy.gif',
            poster: ''
        },
        config: { unit: "consecutive dinks" },
        thresholds: { 5: 20, 4: 15, 3: 10, 2: 5, 1: 0 },
        instructions: [
            "Both players at NVZ.",
            "Dink crosscourt only.",
            "Count the longest rally of the set."
        ]
    },
    {
        category: "Dinking",
        name: "Dink to Attack Recognition",
        description: "Alternate soft dinks until one player gets an attackable ball, then finish the point.",
        goal: "Recognize 80% attackable balls",
        duration: "20 points",
        type: "reps",
        media: {
            type: 'youtube',
            url: 'https://www.youtube.com/watch?v=cM3tCqjTzT0', // Dinking Strategy
            poster: 'https://img.youtube.com/vi/cM3tCqjTzT0/maxresdefault.jpg'
        },
        config: { total: 10, unit: "attacks" },
        thresholds: { 5: 9, 4: 8, 3: 6, 2: 4, 1: 0 },
        instructions: [
            "Dink patiently.",
            "If ball is high (yellow zone), attack it.",
            "Count successful attacks vs opportunities."
        ]
    },
    {
        category: "Volleys",
        name: "Fast Hands Battle",
        description: "Stand at NVZ and volley quickly with your partner — focus on control, not power.",
        goal: "10+ clean volleys each/rally",
        duration: "5 rounds",
        type: "counter",
        media: {
            type: 'video',
            url: 'https://videos.pexels.com/video-files/4753337/4753337-hd_1920_1080_25fps.mp4',
            poster: 'https://images.pexels.com/photos/2277981/pexels-photo-2277981.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
        },
        config: { unit: "volleys" },
        thresholds: { 5: 15, 4: 10, 3: 6, 2: 3, 1: 0 },
        instructions: [
            "Volley back and forth without bouncing.",
            "Keep hands up.",
            "Count total volleys in a rally."
        ]
    },
    {
        category: "Transition Zone",
        name: "Reset & Advance",
        description: "Start at baseline, hit a drop, move forward, and reset balls midcourt while advancing.",
        goal: "Reach NVZ under control 8/10",
        duration: "10 sequences",
        type: "reps",
        media: {
            type: 'video',
            url: 'https://videos.pexels.com/video-files/5739227/5739227-hd_1920_1080_24fps.mp4',
            poster: 'https://images.pexels.com/photos/13061327/pexels-photo-13061327.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
        },
        config: { total: 10, unit: "advances" },
        thresholds: { 5: 9, 4: 8, 3: 6, 2: 4, 1: 0 },
        instructions: [
            "Start at baseline.",
            "Partner feeds hard balls.",
            "Reset into kitchen and take a step forward.",
            "Count successful arrivals at NVZ."
        ]
    },
    {
        category: "Strategy & Positioning",
        name: "Call & Cover",
        description: "Play points emphasizing communication — call 'mine', 'yours', 'switch'.",
        goal: "Zero missed comm errors/game",
        duration: "3 games",
        type: "checklist",
        media: {
            type: 'video',
            url: 'https://videos.pexels.com/video-files/4753337/4753337-hd_1920_1080_25fps.mp4',
            poster: 'https://images.pexels.com/photos/2277981/pexels-photo-2277981.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
        },
        config: { items: ["Called every middle ball", "Switched on lobs", "Communicated 'out' balls"] },
        thresholds: { 5: 3, 4: 2, 3: 1, 2: 0, 1: -1 }, // Based on checked items
        instructions: [
            "Play a full game.",
            "Focus ONLY on talking.",
            "Check off goals you achieved."
        ]
    },
    {
        category: "Game IQ",
        name: "Construct-the-Point",
        description: "One player builds points with patient play; the other defends.",
        goal: "Win 60%+ constructed points",
        duration: "15 points",
        type: "reps",
        media: {
            type: 'video',
            url: 'https://videos.pexels.com/video-files/5739227/5739227-hd_1920_1080_24fps.mp4',
            poster: 'https://images.pexels.com/photos/13061327/pexels-photo-13061327.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
        },
        config: { total: 15, unit: "points" },
        thresholds: { 5: 12, 4: 9, 3: 7, 2: 5, 1: 0 },
        instructions: [
            "Server must hit 3 shots before attacking.",
            "Count points won by constructing (patience)."
        ]
    },
    {
        category: "Mental Composure",
        name: "Pressure Points",
        description: "Mini-games to 5 under pressure (start at 8–8).",
        goal: "Win 3 of 5 close games",
        duration: "5 sets",
        type: "reps",
        media: {
            type: 'video',
            url: 'https://videos.pexels.com/video-files/4753337/4753337-hd_1920_1080_25fps.mp4',
            poster: 'https://images.pexels.com/photos/2277981/pexels-photo-2277981.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
        },
        config: { total: 5, unit: "games" },
        thresholds: { 5: 4, 4: 3, 3: 2, 2: 1, 1: 0 },
        instructions: [
            "Start score at 8-8.",
            "Play to 11 (win by 2).",
            "Count games won."
        ]
    },
    // --- ADVANCED DRILLS (DUPR 4.0+) ---
    {
        category: "Serve & Return",
        name: "Pro Target Practice (Small)",
        description: "Same as Deep Target, but aim for the last 2 feet of the court.",
        goal: "8/10 serves/returns in deep zone",
        duration: "50 per side",
        type: "reps",
        minDupr: 4.0,
        media: {
            type: 'youtube',
            url: 'https://www.youtube.com/watch?v=J3N7t1eZgSE',
            poster: 'https://img.youtube.com/vi/J3N7t1eZgSE/maxresdefault.jpg'
        },
        config: { total: 10, unit: "serves" },
        thresholds: { 5: 9, 4: 8, 3: 6, 2: 4, 1: 0 },
        instructions: [
            "Mark a line 2 feet from baseline.",
            "Serve/Return MUST land in this zone.",
            "Anything short is a miss."
        ]
    },
    {
        category: "Third Shot Drop",
        name: "Movement Drops",
        description: "Partner feeds wide/short/deep; you must move and hit a perfect drop.",
        goal: "8/10 successful drops while moving",
        duration: "20 reps",
        type: "reps",
        minDupr: 3.5,
        media: {
            type: 'video',
            url: 'https://videos.pexels.com/video-files/4753337/4753337-hd_1920_1080_25fps.mp4',
            poster: 'https://images.pexels.com/photos/2277981/pexels-photo-2277981.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
        },
        config: { total: 10, unit: "drops" },
        thresholds: { 5: 9, 4: 8, 3: 6, 2: 4, 1: 0 },
        instructions: [
            "Partner feeds to corners.",
            "Move, plant, and drop.",
            "Must land in kitchen."
        ]
    },
    {
        category: "Hand Speed",
        name: "Firefight Survival",
        description: "Full speed volleys at NVZ. No resetting allowed.",
        goal: "Win 3/5 firefights",
        duration: "5 rallies",
        type: "reps",
        minDupr: 4.5,
        media: {
            type: 'video',
            url: 'https://videos.pexels.com/video-files/5739227/5739227-hd_1920_1080_24fps.mp4',
            poster: 'https://images.pexels.com/photos/13061327/pexels-photo-13061327.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1'
        },
        config: { total: 5, unit: "rallies" },
        thresholds: { 5: 5, 4: 4, 3: 3, 2: 1, 1: 0 },
        instructions: [
            "Both at NVZ.",
            "Speed up immediately.",
            "Keep ball going until error."
        ]
    }
];

export function DrillsProvider({ children }) {
    const [drills, setDrills] = useState(() => {
        const saved = localStorage.getItem('drills');
        return saved ? JSON.parse(saved) : DEFAULT_DRILLS;
    });

    useEffect(() => {
        localStorage.setItem('drills', JSON.stringify(drills));
    }, [drills]);

    return (
        <DrillsContext.Provider value={{ drills }}>
            {children}
        </DrillsContext.Provider>
    );
}

export function useDrills() {
    return useContext(DrillsContext);
}
