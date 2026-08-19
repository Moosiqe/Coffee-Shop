addLayer("s", { // "s" for Stars
    name: "Restaurant Stars",
    symbol: "S",
    row: 2, // Sits on Row 2 directly below Popularity and Baristas!
    position: 0,
    startData() { return {
        unlocked: false,
        points: new Decimal(0), // Tracks CURRENT Stars earned
        starsUnlocked: false,
    }},
    color: "#F1C40F", // Bright golden star yellow
    requires: new Decimal(1e50), // 
    resource: "Stars",
    baseResource: "Beans",
    baseAmount() { return player.points }, 
    type: "static",

   requires() { 
        return this.cost(player.s.points); 
    },

    // --- YOUR INTACT CUSTOM PRICING TERMINAL ---
    cost(x) {
        let currentStars = new Decimal(x);

        if (currentStars.eq(0)) return new Decimal(5e49);
        if (currentStars.eq(1)) return new Decimal(2.5e120);
        if (currentStars.eq(2)) return new Decimal("5e999");
        if (currentStars.eq(3)) return new Decimal(1e340);
        if (currentStars.eq(4)) return new Decimal(1e500);

        return new Decimal("1e1000"); 
    },

    update(diff) {
        // --- 🌟 STAR MILESTONE 0 AUTOMATION ENGINE 🌟 ---
        if (hasMilestone('s', 0)) {
            
            // ☕ Loop A: Safely buy Row 1 Coffee Upgrades (11, 12, 13, 14, 15)
            for (let i = 11; i <= 15; i++) {
                if (canAffordUpgrade('c', i) && !hasUpgrade('c', i)) {
                    buyUpgrade('c', i);
                }
            }

            // 🥛 Loop B: Safely buy Row 2 Coffee Upgrades (21, 22, 23, 24, 25)
            for (let j = 21; j <= 25; j++) {
                if (canAffordUpgrade('c', j) && !hasUpgrade('c', j)) {
                    buyUpgrade('c', j);
                }
            }
            
        }
    },
    unlocked() {
        return player.points.gte(1e50) || player.s.points.gte(1);
    },

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
            let activeMultiplier = new Decimal(1.03).pow(player.s.points);
            return "Current Stars are shining: <h3 style='color: #F1C40F; display: inline;'>^" + format(activeMultiplier) + "</h3> Beans."
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
            requirementDescription: "⭐ 1 Coffee Shop Star",
            done() { return player.s.points.gte(1) },
            effectDescription: `- Unlock The Espresso Lab <br> - Auto-Buy Row 1-2 Coffee Cups <br> - +^0.03 Beans per Star <br> - Bulk-Buy Coffee Cups, Popularity, and Baristas <br> - Coffee Cups no longer spend Beans`,
        },
        1: {
            requirementDescription: "⭐⭐ 2 Coffee Shop Stars",
            done() { return player.s.points.gte(2) },
            effectDescription: "- A ton of new upgrades everywhere <br> - New Milestones for Popularity and Baristas <br> - Auto-Buy first two Barista Buyables <br> - Auto-Collect Coffee Cups",
            unlocked() {return hasMilestone('s', 0)},
        },
        2: {
            requirementDescription: "⭐⭐⭐ 3 Coffee Shop Stars",
            done() { return player.s.points.gte(3) },
            effectDescription: "- Unlock The Head Quarters <br> ",
            unlocked() {return hasMilestone('s', 1)},
        },
        3: {
            requirementDescription: "⭐⭐⭐⭐ 4 Coffee Shop Stars",
            done() { return player.s.points.gte(4) },
            effectDescription: "Unlock something cool (Idea Slot 4).",
            unlocked() {return hasMilestone('s', 2)},
        },
        4: {
            requirementDescription: "⭐⭐⭐⭐⭐ 5 Coffee Shop Stars",
            done() { return player.s.points.gte(5) },
            effectDescription: "The Ultimate Café. You have mastered the coffee universe!",
            unlocked() {return hasMilestone('s', 3)},
        }
    },

    hotkeys: [
        {key: "s", description: "S: Reset for Stars", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    branches: [ 
    ],

    layerShown() { 
         return player.c.points.gte(38) || player.s.points.gte(1);
    } 
})
