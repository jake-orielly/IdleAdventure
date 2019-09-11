var perkList = [
            {level:0,perks:[
                {name:'Well Provided',text:'Start with 100 copper coins',func:()=>{app.startingInventory = {copper_coin: 100}},cost:1},
                {name:'Trust Fund',text:'Start with 300 copper coins',func:()=>{app.startingInventory = {copper_coin: 300}},cost:2}
            ]},
            {level:0,perks:[
                {name:'Robust',text:'Start with +1 str and +1 con',func:()=>{app.startingStr += 1; app.startingCon += 1;},cost:1},
                {name:'Burly',text:'Start with +3 str and +2 con',func:()=>{app.startingStr += 2; app.startingCon += 1;},cost:3}
            ]},
            {level:0,perks:[
                {name:'Thick Skin',text:'Start with +2 natural armor',func:()=>{app.startingAc += 2;},cost:1},
                {name:'Formidable',text:'Start with +5 natural armor',func:()=>{app.startingAc += 3;},cost:3}
            ]},
            {level:0,perks:[
                {name:'Naturally Adept',text:'Unlock magic at level 4',func:()=>{app.milestonesList[4].spell = 'fire_blast'; delete app.milestonesList[6]['spell'];},cost:1},
                {name:'Braniac',text:'Unlock magic at level 1',func:()=>{app.startingSpells = ['fire_blast']; delete app.milestonesList[4]['spell'];},cost:4}
            ]},
            {level:0,perks:[
                {name:'Clever Negotiator', text:'15% off all goods in the shop',func:()=>{app.costMultipler = 0.85},cost:2},
                {name:'Expert Haggler',text:'35% off all goods in the shop',func:()=>{app.costMultipler = 0.65},cost:4}
            ]},
            {level:0,perks:[
                {name:'Flexibility',text:'Can put points into any stat at from level one',func:()=>{app.startingStats = ['str','agi','con','int','wis']},cost:2}
            ]},
            {level:0,perks:[
                {name:'Statistically significant',text:'Start with 1 stat point to spend',func:()=>{app.startingPoints = 1},cost:1},
                {name:'Outlier',text:'Start with 3 stat points to spend',func:()=>{app.startingPoints = 3},cost:2},
                {name:'Naturally Gifted',text:'Start with 3 stat points to spend',func:()=>{app.startingPoints = 6},cost:5}
            ]}, 
            {level:0,perks:[
                {name:'Recovered Memories',text:'+5% xp from all sources',func:()=>{app.xpMultiplier = 1.05},cost:1},
                {name:'Psychic Regression',text:'+15% xp from all sources',func:()=>{app.xpMultiplier = 1.15},cost:3},
                {name:'Eidetic Memory',text:'+30% xp from all sources',func:()=>{app.xpMultiplier = 1.3},cost:8}
            ]},            
            {level:0,perks:[
                {name:'Time Dilation',text:'Time moves 10% faster during training',func:()=>{app.gameTickInterval = 18},cost:2},
                {name:'Chronomancer',text:'Time moves 25% faster during training',func:()=>{app.gameTickInterval = 15},cost:6}
            ]},
        ]