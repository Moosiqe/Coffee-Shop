addLayer("h", { // "h" for Franchise Headquarters
    name: "Franchise HQ",
    symbol: "HQ",
    row: 2, 
    position: -1,
    
    startData() { return {
        unlocked: false,
        points: new Decimal(0), // Serves as your HQ Level!
        xp: new Decimal(0),     // Current stored Experience Points
    }},

    color: "#1ABC9C", // Sleek corporate Teal color palette
    resource: "HQ Level",
    type: "none",
    

    // GATING CONDITIONS: Reveals itself visually only when they cross the Star 3 barrier!
    layerShown() { return false; },

    // 📈 DYNAMIC EXPERIENCE REQUIREMENT SCHEDULE
    // Formula: Level^1.5 * 100 + 100
    xpRequirement() {
        let lvl = player.h.points;
        return lvl.pow(1.5).times(100).add(100).floor();
    },
    
    doReset(resettingLayer) {
        // 1. Completely flatten raw Beans (Row 0 core currency)
        player.points = new Decimal(0);
        
        // 2. Cleanly wipe all currencies, milestones, and upgrades for Row 0 and Row 1
        layerDataReset('c'); // Resets Coffee Cups & Milk data instantly
        layerDataReset('p'); // Resets Popularity & Customers data instantly
        layerDataReset('b'); // Resets Baristas & Staff data instantly
    },
    // 🔄 REAL-TIME BACKGROUND PROCESSING LOOP
    update(diff) {
        if (!player.h.unlocked && player.s.points.gte(3)) player.h.unlocked = true;

        if (player.h.unlocked) {
            // --- A. CLEAN BASELINE 1.5 XP PER SECOND TICKER ---
            // 🌟 NOTE: Since 1^anything is always 1, we raise the base ticker to 1.5 XP/sec 
            // so your new exponent reward actively accelerates your leveling track!
            let xpGain = new Decimal(1.5);

            // --- B. CHALLENGES EXPONENT ACCELERATION ---
            let xpExponent = new Decimal(1);
            
            // 🌟 FIXED VIA POW: Challenge 11 adds +^0.01 to the global XP exponent per level!
            let c11Completions = challengeCompletions('h', 11);
            if (c11Completions > 0) {
                xpExponent = xpExponent.add(new Decimal(c11Completions).times(0.01));
            }
            let c12Completions = challengeCompletions('h', 12);
            if (c12Completions > 0) {
                xpExponent = xpExponent.add(new Decimal(c11Completions).times(0.02));
            }
            let c13Completions = challengeCompletions('h', 13);
            if (c13Completions > 0) {
                xpExponent = xpExponent.add(new Decimal(c11Completions).times(0.03));
            }
            let c21Completions = challengeCompletions('h', 21);
            if (c21Completions > 0) {
                xpExponent = xpExponent.add(new Decimal(c11Completions).times(0.04));
            }
            let c22Completions = challengeCompletions('h', 22);
            if (c22Completions > 0) {
                xpExponent = xpExponent.add(new Decimal(c11Completions).times(0.05));
            }
            let c23Completions = challengeCompletions('h', 23);
            if (c23Completions > 0) {
                xpExponent = xpExponent.add(new Decimal(c11Completions).times(0.06));
            }
            
            // Inject the exponential surge to your generation velocity
            let finalXpGain = xpGain.pow(xpExponent);
            player.h.xp = player.h.xp.add(finalXpGain.times(diff));

            // --- C. AUTOMATIC LEVEL-UP CHECKER ---
            let req = this.xpRequirement();
            while (player.h.xp.gte(req)) {
                player.h.xp = player.h.xp.sub(req);
                player.h.points = player.h.points.add(1);
                req = this.xpRequirement(); 
            }

            // --- D. SINGLE-POINT EXECUTIVE MATH HUB ---
            let hqLvl = player.h.points;
            window.hqBeanMult     = hqLvl.gte(3)  ? new Decimal(1.15).pow(hqLvl.sub(2))  : new Decimal(1);
            window.hqCustomerMult = hqLvl.gte(8)  ? new Decimal(1.20).pow(hqLvl.sub(7))  : new Decimal(1);
            window.hqMilkMult     = hqLvl.gte(15) ? new Decimal(1.25).pow(hqLvl.sub(14)) : new Decimal(1);
            window.hqVipMult      = hqLvl.gte(35) ? new Decimal(1.30).pow(hqLvl.sub(34)) : new Decimal(1);
        } else {
            window.hqBeanMult     = new Decimal(1);
            window.hqCustomerMult = new Decimal(1);
            window.hqMilkMult     = new Decimal(1);
            window.hqVipMult      = new Decimal(1);
        }
    },

    // 🎨 EXECUTIVE INTERFACE DASHBOARD BUILDER
    tabFormat: [
        "main-display",
        "blank",
        ["display-text", function() {
            let req = layers.h.xpRequirement();
            let pct = player.h.xp.div(req).times(100).toNumber().toFixed(1);
            if (pct > 100) pct = 100;

            // Re-calculates current real-time gain speed safely for the on-screen UI text
            let currentGain = new Decimal(1);
            let c11Completions = challengeCompletions('h', 11);
            if (c11Completions > 0) currentGain = currentGain.times(new Decimal(1.5).pow(c11Completions));

            return "<h4>Corporate Progression Track</h4><br>" +
                   "Current Experience: <b style='color: #1ABC9C;'>" + format(player.h.xp) + "</b> / " + formatWhole(req) + " XP (+" + format(currentGain) + "/sec)<br><br>" +
                   "<div style='width: 300px; height: 20px; background-color: #2C3E50; border-radius: 10px; overflow: hidden; margin: 0 auto; border: 2px solid #7F8C8D;'>" +
                   "<div style='width: " + pct + "%; height: 100%; background-color: #1ABC9C; transition: width 0.1s;'></div>" +
                   "</div>" +
                   "<span style='font-size: 11px; color: #BDC3C7;'>" + pct + "% to next HQ level</span>";
        }],
        "blank",
        ["display-text", function() {
            if (!player.h.unlocked) return "";
            
            let hqLvl = player.h.points;
            
            // Fetch your live background multipliers from your global variables smoothly
            let bMult = window.hqBeanMult || new Decimal(1);
            let cMult = window.hqCustomerMult || new Decimal(1);
            let mMult = window.hqMilkMult || new Decimal(1);
            let vMult = window.hqVipMult || new Decimal(1);
            
            // 🛡️ Conditional Label Layout Generator (Applies beautiful green vs red text states)
            let beanLabel = hqLvl.gte(3) 
                ? "<b style='color: #1ABC9C;'>" + format(bMult) + "x</b>" 
                : "<span style='color: #E74C3C;'>HQ Level 3 required</span>";
            
            let customerLabel = hqLvl.gte(8) 
                ? "<b style='color: #1ABC9C;'>" + format(cMult) + "x</b>" 
                : "<span style='color: #E74C3C;'>HQ Level 8 required</span>";
            
            let milkLabel = hqLvl.gte(15) 
                ? "<b style='color: #1ABC9C;'>" + format(mMult) + "x</b>" 
                : "<span style='color: #E74C3C;'>HQ Level 15 required</span>";
            
            let vipLabel = hqLvl.gte(35) 
                ? "<b style='color: #1ABC9C;'>" + format(vMult) + "x</b>" 
                : "<span style='color: #E74C3C;'>HQ Level 35 required</span>";
            
            return "<div style='text-align: center; margin: 15px 0; line-height: 1.8; font-size: 14px;'>" +
                   "• <b>Beans:</b> " + beanLabel + "<br>" +
                   "• <b>Customers:</b> " + customerLabel + "<br>" +
                   "• <b>Milk:</b> " + milkLabel + "<br>" +
                   "• <b>VIP Customers:</b> " + vipLabel + "" +
                   "</div>";
        }],
        "hr",
        "blank",
        ["display-text", "<h3>Corporate Level Benchmarks</h3>"],
        "milestones", 
        "blank",
        "hr",
        "blank",
        ["display-text", "<h3>Operational Performance Challenges</h3>"],
        ["display-text", "These challenges will exponentially boost XP, it will be an adventure!"],
        "blank",
        "challenges" 
    ],

    // 🏆 LEVEL-GATED BENCHMARK REWARDS
    milestones: {
        0: {
            requirementDescription: "🏢 HQ Level 5",
            done() { return player.h.points.gte(5) },
            effectDescription: "Unlocks Operational Challenges 12 and 13.",
        },
        1: {
            requirementDescription: "🏢 HQ Level 25",
            done() { return player.h.points.gte(25) },
            effectDescription: "Unlocks Operational Challenges 21 and 22.",
        },
        2: {
            requirementDescription: "🏢 HQ Level 125",
            done() { return player.h.points.gte(125) },
            effectDescription: "Unlocks the Final Operational Challenge 23.",
        }
    },

    // ⚔️ INITIALIZING THE OPERATIONAL CHALLENGES SYSTEM
    challenges: {
        11: {
            name: "Labor ugh!",
            completionLimit: 10, // 🌟 FIXED VIA NATIVE TMT: Sets up your 10-tier multi-completion limit!
            challengeDescription() {
                // Dynamically calculates your next target milestone step based on current completions!
                // Tier 1 = 1e45 Beans | Tier 2 = 1e55 Beans | Tier 3 = 1e65 Beans, etc.
                let comps = challengeCompletions('h', 11);
                let nextGoal = new Decimal("1e45").times(new Decimal("1e10").pow(comps));
                return "Everything crashes down, you have do everything manually again + things cost more due to inflation :(<br>";
                       
            },
            goal() {
                let comps = challengeCompletions('h', 11);
                return new Decimal("1e45").times(new Decimal("1e10").pow(comps));
            },
            currencyDisplayName: "Beans",
            currencyInternalName: "points",
            // Native reward tracker readout description text
             rewardDescription() {
                let comps = challengeCompletions('h', 11);
                let currentExponentBonus = comps * 0.01;
                return "Each completion level adds +^0.01 XP exponent.<br>" +
                       "Current Total Reward: <b>^" + currentExponentBonus.toFixed(2) + " XP</b>";
            },
            
            canStart() { return player.h.unlocked },
        },
        
    },

    branches: ["s"] // Hooks a visual canvas tracking vector connector line directly to the Stars layer!
});
