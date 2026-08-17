addLayer("s", { // "s" for Stars
    name: "Restaurant Stars",
    symbol: "S",
    row: 2, // Sits on Row 2 directly below Popularity and Baristas!
    position: 0,
    startData() { return {
        unlocked: true,
        points: new Decimal(0), // Tracks CURRENT Stars earned
        //starsUnlocked: false,
    }},
    color: "#F1C40F", // Bright golden star yellow
    requires: new Decimal(1e50), // 
    resource: "Stars",
    baseResource: "Beans",
    baseAmount() { return player.points }, 
    type: "static",
    base: 1e250, // Scaling difficulty for later stars
    exponent: 5,

    gainMult() { return new Decimal(1) },
    gainExp() { return new Decimal(1) },

    // Enforces the standard prestige bounds
    canBuyMax: false,
    resetsNothing: false,

    // --- VISUAL INTERFACE GRID ---
    tabFormat: [
        "main-display",
        "prestige-button",
        "blank",
        ["display-text", function() {
            // Calculates your compounding world multiplier to display on the tab page
            let activeMultiplier = new Decimal(100).pow(player.s.points);
            return "Your current Stars are granting a global <h3 style='color: #F1C40F; display: inline;'>" + format(activeMultiplier) + "x</h3> multiplier boost to all Bean production speed!"
        }],
        "blank",
        "hr",
        "blank",
        "milestones" // Draws your 5-Star native progression panel automatically!
    ],

    // ==========================================
    // THE 5-STAR NATIVE MILESTONE REGISTRY
    // ==========================================
    milestones: {
        0: {
            requirementDescription: "⭐ 1 Restaurant Star",
            done() { return player.s.points.gte(1) },
            effectDescription: "Unlock something cool (Idea Slot 1). Also speeds up your base loops.",
        },
        1: {
            requirementDescription: "⭐⭐ 2 Restaurant Stars",
            done() { return player.s.points.gte(2) },
            effectDescription: "Unlock something cool (Idea Slot 2).",
            unlocked() { return hasMilestone('s', 0) },
        },
        2: {
            requirementDescription: "⭐⭐⭐ 3 Restaurant Stars",
            done() { return player.s.points.gte(3) },
            effectDescription: "Unlock something cool (Idea Slot 3).",
            unlocked() { return hasMilestone('s', 1) },
        },
        3: {
            requirementDescription: "⭐⭐⭐⭐ 4 Restaurant Stars",
            done() { return player.s.points.gte(4) },
            effectDescription: "Unlock something cool (Idea Slot 4).",
            unlocked() { return hasMilestone('s', 2) },
        },
        4: {
            requirementDescription: "⭐⭐⭐⭐⭐ 5 Restaurant Stars",
            done() { return player.s.points.gte(5) },
            effectDescription: "The Ultimate Café. You have mastered the coffee universe!",
            unlocked() { return hasMilestone('s', 3) },
        }
    },
    hotkeys: [
        {key: "s", description: "S: Reset for Stars", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    branches: [
        "b",
        "p" 
    ],

    layerShown() { 
        if (player.c.points.gte(35) || player.s.points.gte(1)) {
            player.c.starsUnlocked = true; // Permanently lock the node onto the screen!
        }
        return player.c.starsUnlocked; // Only show the layer if the player has 35 Coffee Cups or has unlocked Stars
    }
})
