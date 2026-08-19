addLayer("b", { // "b" for Baristas
    name: "Baristas",
    symbol: "B",
    row: 1, // Sits on Row 1 next to Popularity!
    position: 1, // Position 1 puts it to the right of Popularity
    startData() { return {
        unlocked: false,
        points: new Decimal(0), // Tracks CURRENT Baristas
    }},
    color: "#E67E22", // A nice warm orange/brown color
    requires: new Decimal(11), // Requires 11 Coffee Cups
    resource: "Baristas",
    baseResource: "Coffee Cups",
    baseAmount() { return player.c.points }, // Checks your Coffee Cups layer!
    type: "static",
    base: 1.5, // Custom static scaling base
    exponent: 0.7,

    gainMult() { return new Decimal(1) },
    gainExp() { return new Decimal(1) },

    canBuyMax() { 
        return hasMilestone('s', 0); 
    },

     update(diff) {
        // --- STAR MILESTONE 1: AUTOMATED BARISTA HIRING ---
        // Automatically purchases Buyable 11 and Buyable 12 if affordable!
        if (hasMilestone('s', 1)) {
            if (canBuyBuyable('b', 11)) buyBuyable('b', 11);
            if (canBuyBuyable('b', 12)) buyBuyable('b', 12);
        }
    },
    // This handles the display on the screen
    tabFormat: [
        "main-display",
        "prestige-button",
        "blank",
        "milestones", // Draws your native milestone panel
        "blank",
        "buyables",
        "blank"    // Draws your buyables grid
    ],

    // --- MILESTONES CHECKING CURRENT BARISTAS ---
    milestones: {
        0: {
            requirementDescription: "1 Barista",
            done() { 
                return player.b.points.gte(1) // Checks current Baristas
            },
            effectDescription: "Unlock the Barista Efficiency buyable and a new Coffee Cups upgrade.",
        },
        1: {
            requirementDescription: "3 Baristas",
            done() { 
                return player.b.points.gte(3) // Checks current Baristas
            },
            effectDescription: "Unlock the Advanced Frothing Technique buyable.",
            unlocked() { return hasMilestone('b', 0) },
        },
        2: {
            requirementDescription: "16 Baristas",
            done() { 
                return player.b.points.gte(16) // Checks current Baristas
            },
            effectDescription: "Unlock the VIP Party? Buyable.",
            unlocked() {return hasMilestone('s', 1)},
        },
    },

    // --- BUYABLE THAT COSTS CUSTOMERS & BOOSTS BEANS ---
    buyables: {
        rows: 1, // REQUIRED: Tells the engine how many rows are in the buyable grid
        cols: 3, // REQUIRED: Tells the engine how many columns are in the buyable grid
        
        11: {
            title: "Barista Efficiency",
            cost(x) { 
                return new Decimal(50).times(new Decimal(1.75).pow(x)) 
            },
            display() { 
                return "Train your baristas to work faster.\n\n" +
                       "Level: " + formatWhole(player.b.buyables[this.id]) + "\n" +
                       "Cost: " + format(this.cost()) + " Customers\n\n" +
                       "Effect: Multiplies Beans by " + format(buyableEffect(this.layer, this.id)) + "x"
            },
            canAfford() { 
                return player.p.customers.gte(this.cost()) 
            },
            buy() {
               if (!hasMilestone('s', 1)) {
                    player.p.customers = player.p.customers.sub(this.cost());
                }
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                // Your current training level multiplier formula (1.25 ^ level)
                let baseEffect = new Decimal(1.25).pow(x);
                
                // --- 🌟 MANUALLY LINK COFFEE UPGRADE 43 ---
                // If they bought the upgrade in layer 'c', multiply your training power!
                if (hasUpgrade('c', 43)) {
                    baseEffect = baseEffect.times(upgradeEffect('c', 43));
                }
                
                return baseEffect;
            },
            unlocked() {
                return hasMilestone('b', 0)
            }
        },
        12: {
            title: "Advanced Frothing Technique",
            cost(x) { 
                // Costs 250 * (1.6 ^ level) Customers (slightly pricier than the first training)
                return new Decimal(250).times(new Decimal(1.6).pow(x)) 
            },
            display() { 
                return "Train your baristas in microfoam styling.\n\n" +
                       "Level: " + formatWhole(player.b.buyables[this.id]) + "\n" +
                       "Cost: " + format(this.cost()) + " Customers\n\n" +
                       "Effect: Multiplies Milk by " + format(buyableEffect(this.layer, this.id)) + "x"
            },
            canAfford() { 
                return player.p.customers.gte(this.cost()) 
            },
            buy() {
                if (!hasMilestone('s', 1)) {
                    player.p.customers = player.p.customers.sub(this.cost());
                }
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1))
            },
            effect(x) {
                // --- EXPONENTIAL MATH FORMULA ---
                // Gives a compounding 20% multiplier (1.20) per level purchased!
                // Formula: 1.20 ^ Level
                return new Decimal(1.20).pow(x);
            },
            unlocked() {
                // Stays hidden until they cross the 1 Barista milestone
                return hasMilestone('b', 1)
            }
        },
        13: {
            title: "VIP Party?",
            cost(x) { 
                return new Decimal("1e65").times(new Decimal(15).pow(x));
            },
            display() { 
                return "Senior Staff required for these people..\n\n" +
                       "Level: " + formatWhole(player.b.buyables[this.id]) + "\n" +
                       "Cost: " + format(this.cost()) + " Customers\n\n" +
                       "Effect: Multiplies VIP Customers by " + format(buyableEffect(this.layer, this.id)) + "x"
            },
            effect(x) {
                // Compounding Formula: Every level purchased grants a compounding 1.5x speed boost to VIP arrivals
                return new Decimal(1.25).pow(x);
            },
            canAfford() { 
                // Explicitly checks against your Barista prestige points wallet balance!
                return player.p.customers.gte(this.cost()); 
            },
            buy() {
                // 🌟 CROSS-LAYER SUBTRACTION: Deducts the amount straight from your customer pool!
                player.p.customers = player.p.customers.sub(this.cost());
                setBuyableAmount(this.layer, this.id, getBuyableAmount(this.layer, this.id).add(1));
            },
            unlocked() { 
                return hasMilestone('b', 2); // Revealed exclusively in the Star 2 Era!
            }
        },
    

    },
    branches: [
        "c", "p", "s"
    ],
    hotkeys: [
        {key: "b", description: "B: Reset for Baristas", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown() { return true }
})
