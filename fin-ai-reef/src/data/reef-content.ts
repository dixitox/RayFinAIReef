//-----------------------------------------------------------------------
// Finn's AI Reef — bundled seed content
//
// This is the SAME content as seed/reef-content.seed.json, embedded so the
// app is fully playable on local dev with no backend and no login (Phase 1).
// When the Fabric backend is deployed, the content provider
// (src/lib/reef-content.ts) reads the identical records from client.data.*
// instead. Children only ever see content that originates here / from the
// Question table — never open-ended AI output.
//-----------------------------------------------------------------------

import type { ReefContent } from "./reef-content.types";

export const REEF_CONTENT: ReefContent = {
    zones: [
        {
            id: "zone-splash",
            key: "splash-zone",
            name: "Splash Zone",
            emoji: "🌊",
            description: "What is AI? Sort the smart machines from the ordinary ones.",
            sortOrder: 1,
            isPlayable: true,
        },
        {
            id: "zone-training",
            key: "training-cove",
            name: "Training Cove",
            emoji: "🐚",
            description: "Teach Finn what an apple is — and see how AI can learn the wrong thing!",
            sortOrder: 2,
            isPlayable: true,
        },
        {
            id: "zone-bright",
            key: "bright-reef",
            name: "Bright Reef",
            emoji: "✨",
            description: "Discover Finn's AI superpowers — all the good AI can do.",
            sortOrder: 3,
            isPlayable: true,
        },
        {
            id: "zone-murky",
            key: "murky-depths",
            name: "Murky Depths",
            emoji: "🌑",
            description: "Real photo or made by AI? Learn to spot the tell-tale tricks!",
            sortOrder: 4,
            isPlayable: true,
        },
        {
            id: "zone-safe",
            key: "safe-harbour",
            name: "Safe Harbour",
            emoji: "⚓",
            description: "Be smart and safe with AI. Make your own AI Promise.",
            sortOrder: 5,
            isPlayable: true,
        },
    ],

    badges: [
        {
            id: "badge-splash",
            key: "splash-zone-explorer",
            name: "Splash Zone Explorer",
            icon: "🌊",
            description: "Sorted the smart AI from the ordinary machines.",
            zoneKey: "splash-zone",
        },
        {
            id: "badge-training",
            key: "training-cove-champion",
            name: "Training Cove Champion",
            icon: "🐚",
            description: "You taught Finn how AI learns — and why fair, varied examples matter.",
            zoneKey: "training-cove",
        },
        {
            id: "badge-bright",
            key: "bright-reef-helper",
            name: "Bright Reef Helper",
            icon: "✨",
            description: "Discovered all of Finn's AI superpowers.",
            zoneKey: "bright-reef",
        },
        {
            id: "badge-detective",
            key: "reef-detective",
            name: "Reef Detective",
            icon: "🌑",
            description: "You learned to spot the tell-tale tricks of AI-made pictures and messages.",
            zoneKey: "murky-depths",
        },
        {
            id: "badge-safe",
            key: "safe-harbour-captain",
            name: "Safe Harbour Captain",
            icon: "⚓",
            description: "Made an AI Promise to stay safe and kind.",
            zoneKey: "safe-harbour",
        },
    ],

    questions: [
        // ---- Teach Finn — TRAIN (all red apples) ----
        { id: "tf-train-1", zoneKey: "training-cove", gameType: "teach-finn", teachPhase: "train", emoji: "🍎", label: "an apple", attribute: "red", isApple: true, prompt: "an apple", sortOrder: 1, keyStage: "KS1" },
        { id: "tf-train-2", zoneKey: "training-cove", gameType: "teach-finn", teachPhase: "train", emoji: "🍎", label: "an apple", attribute: "red", isApple: true, prompt: "an apple", sortOrder: 2, keyStage: "KS1" },
        { id: "tf-train-3", zoneKey: "training-cove", gameType: "teach-finn", teachPhase: "train", emoji: "🍎", label: "an apple", attribute: "red", isApple: true, prompt: "an apple", sortOrder: 3, keyStage: "KS1" },

        // ---- Teach Finn — TEST ----
        { id: "tf-test-1", zoneKey: "training-cove", gameType: "teach-finn", teachPhase: "test", emoji: "🍎", label: "red apple", attribute: "red", isApple: true, prompt: "red apple", sortOrder: 4, keyStage: "KS1" },
        { id: "tf-test-2", zoneKey: "training-cove", gameType: "teach-finn", teachPhase: "test", emoji: "🍏", label: "green apple", attribute: "green", isApple: true, prompt: "green apple", sortOrder: 5, keyStage: "KS1" },
        { id: "tf-test-3", zoneKey: "training-cove", gameType: "teach-finn", teachPhase: "test", emoji: "🍅", label: "tomato", attribute: "red", isApple: false, prompt: "tomato", sortOrder: 6, keyStage: "KS1" },

        // ---- Teach Finn — FIX (add a green apple example) ----
        { id: "tf-fix-1", zoneKey: "training-cove", gameType: "teach-finn", teachPhase: "fix", emoji: "🍏", label: "a green apple", attribute: "green", isApple: true, prompt: "a green apple", sortOrder: 7, keyStage: "KS1" },

        // ---- Real or AI? ----
        {
            id: "roa-1", zoneKey: "murky-depths", gameType: "real-or-ai", emoji: "🐱",
            prompt: "A cat photo — but look closely… it has TWO tails!",
            answer: "ai",
            finnTip: "Real cats have one tail! AI pictures sometimes add extra bits that don't belong.",
            sortOrder: 1, keyStage: "KS1",
        },
        {
            id: "roa-2", zoneKey: "murky-depths", gameType: "real-or-ai", emoji: "🚌",
            prompt: "A red London bus on a busy street.",
            answer: "real",
            finnTip: "Nothing odd here — this one is a normal, real photo. 📷",
            sortOrder: 2, keyStage: "KS1",
        },
        {
            id: "roa-3", zoneKey: "murky-depths", gameType: "real-or-ai", emoji: "💬",
            prompt: "\"You WON a free tablet! 🎉 Tell me your home address and password to claim it.\"",
            answer: "ai",
            finnTip: "A real prize never asks for your password or address. This is a trick — tell a grown-up!",
            sortOrder: 3, keyStage: "KS2",
        },
        {
            id: "roa-4", zoneKey: "murky-depths", gameType: "real-or-ai", emoji: "🖐️",
            prompt: "A photo of someone waving — count the fingers… there are SIX!",
            answer: "ai",
            finnTip: "Count the fingers! AI often gets hands wrong. A great clue that a picture is AI-made.",
            sortOrder: 4, keyStage: "KS2",
        },

        // ---- Splash Zone — Smart or not? (sort-ai; answer "ai"|"ordinary") ----
        { id: "sa-1", zoneKey: "splash-zone", gameType: "sort-ai", emoji: "🗣️", prompt: "A speaker that answers your questions out loud.", answer: "ai", finnTip: "It listens and learns — that's AI!", sortOrder: 1, keyStage: "KS1" },
        { id: "sa-2", zoneKey: "splash-zone", gameType: "sort-ai", emoji: "🔦", prompt: "A torch that turns on with a switch.", answer: "ordinary", finnTip: "It just lights up when you flick it — no learning. Not AI.", sortOrder: 2, keyStage: "KS1" },
        { id: "sa-3", zoneKey: "splash-zone", gameType: "sort-ai", emoji: "📷", prompt: "A camera that finds faces in your photos.", answer: "ai", finnTip: "Spotting faces is a clever AI trick.", sortOrder: 3, keyStage: "KS1" },
        { id: "sa-4", zoneKey: "splash-zone", gameType: "sort-ai", emoji: "🔔", prompt: "A doorbell that goes 'ding' when you press it.", answer: "ordinary", finnTip: "Same 'ding' every time — no thinking. Not AI.", sortOrder: 4, keyStage: "KS1" },
        { id: "sa-5", zoneKey: "splash-zone", gameType: "sort-ai", emoji: "🎮", prompt: "A game baddie that learns how you play and gets trickier.", answer: "ai", finnTip: "It changes and learns about you — that's AI!", sortOrder: 5, keyStage: "KS1" },
        { id: "sa-6", zoneKey: "splash-zone", gameType: "sort-ai", emoji: "🍞", prompt: "A toaster with a dial you turn.", answer: "ordinary", finnTip: "It just heats for the time you pick. Not AI.", sortOrder: 6, keyStage: "KS1" },

        // ---- Bright Reef — Finn's AI Superpowers (ai-good; reveal cards) ----
        { id: "ag-1", zoneKey: "bright-reef", gameType: "ai-good", emoji: "🩺", prompt: "AI helps doctors spot illness early in scans.", finnTip: "It can notice tiny signs, so people get help sooner.", sortOrder: 1, keyStage: "LKS2" },
        { id: "ag-2", zoneKey: "bright-reef", gameType: "ai-good", emoji: "👁️", prompt: "AI reads pictures and words out loud for people who can't see.", finnTip: "It reads the world aloud.", sortOrder: 2, keyStage: "LKS2" },
        { id: "ag-3", zoneKey: "bright-reef", gameType: "ai-good", emoji: "🗣️", prompt: "AI can translate languages in seconds.", finnTip: "It helps people understand each other.", sortOrder: 3, keyStage: "LKS2" },
        { id: "ag-4", zoneKey: "bright-reef", gameType: "ai-good", emoji: "🌱", prompt: "AI helps farmers grow food with less water.", finnTip: "It helps look after our planet.", sortOrder: 4, keyStage: "LKS2" },
        { id: "ag-5", zoneKey: "bright-reef", gameType: "ai-good", emoji: "🚨", prompt: "AI warns people when big storms or floods are coming.", finnTip: "It helps keep everyone safe.", sortOrder: 5, keyStage: "LKS2" },
        { id: "ag-6", zoneKey: "bright-reef", gameType: "ai-good", emoji: "📚", prompt: "AI can help you learn at your own speed.", finnTip: "Like a patient helper for every child.", sortOrder: 6, keyStage: "LKS2" },

        // ---- Safe Harbour — What would you do? (safe-scenario; answer "A"|"B" = safe) ----
        { id: "ss-1", zoneKey: "safe-harbour", gameType: "safe-scenario", emoji: "🏠", prompt: "A game asks for your home address so you can play. What do you do?", optionA: "Type it in", optionB: "Ask a grown-up first", answer: "B", finnTip: "Never share where you live — always ask a grown-up.", sortOrder: 1, keyStage: "KS1" },
        { id: "ss-2", zoneKey: "safe-harbour", gameType: "safe-scenario", emoji: "🔑", prompt: "A pop-up says: 'Type your password to win a prize!' What do you do?", optionA: "Ask a grown-up", optionB: "Type your password", answer: "A", finnTip: "Real prizes never ask for passwords. Tell a grown-up.", sortOrder: 2, keyStage: "KS1" },
        { id: "ss-3", zoneKey: "safe-harbour", gameType: "safe-scenario", emoji: "🤖", prompt: "An AI chatbot tells you a 'fact' that sounds strange. What do you do?", optionA: "Believe it right away", optionB: "Check it with a grown-up or a book", answer: "B", finnTip: "AI can be wrong — always double-check.", sortOrder: 3, keyStage: "LKS2" },
        { id: "ss-4", zoneKey: "safe-harbour", gameType: "safe-scenario", emoji: "😟", prompt: "You see an AI-made picture that feels scary or unkind. What do you do?", optionA: "Tell a trusted grown-up", optionB: "Keep it a secret", answer: "A", finnTip: "Always tell a grown-up if something feels wrong.", sortOrder: 4, keyStage: "KS1" },

        // ---- Safe Harbour — Build your AI Promise (promise; tap to add) ----
        { id: "pr-1", zoneKey: "safe-harbour", gameType: "promise", emoji: "🛡️", prompt: "I will check with a grown-up before sharing anything about me.", sortOrder: 5, keyStage: "KS1" },
        { id: "pr-2", zoneKey: "safe-harbour", gameType: "promise", emoji: "🔒", prompt: "I won't share my name, address, or passwords.", sortOrder: 6, keyStage: "KS1" },
        { id: "pr-3", zoneKey: "safe-harbour", gameType: "promise", emoji: "🧐", prompt: "I'll remember AI can be wrong, so I'll double-check.", sortOrder: 7, keyStage: "KS1" },
        { id: "pr-4", zoneKey: "safe-harbour", gameType: "promise", emoji: "💛", prompt: "I'll be kind when I use AI.", sortOrder: 8, keyStage: "KS1" },
        { id: "pr-5", zoneKey: "safe-harbour", gameType: "promise", emoji: "🗣️", prompt: "I'll tell a grown-up if something ever feels wrong.", sortOrder: 9, keyStage: "KS1" },
    ],
};
