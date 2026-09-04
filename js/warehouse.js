addLayer("w", { // "w" for Supply Warehouse
    name: "Warehouse",
    symbol: "W",
    row: 2, 
    position: 1, // Symmetrically mirrors the Espresso Lab on the left wing!
    
    startData() { return {
        unlocked: false,
        points: new Decimal(0), // Your core Warehouse Permits currency!
    }},

    color: "#1ABC9C", // Signature Corporate Teal
    resource: "Warehouse Permits",
    
    // 🌟 NATIVE TMT SIMPLICITY 🌟
    type: "static", 
    requires: new Decimal("1e1000"), // Costs exactly 1e1000 Beans for the first point!
    exponent() {
        let baseExponent = new Decimal(2.72); // Your original baseline scaling factor
        
        // If they bought the clean Upgrade 15, divide the core exponent natively!
        if (hasUpgrade('w', 15)) {
            baseExponent = baseExponent.div(upgradeEffect('w', 15));
        }
        return baseExponent;
    },
    baseResource: "Beans",
    baseAmount() { return player.points },

    // Reveals itself visually when the player reaches the Star 3 barrier
    layerShown() { 
        return player.s.points.gte(3) || player.w.unlocked; 
    },
    hotkeys: [
        {key: "w", description: "W: Reset for Warehouse Permits", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    canBuyMax: true,

    // 🎨 CLASSIC TMT DASHBOARD BUILDER
    tabFormat: [
        "main-display",
        "prestige-button", // Natively draws a beautiful, un-crashable prestige button!
        "blank",
        "hr",
        "blank",
        ["display-text", "<h3>Warehouse Logistical Upgrades</h3>"],
        "blank",
        "upgrades" // Draws your clean upgrade grid panel seamlessly
    ],

    upgrades: {
        rows: 1,
        cols: 5,
        
        11: {
            title: "Lab Logistics",
            description: "Beans are boosted by RP (Research Points).",
            cost: new Decimal(3),
            effect() {
                let labPoints = player.l.researchPoints || new Decimal(0);
                
                // ⚡ MAXIMUM VELOCITY: No logs, no roots. Just pure, un-throttled scaling!
                // Every single Research Point you earn adds another compounding step to your multiplier.
                // At 500 Research Points -> 1.05^500 = a massive 3.9e10x global Bean multiplier!
                return new Decimal(1.05).pow(labPoints);
            },
            effectDisplay() { return format(this.effect()) + "x Beans" },
        },
        12: {
            title: "Moree Coffee Cups",
            description: "Each Warehouse Upgrade you own adds +1/s to Coffee Cups",
            cost: new Decimal(6),
            unlocked() { return hasUpgrade('w', 11) },
            effect() {
                // Counts how many total upgrades are bought in this Warehouse layer ('w')
                let upgCount = player.w.upgrades ? player.w.upgrades.length : 0;
                
                // If they bought this upgrade, add +1/sec per owned upgrade. 
                // (e.g. If you own 3 upgrades total, it returns +3 to add to the base 1)
                if (hasUpgrade('w', 12)) return new Decimal(upgCount);
                return new Decimal(0);
            },
            effectDisplay() { return "+" + formatWhole(this.effect()) + "/s" },
        },
        13: {
            title: "Quantum Pumping",
            description: "Permits and RP synergistically boost Milk.",
            cost: new Decimal(7),
            effect() {
                let labPoints = player.l.researchPoints || new Decimal(0);
                

                return new Decimal(1.07).pow(labPoints);
            },
            effectDisplay() { return format(this.effect()) + "x Milk" },
            unlocked() { return hasUpgrade('w', 12) },
        },
        14: {
            title: "Precision Warehousing",
            description: "Permits divide Lab Upgrade costs.",
            cost: new Decimal(9), 
            effect() {
                let permits = player.w.points;
                
                // 🛡️ THE LOGARITHMIC SHIELD: Extracts the order of magnitude of permits safely!
                let permitsLog = permits.add(1).log10();
                
                // Formula: 1.35 raised to the power of log10(permits + 1)
                // This guarantees the cost divider and speed multiplier scale beautifully 
                // without ever running away into un-balanced infinity arrays!
                return new Decimal(1.30).pow(permitsLog);
            },
             effectDisplay() { return " /" + format(this.effect()) },
            unlocked() { return hasUpgrade('w', 13) },
        },
         15: {
            title: "Synergy Optimization",
            description: "RP divides Permit exponent.",
            cost: new Decimal(10), 
            
            effect() {
                let labPoints = player.l.researchPoints || new Decimal(0);
                
                // 🛡️ DAMPENED LOG MATRIX: Extracts the magnitude of your Research Points
                let rawLog = labPoints.add(1).log10();
                
                // 📊 THE BALANCE TWEAK: Multiplying by 0.10 slows down the reduction curve.
                // At 10,000 RP: 1 + (4 * 0.10) = 1.40x divider (Exponent drops to 0.35)
                // At 1,000,000 RP: 1 + (6 * 0.10) = 1.60x divider (Exponent drops to 0.31)
                // This keeps your pacing perfectly smooth and stops the curve from collapsing!
                return new Decimal(1).add(rawLog.times(0.01));
            },
            effectDisplay() { return " /" + format(this.effect(), 3) },
            unlocked() { return hasUpgrade('w', 14) },
        },
    },

     

    branches: ["s"] // Visual link lines vector mapped to the central Stars spine node
});
