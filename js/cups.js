addLayer("c", {
    name: "Coffee Cups", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "C", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        milk: new Decimal(0), // Tracks the number of Milk the player has
        milkTabUnlocked: false,
    }},
    color: "#56514b",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "Coffee Cups", // Name of prestige currency
    baseResource: "Beans", // Name of resource prestige is based on
    baseAmount() {return player.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    exponent: 1.375, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    autoPrestige() {
        // 🌟 SAFETY UPGRADE: Turn off autoPrestige if they have passive generation active!
        // This ensures the engine doesn't accidentally run both systems at once.
        if (hasMilestone('s', 2)) return false; 
        if (hasMilestone('s', 1)) return true;
        return false;
    },
    
    canBuyMax() { 
        let hasUnlockMilestone = hasMilestone('s', 0) || hasMilestone('p', 0);
        let automationIsOff = !hasMilestone('s', 1) && !hasMilestone('s', 2);
        return hasUnlockMilestone && automationIsOff; 
    },

    // 🌟 THE STAR 3 ERA PASSIVE GENERATION ENGINE 🌟
    // Automatically runs smoothly every single game frame tick!
    passiveGeneration() {
         if (hasMilestone('s', 2)) {
            let basePassive = new Decimal(1);
            
            // 🌌 WAREHOUSE OVERCLOCK: If you buy Upgrade 12, ADD the scaling factor cleanly!
            if (hasUpgrade('w', 12)) {
                basePassive = basePassive.add(upgradeEffect('w', 12));
            }
            return basePassive;
        }
        
        return new Decimal(0); // Locked out during the early game layers
    },
    canReset() {
        // If passive generation is active (Star Milestone 2 / 3 Stars), 
        // hard-lock manual resets to FALSE instantly.
        if (hasMilestone('s', 2)) return false;

        // Otherwise, allow standard manual resets if they have enough Beans!
        return player.points.gte(getNextAt("c"));
    },
    resetsNothing() { 
        return hasMilestone('s', 0); 
    },
    
    update(diff) {
       if (player.c.milkTabUnlocked) {  
            
            // 1. Calculate base milk gain
            let milkGain = player.points.add(1).pow(0.125);
            
            // --- UPDATED: Apply your Barista-powered Upgrade 25 boost ---
            if (hasUpgrade('c', 25)) {
                milkGain = milkGain.times(upgradeEffect('c', 25));
            }
            milkGain = milkGain.times(buyableEffect('b', 12));

            if (hasUpgrade('c', 44)) {
                milkGain = milkGain.times(upgradeEffect('c', 44));
            }
            if (hasUpgrade('p', 14)) {
                milkGain = milkGain.times(upgradeEffect('p', 14));
            }
            if (buyableEffect('l', 53)) milkGain = milkGain.times(buyableEffect('l', 53));
            if (hasUpgrade('c', 51)) milkGain = milkGain.times(upgradeEffect('c', 51));
            if (hasUpgrade('p', 23)) {
                milkGain = milkGain.times(upgradeEffect('p', 23));
            }
            if (hasUpgrade('w', 13)) {
                milkGain = milkGain.times(upgradeEffect('w', 13));
            }
            
            
            // 2. Add smoothly to the total milk balance
            player.c.milk = player.c.milk.add(milkGain.times(diff));
        }
        
    },

    tabFormat: {
        // Tab 1: The default main coffee shop tab
        "Brewing": {
            content: [
                "main-display",
                function() {
                    if (hasMilestone('s', 2)) return ""; // Hides it entirely!
                    return "prestige-button"; // Draws it normally in the early game.
                },
                "blank",
                "hr",
                "blank",
                ["display-text", "<h3>Coffee Cups Upgrades</h3>"],
                "blank",
                ["upgrades", [1, 2, 3]] // upgrades 1-3 will render on main tab
            ]
        },
        // Tab 2: The Milk Tab
        "Milk Station": {
            // Only lets the player see this sub-tab after they unlock the option!
            unlocked() { return player.c.milkTabUnlocked }, 
            content: [
                "main-display",
                "blank",
                // Visual Milk Counter and Per-Second ticker
                ["display-text", function() {
                    let milkGain = player.points.add(1).pow(0.125);
                    // If you have special upgrades later to speed up milk, multiply milkGain here!
                    if (hasUpgrade('c', 25)) milkGain = milkGain.times(upgradeEffect('c', 25));
                    milkGain = milkGain.times(buyableEffect('b', 12));
                    return "You have <h2 style='color: #FDFEFE; text-shadow: 0 0 5px #BDC3C7;'>" + format(player.c.milk) + "</h2> Milk."
                }],
                
                ["display-text", function() {
                    let milkGain = player.points.add(1).pow(0.125)
                    
                     if (hasUpgrade('c', 25)) milkGain = milkGain.times(upgradeEffect('c', 25))
                    milkGain = milkGain.times(buyableEffect('b', 12))

                    if (hasUpgrade('c', 44)) milkGain = milkGain.times(upgradeEffect('c', 44))
                    if (hasUpgrade('p', 14)) milkGain = milkGain.times(upgradeEffect('p', 14))
                    if (buyableEffect('l', 53)) {milkGain = milkGain.times(buyableEffect('l', 53))}
                    if (hasUpgrade('c', 51)) milkGain = milkGain.times(upgradeEffect('c', 51));
                    if (hasUpgrade('p', 23)) milkGain = milkGain.times(upgradeEffect('p', 23));
                    if (hasUpgrade('w', 13)) milkGain = milkGain.times(upgradeEffect('w', 13));
                    return "(+" + format(milkGain) + "/sec)"
                }],
                "blank",
                "hr",
                "blank",
                ["display-text", "<h3>Milk Upgrades</h3>"],
                "blank",
                ["upgrades", [4, 5]]  // Any upgrades placed in the 40+ grid will render on this sub-tab!
            ]
        }
    },
    
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "c", description: "C: Reset for Coffee Cups", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},

    doReset(resettingLayer) {
        // 🧼 CORE RESET SHIELD: If reset by a Row 2 node (Stars or Warehouse), 
        // flatten EVERYTHING inside the Coffee layer down to a true zero!
        if (resettingLayer == "s" || resettingLayer == "w") {
            player.c.points = new Decimal(0);         // Wipe Coffee Cups
            player.c.milk = new Decimal(0);           // Clear Milk back to 0!
            player.c.milkTabUnlocked = false;         // Lock the Milk Station tab up!
            player.c.upgrades = [];                   // Wipe ALL purchased upgrades array entries
            return;                                   
        }

        // Otherwise, if it's an early-game Row 1 check (Popularity or Baristas), use your default rule:
        if (layers[resettingLayer].row > this.row) {
            player.c.points = new Decimal(0); 
            player.c.upgrades = player.c.upgrades.filter(upg => String(upg).startsWith('4') || String(upg).startsWith('5'));
        }
    },
    
    upgrades: {
        rows: 7, 
        cols: 5, 
        // --- COFFEE CUPS UPGRADES ---
        11: {
            title: "Larger Cups",
            description: "Increase Beans based on Coffee Cups.",
            cost: new Decimal(1),
            effect() {
                return player[this.layer].points.add(1).pow(0.84)
            },
         effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        12: {
            title: "Normal Cups",
            description: "x2 Beans.",
            cost: new Decimal(2),
            unlocked() { return hasUpgrade('c', 11) },
        },
        13: {
            title: "CoFFee BeAnS",
            description: "Cups = Beans.",
            cost: new Decimal(3),
            effect() {
                return player[this.layer].points.add(1).pow(1.12)
            },
            unlocked() { return hasUpgrade('c', 12) },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
        },
        14: {
            title: "Caffeine Rush",
            description: "You need this now.. x4 Beans.",
            cost: new Decimal(5),
            unlocked() { return hasUpgrade('c', 13) },
        },
        15: {
            title: "Beans Go Brrr",
            description: "Beans multiply Beans.",
            cost: new Decimal(6),
            effect() {
                // 1. Calculate your original, raw explosive formula
                let baseEffect = player.points.add(1).pow(0.41);
                
                if (baseEffect.gt("1e400")) {
                    let excess = baseEffect.div("1e400");
                    // Take the excess multiplier and heavily dampen it using a 0.15 power filter
                    baseEffect = new Decimal("1e400").times(excess.pow(0.1));
                }
                return baseEffect;
            },
            effectDisplay() { 
                let rawEffect = player.points.add(1).pow(0.41);
                
                // 🎨 VISUAL ANCHOR: Turn the readout text amber-orange if it has passed the break pad!
                if (rawEffect.gt("1e400")) {
                    return "<span style='color: #cd0b0b; font-weight: bold;'>" + format(this.effect()) + "x (softcapped)</span>";
                }
                return format(this.effect()) + "x"; 
            },
            unlocked() { return hasUpgrade('c', 14) },
        },
        21: {
            title: "Premium Roast",
            description: "Gain 5x more Beans.",
            cost: new Decimal(11),
            
            // This magic function determines if the upgrade button is visible!
            unlocked() {
                // It checks if the Popularity layer ('p') has upgrade 12 bought
                return hasUpgrade('p', 12)
            },
        },
        22: {
            title: "Expert Supervision",
            description: "Barista Efficiency level boosts Customers.",
            cost: new Decimal(12), 
            effect() {
                // 1. Grab the current level of buyable 11 inside the Baristas layer ('b')
                let trainingLevel = getBuyableAmount('b', 11);
                
                // 2. formula: (Training Level * 0.25) + 1
                // Every level of training bought gives a flat +25% customer speed boost!
                return trainingLevel.times(0.25).add(1);
            },
            effectDisplay() { 
                return format(upgradeEffect(this.layer, this.id)) + "x" 
            },
            unlocked() { 
                // Only appears once the player has unlocked the Baristas layer milestone 0
                return hasMilestone('b', 0); 
            },
        },
        23: {
            title: "Cup of the Day",
            description: "Coffee Cups multiply Customers.",
            cost: new Decimal(13),
            effect() {
                // formula: (Coffee Cups * 0.2) + 1. 
                // Having 10 Coffee cups gives a 3x speed multiplier to customers!
                return player[this.layer].points.times(0.2).add(1);
            },
            effectDisplay() { 
                return format(upgradeEffect(this.layer, this.id)) + "x" 
            },
            
            unlocked() {
                return hasUpgrade('c', 22)
            },
        },
        24: {
            title: "Milk Steamers",
            description: "Unlocks Milk, it is based on Beans.",
            cost: new Decimal(15), 
            onPurchase() {
                player.c.milkTabUnlocked = true; // Permanently flips the switch
            },
            unlocked() { return hasUpgrade('c', 23) },
        },
        25: {
            title: "Expert Frothing",
            description: "Baristas boost Milk.",
            cost: new Decimal(18),  
            effect() {
                // formula: (Baristas * 0.5) + 1. 
                // Every hired Barista adds a flat +50% speed boost to your milk churning!
                return player.b.points.times(0.5).add(1);
            },
            effectDisplay() { 
                return format(upgradeEffect(this.layer, this.id)) + "x" 
            },
            unlocked() { 
                return hasUpgrade('c', 41) 
            },
        },
        31: {
            title: "Caffeine Lab Synergy",
            description: "Total Research Points multiply Beans.",
            cost: new Decimal(92),
            unlocked() { return hasMilestone('s', 1) }, // 🌟 Requires Star Milestone 1 (2 Stars)
            effect() { 
                 let totalRPCreated = getBuyableAmount('l', 11).add(getBuyableAmount('l', 12));
                // Compounding Formula: 1.05 raised to the power of total RP created
                return new Decimal(1.05).pow(totalRPCreated);
            },
            effectDisplay() { return format(this.effect()) + "x" }
        },
        32: {
            title: "Crowd Catalysis",
            description: "Customers boost Bean gain.",
            cost: new Decimal(96),
            unlocked() { return hasUpgrade('c', 31) },
            effect() { 
                return player.p.customers.add(1).pow(0.08); 
            },
            effectDisplay() { return format(this.effect()) + "x" }
        },
        33: {
            title: "BEANZ TAKE OVER",
            description: "Beans multiply Beans.",
            cost: new Decimal(105),
            unlocked() { return hasUpgrade('c', 32) },
            effect() {
                return player.points.add(1).pow(0.045)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            
        },
        34: {
            title: "Scientific Franchise",
            description: "Customers are multiplied by Classic Macchiato recipe level.",
            cost: new Decimal(130),
            unlocked() { return hasUpgrade('c', 33) },
            effect() {
                let macchLevel = getBuyableAmount('l', 51);
                return macchLevel.times(2).add(1); 
            },
            effectDisplay() { return format(this.effect()) + "x" }
        },
        35: {
            title: "The Grand Espresso",
            description: "Every upgrade purchased x1.12 boost Espresso Lab Recipes.",
            cost: new Decimal(200),
            unlocked() { return hasUpgrade('c', 34) }, // Star Milestone 1 (2 Stars)
            effect() {
                let totalUpgs = (player.c.upgrades?.length || 0) + 
                                (player.p.upgrades?.length || 0) + 
                                (player.b.upgrades?.length || 0);
                // Compounding math: 1.02 ^ Total Upgrades
                return new Decimal(1.12).pow(totalUpgs);
            },
            effectDisplay() { return format(this.effect()) + "x" }
        },
        
        // --- MILK UPGRADES ---
        41: {
            title: "Condensed Creamer",
            description: "Milk multiplies Beans.",
            cost: new Decimal(250),
            effect() {
                // 1. Calculate your original raw formula (e.g., scaling based on milk)
                let baseEffect = player.c.milk.add(1).pow(0.4); // Replace pow/formula with your exact original if different
                
                // 🌟 THE DIMINISHING POWER SHIELD 🌟
                // Triggers a progressive softcap if the effect crosses 1e300
                if (baseEffect.gt("1e150")) {
                    let excess = baseEffect.div("1e150");
                    
                    // Applies a 0.1 power dampener to the excess, flattening the curve safely
                    baseEffect = new Decimal("1e150").times(excess.pow(0.1));
                }
                return baseEffect;
            },
            // This updates the button text in real-time so players can see the exact active boost
            effectDisplay() { 
                let rawEffect = player.c.milk.add(1).pow(0.4);
                
                // 🎨 VISUAL ANCHOR: Turn the readout text amber-orange if it has passed the break pad!
                if (rawEffect.gt("1e150")) {
                    return "<span style='color: #cd0b0b; font-weight: bold;'>" + format(this.effect()) + "x (softcapped)</span>";
                }
                return format(this.effect()) + "x"; 
            },
            currencyDisplayName: "Milk",
            currencyInternalName: "milk",
            currencyLayer: "c",
            currencyLocation() { return player.c },
            unlocked() { return hasUpgrade('c', 24) } // Or whatever your trigger upgrade ID is!
        },
        42: {
            title: "Creamy Froth",
            description: "Milk multiplies Customers.",
            cost: new Decimal(2e4), // 20,000 Milk
            effect() {
                // formula: (Milk ^ 0.35) + 1.
                // Keeps it dynamic and balanced so your customer counts climb steadily!
                return player[this.layer].milk.add(1).pow(0.18);
            },
            effectDisplay() { 
                return format(upgradeEffect(this.layer, this.id)) + "x" 
            },
            currencyDisplayName: "Milk",
            currencyInternalName: "milk",
            currencyLayer: "c",
            currencyLocation() { return player.c },
            unlocked() { return hasUpgrade('c', 41) }
        },
        43: {
            title: "Pasteurization Pipeline",
            description: "Milk multiplies the effectiveness of Barista Efficiency.",
            cost: new Decimal(2.5e5), // Costs 250,000 Milk
            effect() {
                // Formula: (Milk Pots ^ 0.2) + 1
                // Steady, clean multiplier to power up your workers
                return player[this.layer].milk.add(1).pow(0.025);
            },
            effectDisplay() { 
                return format(upgradeEffect(this.layer, this.id)) + "x" 
            },
            currencyDisplayName: "Milk",
            currencyInternalName: "milk",
            currencyLayer: "c",
            currencyLocation() { return player.c },
            unlocked() { return hasUpgrade('c', 42) } // Chains after 42!
        },
        44: {
            title: "Chilled Storage Tanks",
            description: "Customers multiply Milk.",
            cost: new Decimal(5e6), // Costs 5,000,000 Milk
            effect() {
                 return player.p.customers.add(1).pow(0.22);
            },
            effectDisplay() { 
                return format(upgradeEffect(this.layer, this.id)) + "x" 
            },
            currencyDisplayName: "Milk",
            currencyInternalName: "milk",
            currencyLayer: "c",
            currencyLocation() { return player.c },
            unlocked() { return hasUpgrade('c', 43) } // Chains after 43!
        },
        45: {
            title: "You may order now!",
            description: "Milk multiplies Customers.",
            cost: new Decimal(2e9), // Costs 10,000,000,000 Milk 
            effect() {
                // Formula: (Milk Pots ^ 0.3) + 1
                // Clean, smooth scaling that accelerates rapidly in the millions!
                return player[this.layer].milk.add(1).pow(0.30);
            },
            effectDisplay() { 
                return format(upgradeEffect(this.layer, this.id)) + "x" 
            },
            currencyDisplayName: "Milk",
            currencyInternalName: "milk",
            currencyLayer: "c",
            currencyLocation() { return player.c },
            unlocked() { return hasUpgrade('c', 44) } // Chains cleanly after 44
        },
        
        51: {
            title: "Condensed Milk Chemistry",
            description: "Milk multiplied by Baristas.",
            cost: new Decimal(1e49), 
            unlocked() { 
                // 🌟 GATED BY STAR 2: Only reveals itself when Star Milestone 1 is completed!
                return hasMilestone('s', 1); 
            },
            effect() {
                // Smooth square-root scaling multiplier so it scales beautifully without runaway spikes
                return player.b.points.pow(1.75).add(1.25);
            },
            effectDisplay() { return format(this.effect()) + "x" },
            currencyDisplayName: "Milk",
            currencyInternalName: "milk",
            currencyLayer: "c",
            currencyLocation() { return player.c },
            unlocked() { return hasMilestone('s', 1) }
        },
        52: {
            title: "Premium Marketing Blend",
            description: "Milk boosts VIP Customers.",
            cost: new Decimal("1e98"), 
            
            effect() {
                // Re-calculates your current base milk gain to create a scaling multiplier
                let baseMilkGen = player.points.add(1).pow(0.09);
                // Logarithmic formula: log10(Base Milk + 1) * 1.5 + 1
                return baseMilkGen.add(1).log10().times(0.5).add(1);
            },
            effectDisplay() { return format(this.effect()) + "x" },
            currencyDisplayName: "Milk",
            currencyInternalName: "milk",
            currencyLayer: "c",
            currencyLocation() { return player.c },
            unlocked() { return hasMilestone('p', 1) }
        },
        53: {
            title: "Elites like Milk",
            description: "Milk boosts VIP Customers again.",
            cost: new Decimal("1e101"), 
            
            effect() {
                // Re-calculates your current base milk gain to create a scaling multiplier
                let baseMilkGen = player.points.add(1).pow(0.64);
                return baseMilkGen.add(1).log10().times(0.55).add(1);
            },
            effectDisplay() { return format(this.effect()) + "x" },
            currencyDisplayName: "Milk",
            currencyInternalName: "milk",
            currencyLayer: "c",
            currencyLocation() { return player.c },
            unlocked() { return hasUpgrade('c', 52) }
        },
        54: {
            title: "What makes Beans + Milk?",
            description: "Milk multiplies Beans.",
            cost: new Decimal("3.8e138"),
            effect() {
                return player[this.layer].milk.add(1.25).pow(0.055);
            },
            effectDisplay() { 
                return format(upgradeEffect(this.layer, this.id)) + "x" 
            },
            currencyDisplayName: "Milk",
            currencyInternalName: "milk",
            currencyLayer: "c",
            currencyLocation() { return player.c },
            unlocked() { return hasUpgrade('c', 53) } // Or whatever your trigger upgrade ID is!
        },
        55: {
            title: "The Grand Macchiato",
            description: "Milk floods the Espresso Lab Recipes.",
            cost: new Decimal("1e185"), 
            unlocked() { 
                return hasUpgrade('c', 54); // Reveals itself once you buy the preceding milk upgrade
            },
            effect() {
                let milkExponentSteps = player.c.milk.add(1).log10();
                return new Decimal(1.055).pow(milkExponentSteps);
            },
            currencyDisplayName: "Milk",
            currencyInternalName: "milk",
            currencyLayer: "c",
            currencyLocation() { return player.c },
            effectDisplay() { 
                return format(this.effect()) + "x" 
            }
        },
        
    },
    
})
        
    
