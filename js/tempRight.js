addLayer("tempRight", {
    name: "Future Project",
    symbol: "🔒",
    row: 2, 
    position: -1, // 🌟 THE WEIGHT: Sits in column 2 to balance out the row group!
    startData() { return {
        unlocked: false,
        points: new Decimal(0),
    }},
    color: "#7F8C8D", // A nice structural locked silver/gray
    type: "none",
    branches: [
        "s" // Connects this layer directly to the Star layer ('s')!
    ],
    
    // Keeps it hidden until you actually want it to appear later in development!
    // (If you want it invisible for now, return false. If you want it visible to test alignment, return true!)
    layerShown() { return false; } 
    
})