addLayer("p", {
    name: "Popularity", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "P", // This appears on the layer's node. Default is the id with the first letter capitalized
    row: 3,
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        visible: true,
        unlocked: false,
		points: new Decimal(0),
        customers: new Decimal(0),
    }},
    color: "#5cd238",
    requires: new Decimal(10), // Can be a function that takes requirement increases into account
    resource: "Popularity", // Name of prestige currency
    baseResource: "Coffee Cups", // Name of resource prestige is based on
    baseAmount() {return player.c.points}, // Get the current amount of baseResource
    type: "static", // normal: cost to gain currency depends on amount gained. static: cost depends on how much you already have
    base: 1.1, // Base for the exponent of the static formula
    exponent: 1.45, // Prestige currency exponent
    gainMult() { // Calculate the multiplier for main currency from bonuses
        mult = new Decimal(1)
        return mult
    },
    gainExp() { // Calculate the exponent on main currency from bonuses
        return new Decimal(1)
    },
    canBuyMax() { 
        return hasMilestone('s', 0); 
    },

    update(diff) {
        if (player.p.unlocked) { 
            // 1. Calculate your base customer generation
            let customerGain = player.p.points.pow(new Decimal(1.38)); 
            
            // 2. ONLY apply the upgrades meant to boost Customers (13 and 22)
            if (hasUpgrade('p', 13)) customerGain = customerGain.times(upgradeEffect('p', 13))
            if (hasUpgrade('c', 22)) customerGain = customerGain.times(upgradeEffect('c', 22))
            if (hasUpgrade('c', 23)) {customerGain = customerGain.times(upgradeEffect('c', 23))}
            if (hasUpgrade('c', 42)) {customerGain = customerGain.times(upgradeEffect('c', 42))}
            if (hasUpgrade('c', 45)) {customerGain = customerGain.times(upgradeEffect('c', 45))}
            if (buyableEffect('l', 52)) customerGain = customerGain.times(buyableEffect('l', 52))

            // 3. Add to total balance
            player.p.customers = player.p.customers.add(customerGain.times(diff));
        }
    },

    tabFormat: [
        "main-display",
        "prestige-button",
        "blank",
        ["display-text", function() { 
            return "You have <h2 style='color: #3498DB'>" + format(player.p.customers) + "</h2> active Customers." 
        }],
        ["display-text", function() { 
            let gainPerSecond = player.p.points.pow(new Decimal(1.38)); 
            
            // Match the math exactly by only checking 13 and 22 here as well
            if (hasUpgrade('p', 13)) gainPerSecond = gainPerSecond.times(upgradeEffect('p', 13));
            if (hasUpgrade('c', 22)) gainPerSecond = gainPerSecond.times(upgradeEffect('c', 22));
            if (hasUpgrade('c', 23)) gainPerSecond = gainPerSecond.times(upgradeEffect('c', 23));

            if (hasUpgrade('c', 42)) gainPerSecond = gainPerSecond.times(upgradeEffect('c', 42));
            if (hasUpgrade('c', 45)) gainPerSecond = gainPerSecond.times(upgradeEffect('c', 45));
            if (buyableEffect('l', 52)) {
                gainPerSecond = gainPerSecond.times(buyableEffect('l', 52));
            }

            return "(+" + format(gainPerSecond) + "/sec)"
        }],
        "milestones",
        "blank",
        "upgrades"
    ],
            // --- Milestones ---
    milestones: {
        0: {
            requirementDescription: "1000 Customers",
            done() { 
                return player.p.customers.gte(1e3) // Checks your 'p' layer customers!
            },
            effectDescription: "Unlock bulk-buying for Coffee Cups.",
        },
    },

    row: 1, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "p", description: "P: Reset for Popularity", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},

    branches: [
        "c", "s" // Connects this layer directly to the Coffee Cups layer ('c')!
    ],
    
    upgrades: {
        11: {
            title: "Loyal Lads",
            description: "Customers multiply Beans.",
            cost: new Decimal(15),
            effect() {
                return player[this.layer].customers.add(1).pow(0.3)
            },
            effectDisplay() { return format(upgradeEffect(this.layer, this.id))+"x" },
            // --- ADD THESE 3 LINES TO CHANGE THE CURRENCY ---
            currencyDisplayName: "Customers",       // The name shown when you hover over the cost
            currencyInternalName: "customers",      // The exact variable name inside startData()
            currencyLayer: "p",                     // The layer ID where this variable lives ("p")
            currencyLocation() { return player.p },
        },
        12: {
            title: "Beans for Days",
            description: "Unlock new upgrades for Coffee Cups.",
            cost: new Decimal(100),

            currencyDisplayName: "Customers",       // The name shown when you hover over the cost
            currencyInternalName: "customers",      // The exact variable name inside startData()
            currencyLayer: "p",                     // The layer ID where this variable lives ("p")
            unlocked() {
                return hasUpgrade('p', 11)
            },
        },
        13: {
            title: "Popularity Boost",
            description: "Being popular attracts more customers.",
            cost: new Decimal(1e3),
            effect() {
                // formula: (Popularity Points * 0.5) + 1. 
                // If you have 4 Popularity, it provides a 3x multiplier to your customer generation speed!
                return player[this.layer].points.times(0.5).add(1);
            },
            effectDisplay() { 
                return format(upgradeEffect(this.layer, this.id)) + "x" 
            },

            currencyDisplayName: "Customers",       // The name shown when you hover over the cost
            currencyInternalName: "customers",      // The exact variable name inside startData()
            currencyLayer: "p",                     // The layer ID where this variable lives ("p")
            currencyLocation() { return player.p },
            unlocked() {
                return hasUpgrade('p', 12)
            },
        },
        14: {
            title: "Viral Marketing",
            description: "THEY NEED SOME MILK!!!",
            cost: new Decimal(1.5e5), // Costs 150,000 Customers
            effect() {
                return player[this.layer].customers.add(1).pow(0.21);
            },
            effectDisplay() { 
                return format(upgradeEffect(this.layer, this.id)) + "x" 
            },
            currencyDisplayName: "Customers",       
            currencyInternalName: "customers",      
            currencyLayer: "p",                     
            currencyLocation() { return player.p }, 
            unlocked() { return hasUpgrade('c', 41) }, // Chains cleanly after upgrade 41!
        },
        15: {
            title: "Franchise Phenomenon",
            description: "Customers like BEANSS so much now.",
            cost: new Decimal(5e11), // Costs 2,500 Customers (A solid mid-to-late goal)
            effect() {
                // Formula: (Customers ^ 0.4) + 1
                // When you have 10,000 customers, this will give a massive ~40x boost to Beans!
                return player[this.layer].customers.add(1).pow(0.47);
            },
            effectDisplay() { 
                return format(upgradeEffect(this.layer, this.id)) + "x" 
            },
            currencyDisplayName: "Customers",       
            currencyInternalName: "customers",      
            currencyLayer: "p",                     
            currencyLocation() { return player.p }, 
            unlocked() { return hasUpgrade('p', 14) }, // Chains perfectly after 14
        },
    }
    
})