addLayer("c", {
    name: "Coffee Cups", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "C", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
        milk: new Decimal(0), // Tracks the number of Milk Pots the player has
        milkTabUnlocked: false,
    }},
    keep: {
        // This function tells the engine what to preserve during a reset
        custom(layer) {
            // If the reset is triggered by Layer 'p' (Popularity) or Layer 'b' (Baristas)
            if (layer == "p" || layer == "b") {
                // Return a list of the exact variable names you want to save!
                return ["milk", "upgrades"[4, 5]]; // This will preserve the Milk count and any upgrades in the 40+ grid
            }
        }
    },
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

    update(diff) {
       if (hasUpgrade('c', 24)) { 
            
            // 1. Calculate base milk gain
            let milkGain = player.points.add(1).pow(0.125);
            
            // --- UPDATED: Apply your Barista-powered Upgrade 25 boost ---
            if (hasUpgrade('c', 25)) {
                milkGain = milkGain.times(upgradeEffect('c', 25));
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
                "prestige-button",
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
                    return "You have <h2 style='color: #FDFEFE; text-shadow: 0 0 5px #BDC3C7;'>" + format(player.c.milk) + "</h2> Milk."
                    if (hasUpgrade('c', 25)) milkGain = milkGain.times(upgradeEffect('c', 25));
                }],
                
                ["display-text", function() {
                    let milkGain = player.points.add(1).pow(0.125);
                    return "(+" + format(milkGain) + "/sec)"
                }],
                
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
        if (layers[resettingLayer].row > this.row) {
            player.c.points = new Decimal(0); // Wipe your Coffee Cups normally
            
            // --- UPDATED SMART UPGRADE FILTER ---
            player.c.upgrades = player.c.upgrades.filter(upg => {
                let upgradeID = String(upg);
                
                // 1. Always keep Row 4 (Milk upgrades)
                if (upgradeID.startsWith('4')) return true;
                
                // 2. NEW: If they have Popularity Milestone 1, also keep Row 1 upgrades!
                if (hasMilestone('p', 1) && upgradeID.startsWith('1')) return true;
                
                // Otherwise, wipe the upgrade (Row 2 and Row 3)
                return false;
            });
            
            // Your milk variables and tracker switches remain totally untouched!
        }
    },

    canBuyMax() {
    return hasMilestone('p', 1); // Checks layer 'p', milestone 1
    },
    
    upgrades: {
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
                return player.points.add(1).pow(0.41)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
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
            description: "Barista Training level boosts Customers.",
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
            cost: new Decimal(18), // Costs 25 Coffee Cups
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
        // --- MILK UPGRADES ---
        41: {
            title: "Condensed Creamer",
            description: "Milk multiplies Beans.",
            cost: new Decimal(250),
            effect() {
                // formula: (Milk ^ 0.40) + 1. 
                // The "+ 1" ensures your multiplier is at least 1x so your game doesn't crash when milk is 0!
                // The ".pow(0.4)" keeps the growth balanced so numbers don't explode into infinity too fast.
                return player[this.layer].milk.add(1).pow(0.40);
            },
            // This updates the button text in real-time so players can see the exact active boost
            effectDisplay() { 
                return format(upgradeEffect(this.layer, this.id)) + "x" 
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
            cost: new Decimal(3e4),
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
            unlocked() { return player.c.milkTabUnlocked } 
        },
    },
    
})
        
    
