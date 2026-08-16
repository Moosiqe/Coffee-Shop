addLayer("c", {
    name: "Coffee Cups", // This is optional, only used in a few places, If absent it just uses the layer id.
    symbol: "C", // This appears on the layer's node. Default is the id with the first letter capitalized
    position: 0, // Horizontal position within a row. By default it uses the layer id and sorts in alphabetical order
    startData() { return {
        unlocked: true,
		points: new Decimal(0),
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
    
    row: 0, // Row the layer is in on the tree (0 is the first row)
    hotkeys: [
        {key: "c", description: "C: Reset for Coffee Cups", onPress(){if (canReset(this.layer)) doReset(this.layer)}},
    ],
    layerShown(){return true},

    canBuyMax() {
    return hasMilestone('p', 1); // Checks layer 'p', milestone 1
    },
    
    upgrades: {
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
                return player.points.add(1).pow(0.38)
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
            title: "Cup of the Day",
            description: "Coffee Cups multiply Customers.",
            cost: new Decimal(14),
            effect() {
                // formula: (Coffee Cups * 0.2) + 1. 
                // Having 10 Coffee cups gives a 3x speed multiplier to customers!
                return player[this.layer].points.times(0.2).add(1);
            },
            effectDisplay() { 
                return format(upgradeEffect(this.layer, this.id)) + "x" 
            },
            
            unlocked() {
                return hasUpgrade('p', 21)
            },
        },
    },
    
})
        
    
