addLayer("l", { // "l" for Espresso Lab
    name: "Espresso Lab",
    symbol: "L",
    row: 2, // Sits on Row 2 directly next to Restaurant Stars!
    position: -1, // Position 1 moves it to the right side of Stars (Position 0)
    
    // --- INITIALIZE ALL STORAGE WALLETS ---
    startData() { return {
        unlocked: true,
        points: new Decimal(0), // Standard TMT points layer variable (we can leave this as 0)
        
        // 🌟 CUSTOM LAB WALLETS 🌟
        researchPoints: new Decimal(0), // Unified currency to buy recipes
        beanUnits: new Decimal(0),      // Current slider value for Beans
        milkUnits: new Decimal(0),      // Current slider value for Milk
        
        // Individual recipe level trackers
        macchiatoLevel: new Decimal(0),
        flatWhiteLevel: new Decimal(0),
        cappuccinoLevel: new Decimal(0),
    }},
    
    color: "#9B59B6", // A beautiful scientific amethyst purple
    type: "none", // Since it uses your top exchangers, it doesn't need a default prestige button
     update(diff) {
        // --- 🧪 THE STAR 3 BALANCED LAB AUTOMATOR MATRIX ---
        if (hasMilestone('s', 3)) {
            
            // 1. Calculate the maximum fractional allocation window allowed for this frame tick slice
            let maxLevelsThisFrame = new Decimal(25).times(diff);

            // 🔬 Buyable 11 Independent Automation (Beans Matrix)
            if (canBuyBuyable('l', 11)) {
                // Find the absolute maximum number of levels your Beans wallet can legally afford right now
                let maxAffordable11 = player.points.div(layers.l.buyables[11].cost());
                
                // Clamp the purchase size so it never exceeds your +25/sec limit or what you can actually afford
                let actualBought11 = Decimal.min(maxLevelsThisFrame, maxAffordable11).floor();

                if (actualBought11.gt(0)) {
                    // Calculate and subtract the total Bean cost for this batch natively
                    let totalCost11 = layers.l.buyables[11].cost().times(actualBought11);
                    player.points = player.points.sub(totalCost11);

                    // Update your level tracking counters
                    let currentAmt11 = getBuyableAmount('l', 11);
                    setBuyableAmount('l', 11, currentAmt11.add(actualBought11));

                    // 🌟 SYNC UNLOCKED: Mint the EXACT number of Research Points you paid for!
                    player.l.researchPoints = player.l.researchPoints.add(actualBought11);
                }
            }

            // 🔬 Buyable 12 Independent Automation (Milk Matrix)
            if (canBuyBuyable('l', 12)) {
                // Find the absolute maximum number of levels your Milk wallet can legally afford right now
                let maxAffordable12 = player.c.milk.div(layers.l.buyables[12].cost());
                
                let actualBought12 = Decimal.min(maxLevelsThisFrame, maxAffordable12).floor();

                if (actualBought12.gt(0)) {
                    // Calculate and subtract the total Milk cost for this batch natively
                    let totalCost12 = layers.l.buyables[12].cost().times(actualBought12);
                    player.c.milk = player.c.milk.sub(totalCost12);

                    // Update your level tracking counters
                    let currentAmt12 = getBuyableAmount('l', 12);
                    setBuyableAmount('l', 12, currentAmt12.add(actualBought12));

                    // 🌟 SYNC UNLOCKED: Mint the EXACT number of Research Points you paid for!
                    player.l.researchPoints = player.l.researchPoints.add(actualBought12);
                }
            }
        }
    },
    // --- BASELINE INTERFACE LAYOUT ---
    tabFormat: [
        "blank",
        ["display-text", "<h2>The Espresso Laboratory</h2>"],
        "blank",
        ["display-text", "Welcome to the Lab. Here you will convert massive ingredient reserves into Research Points to test new Coffee Recipes."],
        "blank",
        ["display-text", function() {
            return "🧪 Research Lab Vault: <h3 style='color: #9B59B6; display: inline;'>" + formatWhole(player.l.researchPoints) + " Research Points</h3>"
        }],
        "blank",
        ["display-text", "<h3>Data Extraction Terminals</h3>"],
        "blank",
        
        // Draws your two conversion buttons side-by-side instantly!
        "buyables",
        "blank",
        ["display-text", function() {
            let bUnits = player.l.beanUnits;
            let mUnits = player.l.milkUnits;
            let total = bUnits.add(mUnits);

            if (total.eq(0)) return "Chamber Status: <span style='color: #7F8C8D;'>Empty (Set mixer quantities below to begin blending)</span>";

            let beanPercent = bUnits.times(100).div(total);
            let milkPercent = mUnits.times(100).div(total);

            return "Current Mixture Ratios:<br>" +
                   "🫘 Beans Focus: <h3 style='color: #E67E22; display: inline;'>" + format(beanPercent) + "%</h3> (" + formatWhole(bUnits) + " Units)<br>" +
                   "🥛 Milk Froth:  <h3 style='color: #3498DB; display: inline;'>" + format(milkPercent) + "%</h3> (" + formatWhole(mUnits) + " Units)"
        }],
        "blank",
        
        // --- RENDER CATEGORY BUTTON GROUPS ---
        ["display-text", "<h4>Adjust Bean & Milk Density:</h4>"],  
        "blank",
        
        // 🌟 FIXED LAYOUT ROW: All four control modules are packed into a single flat array!
        // The two blank entries create a clean horizontal separation bar between Beans and Milk.
        ["row", [
            ["buyable", 21], ["buyable", 22], 
            "blank", "blank", 
            ["buyable", 23], ["buyable", 24]
        ]],
        "blank",
        
        ["row", [["buyable", 51], ["buyable", 52], ["buyable", 53]]],
        "blank",
        "hr",
    ],
    buyables: {
        rows: 1, // 🌟 FIXED: Changed to 2 rows to fit both entry tiers safely
        cols: 2, // 🌟 FIXED: Set to 4 to allow 4 horizontal buttons on the grid tracking

        11: {
            title: "Extract Research Data (Beans)",
            cost(x) { 
                return new Decimal(1e10).times(new Decimal(1e3).pow(x)) 
            },
            display() { 
                return "Centrifuge your standard bean reserves into scientific data.\n\n" +
                       "Research Points Minted: " + formatWhole(getBuyableAmount(this.layer, this.id)) + "\n" +
                       "Cost: " + format(this.cost()) + " Beans\n\n" +
                       "Adds +1 Research Point to your lab vault."
            },
            canAfford() { 
                return player.points.gte(this.cost()) 
            },
            buy() {
                player.points = player.points.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                player.l.researchPoints = player.l.researchPoints.add(1)
            },
            canBuyMax: true, 
            resetsNothing: true, 
            unlocked() { return true }
        },
        12: {
            title: "Extract Research Data (Milk)",
            cost(x) { 
                return new Decimal(1e3).times(new Decimal(1e2).pow(x)) 
            },
            display() { 
                return "Analyze your milk station supply curves for new variables.\n\n" +
                       "Research Points Minted: " + formatWhole(getBuyableAmount(this.layer, this.id)) + "\n" +
                       "Cost: " + format(this.cost()) + " Milk\n\n" +
                       "Adds +1 Research Point to your lab vault."
            },
            canAfford() { 
                return player.c.milk.gte(this.cost()) 
            },
            buy() {
                player.c.milk = player.c.milk.sub(this.cost())
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
                player.l.researchPoints = player.l.researchPoints.add(1)
            },
            canBuyMax: true,
            resetsNothing: true,
            unlocked() { return true }
        },
        21: {
            title: "🫘 -",
            cost(x) { return new Decimal(0) },
            display() { return "" }, 
            canAfford() { return player.l.beanUnits.gt(0) }, // Clickable if you have units to remove
            buy() { 
                player.l.beanUnits = player.l.beanUnits.sub(1)
                // 🌟 REFUND SWITCH: Returning the Research Point back to the player wallet!
                player.l.researchPoints = player.l.researchPoints.add(1)
            },
            style: { "width": "65px", "height": "65px", "min-height": "65px", "margin": "2px" },
            unlocked() { return true }
        },
        22: {
            title: "🫘 +",
            cost(x) { return new Decimal(0) },
            display() { return "" },
            // 🌟 COST GATE: Only clickable if the player has at least 1 Research Point!
            canAfford() { return player.l.researchPoints.gte(1) },
            buy() { 
                // 🌟 COST DEDUCTION: Consuming exactly 1 Research Point to allocate a unit
                player.l.researchPoints = player.l.researchPoints.sub(1)
                player.l.beanUnits = player.l.beanUnits.add(1) 
            },
            style: { "width": "65px", "height": "65px", "min-height": "65px", "margin": "2px" },
            unlocked() { return true }
        },

        // ==========================================
        // 🥛 MILK MIX ADJUSTMENT BUTTONS
        // ==========================================
        23: {
            title: "🥛 -",
            cost(x) { return new Decimal(0) },
            display() { return "" },
            canAfford() { return player.l.milkUnits.gt(0) },
            buy() { 
                player.l.milkUnits = player.l.milkUnits.sub(1)
                // 🌟 REFUND SWITCH: Returning the Research Point back to the player wallet!
                player.l.researchPoints = player.l.researchPoints.add(1)
            },
            style: { "width": "65px", "height": "65px", "min-height": "65px", "margin": "2px" },
            unlocked() { return true }
        },
        24: {
            title: "🥛 +",
            cost(x) { return new Decimal(0) },
            display() { return "" },
            canAfford() { return player.l.researchPoints.gte(1) },
            buy() { 
                player.l.researchPoints = player.l.researchPoints.sub(1)
                player.l.milkUnits = player.l.milkUnits.add(1) 
            },
            style: { "width": "65px", "height": "65px", "min-height": "65px", "margin": "2px" },
            unlocked() { return true }
        },
        // ☕ REPEATABLE LEVEL RECIPE INDEX (Row 5)
        // ==========================================
        51: {
            title: "Classic Macchiato",
           cost(x) { 
                let baseCost = new Decimal(1).times(new Decimal(1.2).pow(x)); 
                
                // 🌟 THE SYNERGY DIVIDER: Slashes the cost based on your Warehouse Permits!
                if (hasUpgrade('w', 14)) {
                    baseCost = baseCost.div(upgradeEffect('w', 14));
                }
                return baseCost.floor();
            },
            effect(x) {
                let baseEffect = new Decimal(3).pow(x);
            if (hasUpgrade('c', 35)) baseEffect = baseEffect.times(upgradeEffect('c', 35));
            if (hasUpgrade('c', 55)) baseEffect = baseEffect.times(upgradeEffect('c', 55));
            if (hasUpgrade('p', 25)) baseEffect = baseEffect.times(upgradeEffect('p', 25));
            return baseEffect;
            },
            display() { 
                let amt = getBuyableAmount(this.layer, this.id);
                return "Target Ratio: 63.64% Beans / 36.36% Milk.\n\n" +
                       "Level: " + formatWhole(amt) + "\n" +
                       "Cost: " + formatWhole(this.cost()) + " Research Points\n\n" +
                       "Currently: " + format(this.effect()) + "x Beans."
            },
            canAfford() {
                // 🌟 EXPLICIT EXACT MATCH: Must have precisely 7 Beans and 4 Milk in the chamber!
                let exactCombo = player.l.beanUnits.eq(7) && player.l.milkUnits.eq(4);
                
                return exactCombo && player.l.researchPoints.gte(this.cost());
            },
            buy() {
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
            },
            unlocked() { return true }
        },

        52: {
            title: "Velvet Flat White",
                cost(x) { 
                    let baseCost = new Decimal(2).times(new Decimal(1.25).pow(x)); 
                    
                    // 🌟 THE SYNERGY DIVIDER: Slashes the cost based on your Warehouse Permits!
                    if (hasUpgrade('w', 14)) {
                        baseCost = baseCost.div(upgradeEffect('w', 14));
                    }
                    return baseCost.floor();
                },
            effect(x) {
                let baseEffect = new Decimal(2.5).pow(x);
            if (hasUpgrade('c', 35)) baseEffect = baseEffect.times(upgradeEffect('c', 35));
            if (hasUpgrade('c', 55)) baseEffect = baseEffect.times(upgradeEffect('c', 55));
            if (hasUpgrade('p', 25)) baseEffect = baseEffect.times(upgradeEffect('p', 25));
            return baseEffect;
            },
            display() { 
                let amt = getBuyableAmount(this.layer, this.id);
                return "Target Ratio: 38.46% Beans / 61.54% Milk.\n\n" +
                       "Level: " + formatWhole(amt) + "\n" +
                       "Cost: " + formatWhole(this.cost()) + " Research Points\n\n" +
                       "Currently: " + format(this.effect()) + "x Customers."
            },
            canAfford() {
                // 🌟 EXPLICIT EXACT MATCH: Must have precisely 10 Beans and 16 Milk in the chamber!
                let exactCombo = player.l.beanUnits.eq(10) && player.l.milkUnits.eq(16);
                
                return exactCombo && player.l.researchPoints.gte(this.cost());
            },
            buy() {
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
            },
            unlocked() { return true }
        },

        53: {
            title: "Nitro Cold Brew",
            cost(x) { 
                let baseCost = new Decimal(2).times(new Decimal(1.25).pow(x)); 
                
                // 🌟 THE SYNERGY DIVIDER: Slashes the cost based on your Warehouse Permits!
                if (hasUpgrade('w', 14)) {
                    baseCost = baseCost.div(upgradeEffect('w', 14));
                }
                return baseCost.floor();
            },
            effect(x) {
                let baseEffect = new Decimal(4).pow(x);
            if (hasUpgrade('c', 35)) baseEffect = baseEffect.times(upgradeEffect('c', 35));
            if (hasUpgrade('c', 55)) baseEffect = baseEffect.times(upgradeEffect('c', 55));
            if (hasUpgrade('p', 25)) baseEffect = baseEffect.times(upgradeEffect('p', 25));
            return baseEffect;
            },
            display() { 
                let amt = getBuyableAmount(this.layer, this.id);
                return "Target Ratio: 13.04% Beans / 86.96% Milk.\n\n" +
                       "Level: " + formatWhole(amt) + "\n" +
                       "Cost: " + formatWhole(this.cost()) + " Research Points\n\n" +
                       "Currently: " + format(this.effect()) + "x Milk."
            },
            canAfford() {
                // 🌟 EXPLICIT EXACT MATCH: Must have precisely 9 Beans and 60 Milk in the chamber!
                let exactCombo = player.l.beanUnits.eq(9) && player.l.milkUnits.eq(60);
                
                return exactCombo && player.l.researchPoints.gte(this.cost());
            },
            buy() {
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
            },
            unlocked() { return true }
        }
    },
    branches: [
        "s" 
    ],
    tooltip() {
        // Automatically reads and formats your lab point storage vault
        return formatWhole(player.l.researchPoints) + " Research Points";
    },
    
    // Displays this clean indicator if the player hovers over it before earning Star #1
    tooltipLocked() {
        return "Espresso Lab (Unlock via Star Milestone 1)";
    },

   layerShown() { 
        // 1. If they possess Star Milestone 0, flip your permanent tracker to true!
        if (hasMilestone('s', 0) || player.s.points.gte(1)) {
            player.c.starsUnlocked = true;
        }

        // 2. Returns the permanent switch, keeping the Lab visible (even when progress resets!)
        return player.c.starsUnlocked;
    }
})
