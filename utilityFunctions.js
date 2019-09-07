// Inventory Functions
function addItem(entity,item,amount) {
    let self;
    // When called from a component this == window
    if (this.app)
        self = this.app;
    // When called from from app.js this == the vue app
    else
        self = this;
    let inv = self[entity].inventory;
    if (amount instanceof Array)
        amount = parseInt(Math.random()*amount[1]) + amount[0];
    if (!inv[item.name])
        inv[item.name] = amount;
    else
        inv[item.name] += amount;
}

function removeItem(entity,item,amount) {
    addItem(entity,item,amount*-1);
}

function canAfford(inv,item,amount) {
    if (!inv[item] || inv[item] < amount)
        return false;
    else
        return true;
}

// Basic Utilities 
function prettyPrint(string) {
    string = string.replace(/_/g, ' ');
    return string.substr(0,1).toUpperCase() + string.substr(1);
}