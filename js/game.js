// js/game.js
// Core Game Logic and State Machine for "One Piece: O Trono Vazio"

class GameEngine {
    constructor() {
        this.state = {
            currentAct: 1, // 1, 2, or 3
            currentRound: 1,
            activePlayerIdx: 0,
            actionPoints: 0,
            eventDeck: [],
            discardedEvents: [],
            activeEvents: [],
            weaponMarket: [],
            players: [],
            isRoundActive: false,
            winner: null,
            
            // Map state
            islands: [],
            connections: [],
            logs: []
        };
        
        // Active Combat state
        this.combatState = null;
    }

    // ==========================================================================
    // INITIALIZATION & SETUP
    // ==========================================================================

    initGame() {
        this.log("Iniciando o jogo...", "system");
        
        // Deep copy islands and connections from GAME_CARDS
        this.state.islands = JSON.parse(JSON.stringify(GAME_CARDS.islands));
        this.state.connections = JSON.parse(JSON.stringify(GAME_CARDS.connections));
        
        // Setup Event Deck for Act I
        this.setupEventDeck();
        
        // Setup Weapon Market (fill 3 slots)
        this.refillWeaponMarket();
        
        // Initialize Players
        this.initializePlayers();
        
        // Distribute 4 Road Poneglyphs procedurally under explorable islands (id 3 to 10)
        this.distributeRoadPoneglyphs();
        
        // Execute Board initial setup placements
        this.executeStartingSetup();
        
        this.state.currentRound = 1;
        this.state.currentAct = 1;
        this.state.activePlayerIdx = 0;
        this.state.isRoundActive = false;
        
        this.log("Setup inicial do Novo Mundo concluído!", "system");
    }

    initializePlayers() {
        // Asymmetric player setup
        this.state.players = [
            {
                id: 0,
                name: "Almirante",
                faction: "marine",
                baseNodeId: 1, // Nova Marineford
                apMax: 3,
                VPs: 0,
                berries: 6,
                hand: [],
                weapons: [],
                poneglyphs: [], // Original IDs
                rubbings: [], // Rubbings IDs
                ambition: {
                    name: "Justiça Absoluta",
                    targetVPs: 5,
                    desc: "Obtenha VPs destruindo frotas insurgentes e eliminando líderes.",
                    consequence: "Buster Call injetada no próximo Ato."
                }
            },
            {
                id: 1,
                name: "Yonkou",
                faction: "yonkou",
                baseNodeId: 8, // Nordeste base
                apMax: 3,
                VPs: 0,
                berries: 8,
                hand: [],
                weapons: [],
                poneglyphs: [],
                rubbings: [],
                ambition: {
                    name: "Império de Ferro",
                    targetVPs: 6,
                    desc: "Mantenha o controle da sua fortaleza e nós ao redor por VPs passivos.",
                    consequence: "Zona de Terror estabelecida (Tributos extra)."
                }
            },
            {
                id: 2,
                name: "Capitão Pirata",
                faction: "pirate",
                baseNodeId: 3, // Starts at entry nodes (Invernal/Selva)
                apMax: 4,
                VPs: 0,
                berries: 4,
                hand: [],
                weapons: [],
                poneglyphs: [],
                rubbings: [],
                ambition: {
                    name: "Aventureiro do Amanhecer",
                    targetVPs: 4,
                    desc: "Explore ilhas e complete Quests geográficas.",
                    consequence: "Revela atalhos de navegação permanentemente."
                }
            },
            {
                id: 3,
                name: "Agente Cipher-Pol",
                faction: "cipherpol",
                baseNodeId: 1, // Operates stealthy
                apMax: 4,
                VPs: 0,
                berries: 5,
                hand: [],
                weapons: [],
                poneglyphs: [],
                rubbings: [],
                ambition: {
                    name: "Égide Sombria",
                    targetVPs: 4,
                    desc: "Elimine líderes pelas costas e intercepte cópias de rubbings inimigos.",
                    consequence: "Aumenta vigilância de fronteiras."
                }
            },
            {
                id: 4,
                name: "Líder Revolucionário",
                faction: "rev",
                baseNodeId: 10, // Hidden base initially
                apMax: 4,
                VPs: 0,
                berries: 4,
                hand: [],
                weapons: [],
                poneglyphs: [],
                rubbings: [],
                ambition: {
                    name: "Chamas da Liberdade",
                    targetVPs: 5,
                    desc: "Espalhe células revolucionárias e provoque golpes de estado nas bases do governo.",
                    consequence: "Reduz tributos fiscais da marinha."
                }
            }
        ];
        
        // Deal 3 starting action cards to each player
        this.state.players.forEach(p => {
            for (let i = 0; i < 3; i++) {
                p.hand.push(this.drawActionCardFromDeck());
            }
        });
    }

    distributeRoadPoneglyphs() {
        // Pick 4 unique explorable island indices
        const explorableIds = [3, 4, 5, 6, 7, 8, 9, 10];
        const shuffled = explorableIds.sort(() => 0.5 - Math.random());
        const selectedIds = shuffled.slice(0, 4);
        
        // Attach Poneglyphs I, II, III, IV under these islands
        selectedIds.forEach((id, index) => {
            const island = this.state.islands.find(is => is.id === id);
            if (island) {
                island.poneglyph = index + 1; // 1 to 4
                this.log(`Poneglyph Road ${index + 1} oculto sob a ilha ${island.name} (Simulação).`, "system");
            }
        });
    }

    executeStartingSetup() {
        // Apply units according to Setup 1 template
        const setup = GAME_CARDS.setups[0];
        
        // 1. Setup Nova Marineford
        const marineford = this.state.islands.find(is => is.id === setup.marinefordId);
        marineford.baseStructure = "marineford";
        marineford.fleets = [
            { playerOwnerIdx: 0, unitType: "lider_almirante", maxPV: 4, currentPV: 4, pa: 4 },
            { playerOwnerIdx: 0, unitType: "navio_guerra", maxPV: 2, currentPV: 2, pa: 2 },
            { playerOwnerIdx: 0, unitType: "navio_basico", maxPV: 1, currentPV: 1, pa: 1 },
            { playerOwnerIdx: 0, unitType: "navio_basico", maxPV: 1, currentPV: 1, pa: 1 }
        ];

        // 2. Setup Yonkous starting zones
        const yonkou1Node = this.state.islands.find(is => is.id === setup.yonkouStarts[0].id);
        yonkou1Node.revealed = true;
        yonkou1Node.baseStructure = "fortaleza_yonkou";
        yonkou1Node.fleets = [
            { playerOwnerIdx: 1, unitType: "lider_yonkou", maxPV: 5, currentPV: 5, pa: 5 },
            { playerOwnerIdx: 1, unitType: "navio_comandante", maxPV: 2, currentPV: 2, pa: 2 },
            { playerOwnerIdx: 1, unitType: "navio_basico", maxPV: 1, currentPV: 1, pa: 1 },
            { playerOwnerIdx: 1, unitType: "navio_basico", maxPV: 1, currentPV: 1, pa: 1 }
        ];

        // 3. Setup Pirates at entry point (Island 3)
        const entryPirate = this.state.islands.find(is => is.id === setup.pirateEntryNodes[0]);
        entryPirate.revealed = true;
        entryPirate.fleets = [
            { playerOwnerIdx: 2, unitType: "lider_capitao", maxPV: 2, currentPV: 2, pa: 3 },
            { playerOwnerIdx: 2, unitType: "navio_capitao", maxPV: 3, currentPV: 3, pa: 2 }
        ];
        
        // 4. Setup Cipher-Pol and Revs (starting in hidden nodes)
        // Agente Cipher-Pol starts secret in Nova Marineford node
        marineford.fleets.push(
            { playerOwnerIdx: 3, unitType: "lider_cipherpol", maxPV: 3, currentPV: 3, pa: 3 }
        );
        
        // Revolucionário starts in Island 10 (Território Fantasma)
        const revNode = this.state.islands.find(is => is.id === 10);
        revNode.baseStructure = "base_revolucionaria";
        revNode.fleets = [
            { playerOwnerIdx: 4, unitType: "lider_rev", maxPV: 3, currentPV: 3, pa: 3 }
        ];
        
        // Add 1 Neutral Guarrison to Island 5 and Island 9 (Neutro)
        const neutralIslands = [5, 9];
        neutralIslands.forEach(id => {
            const island = this.state.islands.find(is => is.id === id);
            island.baseStructure = "forte_marinha";
            island.fleets = island.fleets || [];
            island.fleets.push(
                { playerOwnerIdx: 5, unitType: "navio_basico", maxPV: 1, currentPV: 1, pa: 1 } // PlayerOwnerIdx 5 represents neutral marine guarrison
            );
        });
    }

    // ==========================================================================
    // DECK MANAGEMENT HELPERS
    // ==========================================================================

    setupEventDeck() {
        let rawEvents = [];
        if (this.state.currentAct === 1) {
            rawEvents = [...GAME_CARDS.events.actI];
        } else if (this.state.currentAct === 2) {
            rawEvents = [...GAME_CARDS.events.actII];
        } else {
            rawEvents = [...GAME_CARDS.events.actIII];
        }
        
        // Shuffle events
        this.state.eventDeck = rawEvents.sort(() => 0.5 - Math.random());
    }

    drawActionCardFromDeck() {
        const pool = GAME_CARDS.actionCards;
        const randomCard = pool[Math.floor(Math.random() * pool.length)];
        return { ...randomCard, instanceId: Math.random().toString(36).substr(2, 9) };
    }

    refillWeaponMarket() {
        const pool = GAME_CARDS.weapons;
        while (this.state.weaponMarket.length < 3) {
            const randomW = pool[Math.floor(Math.random() * pool.length)];
            this.state.weaponMarket.push({ ...randomW, marketInstanceId: Math.random().toString(36).substr(2, 9) });
        }
    }

    log(message, type = "system") {
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        this.state.logs.push({ time: timestamp, message, type });
        // Cap logs at 100 entries
        if (this.state.logs.length > 100) this.state.logs.shift();
    }

    // ==========================================================================
    // GAME TURN STATE CONTROLS
    // ==========================================================================

    drawEraEvents() {
        if (this.state.isRoundActive) return;
        
        this.state.activeEvents = [];
        this.log(`Sacando Eventos da Era para a Rodada ${this.state.currentRound}...`, "system");
        
        // Draw 3 cards or until empty
        for (let i = 0; i < 3; i++) {
            if (this.state.eventDeck.length === 0) {
                this.log("Baralho de Eventos Esgotado! O Fim deste Ato está próximo.", "system");
                this.triggerEndAct();
                return;
            }
            const drawn = this.state.eventDeck.pop();
            this.state.activeEvents.push(drawn);
            this.log(`Evento Resolvido: ${drawn.name} - ${drawn.desc}`, "system");
        }
        
        this.state.isRoundActive = true;
        this.state.activePlayerIdx = 0;
        this.startPlayerTurn();
    }

    startPlayerTurn() {
        const player = this.state.players[this.state.activePlayerIdx];
        this.state.actionPoints = player.apMax;
        
        // MAINTENANCE PHASE:
        // 1. Draw 1 Action Card
        const drawn = this.drawActionCardFromDeck();
        player.hand.push(drawn);
        this.log(`${player.name} comprou 1 carta de Ação.`, "system");
        
        // 2. Collect Passive Income in Berries
        const income = this.calculatePassiveIncome(player);
        player.berries += income;
        this.log(`${player.name} coletou renda passiva de +${income} Berries (Total: ${player.berries}).`, "system");
        
        // Log turn start
        this.log(`Turno do ${player.name} iniciado! (${this.state.actionPoints} AP)`, "system");
    }

    calculatePassiveIncome(player) {
        let income = 1; // Base income
        
        if (player.faction === "marine") {
            // Count active naval forts or structures
            const activeStructs = this.state.islands.filter(is => is.baseStructure === "forte_marinha" || is.baseStructure === "marineford").length;
            income += activeStructs;
        } else if (player.faction === "yonkou") {
            // Count islands controlled by Yonkou
            const controlled = this.state.islands.filter(is => is.baseStructure === "fortaleza_yonkou").length;
            income += (controlled * 2);
        } else if (player.faction === "pirate") {
            // Count revealed islands with completed quests that player solved
            income += 1; // Simple representation of plundering
        } else if (player.faction === "rev") {
            // Revs earn based on cell count on board
            const totalCells = this.state.islands.reduce((acc, island) => {
                const cells = island.fleets ? island.fleets.filter(f => f.playerOwnerIdx === 4 && f.unitType === "celula").length : 0;
                return acc + cells;
            }, 0);
            income += Math.floor(totalCells / 2);
        }
        
        return income;
    }

    endPlayerTurn() {
        this.log(`Turno do ${this.state.players[this.state.activePlayerIdx].name} concluído.`, "system");
        
        this.state.activePlayerIdx++;
        if (this.state.activePlayerIdx >= this.state.players.length) {
            // End of Round
            this.state.activePlayerIdx = 0;
            this.state.currentRound++;
            this.state.isRoundActive = false;
            this.log(`Fim da Rodada ${this.state.currentRound - 1}. Comece sacando novos eventos da Era.`, "system");
            
            // Check Sudden Death for Government in Act III
            if (this.state.currentAct === 3) {
                this.checkSuddenDeathVictory();
            }
        } else {
            // Triggers active switcher display modal
            // (The controller bindings in ui.js will handle display of modal)
        }
    }

    spendAP(amount) {
        if (this.state.actionPoints >= amount) {
            this.state.actionPoints -= amount;
            return true;
        }
        return false;
    }

    // ==========================================================================
    // BASIC PLAYER ACTIONS
    // ==========================================================================

    moveFleet(fromId, toId, unitIndices) {
        if (this.state.actionPoints < 1) return false;
        
        const fromIsland = this.state.islands.find(is => is.id === fromId);
        const toIsland = this.state.islands.find(is => is.id === toId);
        
        // 1. Verify connectivity
        const connection = this.state.connections.find(conn => 
            (conn.from === fromId && conn.to === toId) || (conn.from === toId && conn.to === fromId)
        );
        if (!connection) {
            this.log("Caminho inválido: Ilhas não estão conectadas por rota marítima.", "system");
            return false;
        }

        // 2. Validate move permission
        const activeIdx = this.state.activePlayerIdx;
        const player = this.state.players[activeIdx];
        
        const movingUnits = [];
        unitIndices.sort((a,b) => b-a).forEach(idx => {
            movingUnits.push(fromIsland.fleets[idx]);
            fromIsland.fleets.splice(idx, 1);
        });

        if (movingUnits.length === 0) return false;
        
        this.spendAP(1);
        
        // Apply environment hazards if route contains warning
        let sufferedDamage = false;
        if (connection.hazard) {
            // Check if player has wood adam or kairouseki cannons
            const hasProtection = player.weapons.some(w => w.id === "wp_5" || w.id === "wp_1");
            if (!hasProtection) {
                // Apply 1 damage to basic navio
                const basicNav = movingUnits.find(u => u.unitType === "navio_basico");
                if (basicNav) {
                    basicNav.currentPV -= 1;
                    sufferedDamage = true;
                    this.log(`Perigo climático na rota! Seu ${basicNav.unitType} sofreu 1 de dano.`, "system");
                    // Cleanup if destroyed
                    if (basicNav.currentPV <= 0) {
                        const index = movingUnits.indexOf(basicNav);
                        movingUnits.splice(index, 1);
                        this.log(`Seu ${basicNav.unitType} afundou na tempestade.`, "system");
                    }
                }
            }
        }
        
        // Reveal toNode if hidden and stop movement there
        let stopDueToFog = false;
        if (!toIsland.revealed) {
            this.log(`Explorando novo território: ${toIsland.name}!`, "system");
            toIsland.revealed = true;
            stopDueToFog = true;
            
            // Check Navy seal on back: Spawns Neutral Marinha
            if (toIsland.type === "climate" && Math.random() > 0.5) { // Simulation of marine neutral guarrisons
                toIsland.baseStructure = "forte_marinha";
                toIsland.fleets = toIsland.fleets || [];
                toIsland.fleets.push({ playerOwnerIdx: 5, unitType: "navio_basico", maxPV: 1, currentPV: 1, pa: 1 });
                this.log(`Guarnição da Marinha Neutra avistada defendendo a ilha!`, "system");
            }
        }
        
        // Allocate units to toIsland
        toIsland.fleets = toIsland.fleets || [];
        toIsland.fleets.push(...movingUnits);
        
        this.log(`Frotas do ${player.name} movidas de ${fromIsland.name} para ${toIsland.name}.`, "system");
        return true;
    }

    recruitUnit(nodeId, unitType) {
        if (this.state.actionPoints < 1) return false;
        
        const island = this.state.islands.find(is => is.id === nodeId);
        const player = this.state.players[this.state.activePlayerIdx];
        
        let cost = 1; // Default basic unit cost
        let structureReq = false;
        
        if (unitType === "navio_guerra") cost = 3;
        if (unitType === "forte_marinha" || unitType === "fortaleza_yonkou") {
            cost = 4;
            structureReq = true;
        }

        if (player.berries < cost) {
            this.log(`Berries insuficientes para recrutar ${unitType} (Custo: ${cost} Berries).`, "system");
            return false;
        }
        
        this.spendAP(1);
        player.berries -= cost;
        
        if (structureReq) {
            island.baseStructure = unitType;
            this.log(`${player.name} construiu estrutura ${unitType} em ${island.name}.`, "system");
        } else {
            island.fleets = island.fleets || [];
            island.fleets.push({
                playerOwnerIdx: player.id,
                unitType: unitType,
                maxPV: unitType === "navio_guerra" ? 2 : 1,
                currentPV: unitType === "navio_guerra" ? 2 : 1,
                pa: unitType === "navio_guerra" ? 2 : 1
            });
            this.log(`${player.name} recrutou ${unitType} em ${island.name}.`, "system");
        }
        return true;
    }

    buyWeaponFromMarket(marketInstanceId) {
        if (this.state.actionPoints < 1) return false;
        
        const marketIdx = this.state.weaponMarket.findIndex(w => w.marketInstanceId === marketInstanceId);
        if (marketIdx === -1) return false;
        
        const weapon = this.state.weaponMarket[marketIdx];
        const player = this.state.players[this.state.activePlayerIdx];
        
        if (player.berries < weapon.cost) {
            this.log(`Berries insuficientes para comprar ${weapon.name} (Custo: ${weapon.cost} Berries).`, "system");
            return false;
        }
        
        this.spendAP(1);
        player.berries -= weapon.cost;
        player.weapons.push(weapon);
        
        // Remove from market and refill
        this.state.weaponMarket.splice(marketIdx, 1);
        this.refillWeaponMarket();
        
        this.log(`${player.name} comprou e equipou a arma: ${weapon.name}!`, "system");
        return true;
    }

    runQuest(nodeId, cardId) {
        if (this.state.actionPoints < 1) return false;
        
        const island = this.state.islands.find(is => is.id === nodeId);
        const player = this.state.players[this.state.activePlayerIdx];
        
        if (!island.quest) return false;
        
        // Check Yonkou penalty: must have commander
        if (player.faction === "yonkou") {
            const hasCommander = island.fleets.some(f => f.playerOwnerIdx === player.id && f.unitType === "navio_comandante");
            if (!hasCommander) {
                this.log("Yonkou deve possuir um Navio de Comandante no nó para realizar Quests!", "system");
                return false;
            }
        }
        
        this.spendAP(1);
        
        // Calculate power: Base unit power + Action card
        let actionCardBonus = 0;
        let cardText = "Nenhuma";
        if (cardId) {
            const cardIdx = player.hand.findIndex(c => c.instanceId === cardId);
            if (cardIdx !== -1) {
                const card = player.hand[cardIdx];
                actionCardBonus = card.pa;
                cardText = card.name;
                player.hand.splice(cardIdx, 1); // Discard card
            }
        }
        
        // Dice rolls (2D6)
        const d1 = Math.floor(Math.random() * 6) + 1;
        const d2 = Math.floor(Math.random() * 6) + 1;
        const diceSum = d1 + d2;
        
        const fleetPower = island.fleets
            .filter(f => f.playerOwnerIdx === player.id)
            .reduce((sum, f) => sum + f.pa, 0);
            
        const totalPower = fleetPower + actionCardBonus + diceSum;
        const difficulty = island.quest.difficulty;
        
        this.log(`Resolvendo Quest em ${island.name}. Rolagem: ${d1}+${d2}=${diceSum} + Frota: ${fleetPower} + Carta: ${actionCardBonus}. Total: ${totalPower} vs Dificuldade: ${difficulty}`, "system");
        
        const success = totalPower >= difficulty;
        
        if (success) {
            this.log(`Quest Superada com Sucesso: ${island.quest.name}!`, "system");
            player.VPs += 2; // VP Reward
            player.berries += 3; // Berries Reward
            
            // Check if Poneglyph is present
            if (island.poneglyph) {
                player.poneglyphs.push(island.poneglyph);
                this.log(`[SEGREDO] Road Poneglyph ${island.poneglyph} Original adquirido pelo jogador!`, "system");
                island.poneglyph = null;
            }
            
            island.quest = null; // Quest completed
        } else {
            this.log(`Falha ao resolver Quest. Frotas recuam ou sofrem fadiga.`, "system");
            // Damage 1 basic ship as penalty
            const ship = island.fleets.find(f => f.playerOwnerIdx === player.id && f.unitType === "navio_basico");
            if (ship) {
                ship.currentPV -= 1;
                if (ship.currentPV <= 0) {
                    const idx = island.fleets.indexOf(ship);
                    island.fleets.splice(idx, 1);
                    this.log("Seu navio básico afundou durante a Quest.", "system");
                }
            }
        }
        
        return { success, d1, d2, totalPower };
    }

    runRubbing(nodeId) {
        if (this.state.actionPoints < 1) return false;
        
        const island = this.state.islands.find(is => is.id === nodeId);
        const player = this.state.players[this.state.activePlayerIdx];
        
        this.spendAP(1);
        player.rubbings.push(nodeId);
        
        this.log(`${player.name} realizou uma Ação de Cópia (Rubbing) e obteve a Cópia do Poneglyph ${nodeId}!`, "system");
        return true;
    }

    // ==========================================================================
    // COMBAT SYSTEMS (Iniciativa, Blefe e Rolagem)
    // ==========================================================================

    initiateCombat(attackerIdx, defenderIdx, nodeId) {
        if (this.state.actionPoints < 1) return false;
        
        const island = this.state.islands.find(is => is.id === nodeId);
        const attacker = this.state.players[attackerIdx];
        const defender = this.state.players[defenderIdx];
        
        // Calculate basic initiative
        let initiativeOwnerIdx = attackerIdx;
        let infoMsg = "Iniciativa de Ataque do agressor.";
        
        // Exception: CP or Revs defending steals Initiative
        if (defender.faction === "cipherpol" || defender.faction === "rev") {
            initiativeOwnerIdx = defenderIdx;
            infoMsg = `Emboscada! ${defender.name} roubou a Iniciativa de Defesa pelas sombras.`;
        }
        
        this.spendAP(1);
        
        this.combatState = {
            nodeId: nodeId,
            attackerIdx: attackerIdx,
            defenderIdx: defenderIdx,
            initiativeIdx: initiativeOwnerIdx,
            attackerWeapon: null,
            defenderWeapon: null,
            attackerHakiCard: null,
            defenderHakiCard: null,
            stage: "stage_weapon", // stage_weapon -> stage_haki -> stage_roll -> stage_allocation
            attackerRoll: null,
            defenderRoll: null
        };
        
        this.log(`Combate declarado em ${island.name}: ${attacker.name} vs ${defender.name}. ${infoMsg}`, "combat");
        return true;
    }

    playCombatWeapon(attackerWId, defenderWId) {
        if (!this.combatState) return;
        
        const attacker = this.state.players[this.combatState.attackerIdx];
        const defender = this.state.players[this.combatState.defenderIdx];
        
        if (attackerWId) {
            this.combatState.attackerWeapon = attacker.weapons.find(w => w.id === attackerWId);
        }
        if (defenderWId) {
            this.combatState.defenderWeapon = defender.weapons.find(w => w.id === defenderWId);
        }
        
        this.combatState.stage = "stage_haki";
        this.log("Abre-Alas de Armas revelados. Iniciando disputa de Haki Secreto (Blefe)...", "combat");
    }

    combatSecretHakiBid(attackerCardInstanceId, defenderCardInstanceId) {
        if (!this.combatState || this.combatState.stage !== "stage_haki") return;
        
        const attacker = this.state.players[this.combatState.attackerIdx];
        const defender = this.state.players[this.combatState.defenderIdx];
        
        const attCardIdx = attacker.hand.findIndex(c => c.instanceId === attackerCardInstanceId);
        const defCardIdx = defender.hand.findIndex(c => c.instanceId === defenderCardInstanceId);
        
        if (attCardIdx !== -1) {
            this.combatState.attackerHakiCard = attacker.hand[attCardIdx];
            attacker.hand.splice(attCardIdx, 1); // Play card
        }
        
        if (defCardIdx !== -1) {
            this.combatState.defenderHakiCard = defender.hand[defCardIdx];
            defender.hand.splice(defCardIdx, 1);
        }
        
        this.combatState.stage = "stage_roll";
        this.log("Haki secreto revelado! Rola-se os dados customizados para o desfecho...", "combat");
    }

    rollCombatDice() {
        if (!this.combatState || this.combatState.stage !== "stage_roll") return;
        
        // Custom dice faces: 0, +1 PA, +1 PA, +1 PD, +1 PD, * (Choice: +2 PA or +2 PD)
        const customDiceFaces = [
            { label: "0", pa: 0, pd: 0 },
            { label: "+1 PA", pa: 1, pd: 0 },
            { label: "+1 PA", pa: 1, pd: 0 },
            { label: "+1 PD", pa: 0, pd: 1 },
            { label: "+1 PD", pa: 0, pd: 1 },
            { label: "★ CRÍTICO", pa: 2, pd: 0 } // Default to PA
        ];
        
        const attRoll = customDiceFaces[Math.floor(Math.random() * 6)];
        const defRoll = customDiceFaces[Math.floor(Math.random() * 6)];
        
        this.combatState.attackerRoll = attRoll;
        this.combatState.defenderRoll = defRoll;
        
        this.combatState.stage = "stage_allocation";
        this.log(`Dados rolam. Atacante: [${attRoll.label}], Defensor: [${defRoll.label}]. Calculando pools de força...`, "combat");
        
        return this.calculateCombatMath();
    }

    calculateCombatMath() {
        const island = this.state.islands.find(is => is.id === this.combatState.nodeId);
        const attacker = this.state.players[this.combatState.attackerIdx];
        const defender = this.state.players[this.combatState.defenderIdx];
        
        // Attacker Power Calculation
        const attBasePower = island.fleets
            .filter(f => f.playerOwnerIdx === attacker.id)
            .reduce((sum, f) => sum + f.pa, 0);
        const attWeaponBonus = this.combatState.attackerWeapon ? this.combatState.attackerWeapon.pa : 0;
        const attCardBonus = this.combatState.attackerHakiCard ? this.combatState.attackerHakiCard.pa : 0;
        const attDiceBonus = this.combatState.attackerRoll.pa;
        const totalPA = attBasePower + attWeaponBonus + attCardBonus + attDiceBonus;
        
        // Defender Power Calculation
        const defBasePower = island.fleets
            .filter(f => f.playerOwnerIdx === defender.id)
            .reduce((sum, f) => sum + f.pa, 0); // Fleets also have defensive attributes
        const defWeaponBonus = this.combatState.defenderWeapon ? this.combatState.defenderWeapon.pd : 0;
        const defCardBonus = this.combatState.defenderHakiCard ? this.combatState.defenderHakiCard.pd : 0;
        const defDiceBonus = this.combatState.defenderRoll.pd;
        const totalPD = defBasePower + defWeaponBonus + defCardBonus + defDiceBonus;
        
        return {
            attBase: attBasePower,
            attWeapon: attWeaponBonus,
            attCard: attCardBonus,
            attDice: attDiceBonus,
            attTotal: totalPA,
            
            defBase: defBasePower,
            defWeapon: defWeaponBonus,
            defCard: defCardBonus,
            defDice: defDiceBonus,
            defTotal: totalPD
        };
    }

    applyCombatAllocation(targetsMap) {
        if (!this.combatState || this.combatState.stage !== "stage_allocation") return;
        
        const island = this.state.islands.find(is => is.id === this.combatState.nodeId);
        const attacker = this.state.players[this.combatState.attackerIdx];
        const defender = this.state.players[this.combatState.defenderIdx];
        
        const math = this.calculateCombatMath();
        
        // Attacker deals math.attTotal damage points
        // Apply damage to selected targets (from targetsMap: { unitIndex: damageAmt })
        let overkillPA = math.attTotal;
        
        // Verify target map and apply to unit arrays
        // Sort keys in reverse order to handle splice safely
        const sortedIndices = Object.keys(targetsMap).map(Number).sort((a,b) => b-a);
        
        let targetDestroyed = false;
        let unitsToRemove = [];
        
        sortedIndices.forEach(idx => {
            const unit = island.fleets[idx];
            const dmg = targetsMap[idx] || 0;
            
            unit.currentPV -= dmg;
            overkillPA -= dmg;
            
            if (unit.currentPV <= 0) {
                // Unit destroyed
                unitsToRemove.push(idx);
                
                // Track if large structure or flagship was destroyed for loot triggers
                if (unit.unitType === "navio_capitao" || unit.unitType === "navio_comandante" || unit.unitType.includes("lider")) {
                    targetDestroyed = true;
                }
            }
        });
        
        // Remove destroyed units from board
        unitsToRemove.forEach(idx => {
            island.fleets.splice(idx, 1);
        });
        
        this.log(`Combate resolvido! Danos alocados nas frotas defensoras.`, "combat");
        
        // Execute Overkill Looting
        if (targetDestroyed && overkillPA > 0) {
            this.executeCombatLooting(attacker, defender, overkillPA);
        }
        
        // Reset state
        this.combatState = null;
    }

    executeCombatLooting(attacker, defender, overkillCount) {
        this.log(`Vitória avassaladora! Atacante realiza ${overkillCount} saques do oponente.`, "combat");
        
        for (let i = 0; i < overkillCount; i++) {
            // Priority 1: Rubbings / Copias
            if (defender.rubbings.length > 0) {
                const stolen = defender.rubbings.pop();
                attacker.rubbings.push(stolen);
                this.log(`Atacante roubou 1 Cópia de Rubbing do oponente.`, "trade");
                continue;
            }
            // Priority 2: Equipped Weapons
            if (defender.weapons.length > 0) {
                const stolenW = defender.weapons.pop();
                attacker.weapons.push(stolenW);
                this.log(`Atacante confiscou a arma: ${stolenW.name}!`, "trade");
                continue;
            }
            // Priority 3: Random Hand Action Card
            if (defender.hand.length > 0) {
                const cardIdx = Math.floor(Math.random() * defender.hand.length);
                const stolenC = defender.hand.splice(cardIdx, 1)[0];
                attacker.hand.push(stolenC);
                this.log(`Atacante roubou 1 Carta de Ação da mão do oponente.`, "trade");
                continue;
            }
            // Priority 4: Original Road Poneglyph
            if (defender.poneglyphs.length > 0) {
                const stolenP = defender.poneglyphs.pop();
                attacker.poneglyphs.push(stolenP);
                this.log(`[CRÍTICO] Atacante confiscou Road Poneglyph ${stolenP} Original do Defensor!`, "combat");
                break; // Max loot achieved
            }
        }
    }

    // ==========================================================================
    // CAMPAIGN TRANSITION LOGIC (ACTS & SUDDEN DEATHS)
    // ==========================================================================

    triggerEndAct() {
        this.log(`Fim do Ato ${this.state.currentAct} decretado! Paralisando partida para transições de Ambição.`, "system");
        // Transition calculations are evaluated in UI callback
    }

    resolveActTransition(selectedAmbitionsMap) {
        this.state.players.forEach(p => {
            const success = p.VPs >= p.ambition.targetVPs;
            this.log(`Jogador ${p.name} VP: ${p.VPs} vs Meta: ${p.ambition.targetVPs} -> ${success ? "SUCESSO" : "FRACASSO"}`, "system");
            
            // Set legacy card injection triggers
            if (success) {
                if (p.ambition.name === "Justiça Absoluta") {
                    this.state.eventDeck.unshift(GAME_CARDS.events.legacy.busterCall);
                } else if (p.ambition.name === "Chamas da Liberdade") {
                    this.state.eventDeck.unshift(GAME_CARDS.events.legacy.rebellion);
                } else if (p.ambition.name === "Justiça Burocrática") {
                    this.state.eventDeck.unshift(GAME_CARDS.events.legacy.monopoly);
                }
            }
            
            // Reset VP for next Act
            p.VPs = 0;
            
            // Assign next Act's Ambition from selected map
            if (selectedAmbitionsMap[p.id]) {
                p.ambition = selectedAmbitionsMap[p.id];
            }
        });
        
        // Advance current Act
        this.state.currentAct++;
        this.state.currentRound = 1;
        
        if (this.state.currentAct > 3) {
            this.declareFinalWinner();
        } else {
            this.setupEventDeck();
            this.log(`Iniciando o Ato ${this.state.currentAct} no Novo Mundo. Nova teia de eventos embaralhada!`, "system");
        }
    }

    checkSuddenDeathVictory() {
        // Condition 1: Encontrar o One Piece (Rebel victory)
        const rebels = this.state.players.filter(p => p.faction === "pirate" || p.faction === "yonkou" || p.faction === "rev");
        
        rebels.forEach(r => {
            // Must have all 4 poneglyphs rubbings or originals
            const uniquePoneglyphs = new Set([...r.poneglyphs, ...r.rubbings]);
            if (uniquePoneglyphs.size >= 4) {
                // If leader is at Laugh Tale (Node 2)
                const laughTale = this.state.islands.find(is => is.id === 2);
                const leaderAtLaughTale = laughTale.fleets.some(f => f.playerOwnerIdx === r.id && f.unitType.includes("lider"));
                if (leaderAtLaughTale) {
                    this.state.winner = r;
                    this.log(`Vitória Súbita! ${r.name} decifrou todas as pedras e encontrou o One Piece em Laugh Tale!`, "system");
                }
            }
        });
        
        // Condition 2: Apagar a História (Government victory)
        const gov = this.state.players.filter(p => p.faction === "marine" || p.faction === "cipherpol");
        gov.forEach(g => {
            const originalPoneglyphs = g.poneglyphs.length;
            if (originalPoneglyphs >= 4) {
                this.state.winner = g;
                this.log(`Vitória Súbita! O Governo Mundial encarcerou as 4 pedras Road Poneglyphs originais. A história foi apagada!`, "system");
            }
        });
    }

    declareFinalWinner() {
        // Impasse check: Winner is the one with highest cumulative VPs
        let bestPlayer = null;
        let maxVPs = -1;
        
        this.state.players.forEach(p => {
            if (p.VPs > maxVPs) {
                maxVPs = p.VPs;
                bestPlayer = p;
            }
        });
        
        this.state.winner = bestPlayer;
        this.log(`Fim de Campanha por Impasse Global! O vencedor por pontos de influência é: ${bestPlayer.name}!`, "system");
    }
}
window.GameEngine = GameEngine;
