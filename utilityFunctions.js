// Inventory Functions
function addItem(inventory,item,amount) {
    console.log(inventory)
    if (amount instanceof Array)
        amount = parseInt(Math.random()*(amount[1] - amount[0])) + amount[0];
    if (!inventory[item.name])
        inventory[item.name] = amount;
    else
        inventory[item.name] += amount;
    app.$emit('invChange');
}

function removeItem(inventory,item,amount) {
    if (amount == 'all')
        delete inventory[item.name];
    else
        addItem(inventory,item,amount*-1);
}

function canAfford(inv,item,amount) {
    if (!inv[item] || inv[item] < amount)
        return false;
    else
        return true;
}

// Basic Utilities 
function prettyPrint(given) {
    if (given == undefined)
        return;
    if (isNaN(given)) {
        let arr = given.split('_')
        for (let i = 0; i < arr.length; i++)
            arr[i] = arr[i].substr(0,1).toUpperCase() + arr[i].substr(1);
        return arr.join(' ');
    }
    else {
        if (given < 0.1)
            return '' + (parseInt(given * 100)/100);
        else 
            return '' + (parseInt(given * 10)/10);
    }
}