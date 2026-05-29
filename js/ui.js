// js/ui.js
// UI Rendering, DOM Binding and Interactive Operations

class BoardUI {
    constructor(engine) {
        this.engine = engine;
        this.selectedNodeId = null;
        this.selectedUnitsIdx = [];
        this.combatAllocationMap = {};
        
        this.initDOM();
    }

    initDOM() {
        // Initialize Game State
        this.engine.initGame();
        
        // Setup Map Interaction and Zoom
        this.setupMapZoomAndPan();
        
        // Global Actions
        document.getElementById("btn-draw-events").addEventListener("click", () => this.drawEvents());
        document.getElementById("btn-end-turn").addEventListener("click", () => this.endActiveTurn());
        document.getElementById("btn-confirm-turn").addEventListener("click", () => this.confirmTurnReveal());
        
        // Modal Closures
        document.getElementById("btn-quest-close").addEventListener("click", () => this.closeModal("modal-quest"));
        document.getElementById("btn-trade-close").addEventListener("click", () => this.closeModal("modal-trade"));
        
        // Action Panel Buttons
        document.getElementById("act-move").addEventListener("click", () => this.executeMoveAction());
        document.getElementById("act-recruit").addEventListener("click", () => this.executeRecruitAction());
        document.getElementById("act-quest").addEventListener("click", () => this.executeQuestAction());
        document.getElementById("act-combat").addEventListener("click", () => this.executeCombatAction());
        document.getElementById("act-rubbing").addEventListener("click", () => this.executeRubbingAction());
        document.getElementById("act-market").addEventListener("click", () => this.executeMarketAction());
        
        document.getElementById("btn-trade").addEventListener("click", () => this.openTradeModal());
        document.getElementById("btn-trade-execute").addEventListener("click", () => this.executeTradeTransaction());
        
        // Trigger Setup Initial Drawing
        this.renderAll();
    }

    // ==========================================================================
    // RENDER CORE PANELS
    // ==========================================================================

    renderAll() {
        this.renderHeader();
        this.renderPlayersList();
        this.renderMap();
        this.renderActionConsole();
        this.renderWeaponMarket();
        this.renderLogConsole();
    }

    renderHeader() {
        const state = this.engine.state;
        const romanActs = ["I", "II", "III"];
        
        document.getElementById("act-indicator").querySelector(".value").innerText = romanActs[state.currentAct - 1] || "III";
        document.getElementById("round-indicator").querySelector(".value").innerText = state.currentRound;
        document.getElementById("events-left-indicator").querySelector(".value").innerText = state.eventDeck.length;
        
        const activePlayer = state.players[state.activePlayerIdx];
        const activeName = document.getElementById("active-player-name");
        activeName.innerText = activePlayer ? activePlayer.name : "Ninguém";
        activeName.className = `player-pill faction-${activePlayer ? activePlayer.faction : 'neutral'}`;
        
        document.getElementById("active-ap").innerText = `${state.actionPoints} PA`;
        
        // Toggle Draw Event button based on round state
        const drawBtn = document.getElementById("btn-draw-events");
        drawBtn.disabled = state.isRoundActive;
    }

    renderPlayersList() {
        const container = document.getElementById("players-list");
        container.innerHTML = "";
        
        this.engine.state.players.forEach((p, idx) => {
            const card = document.createElement("div");
            card.className = `player-board-card faction-${p.faction} ${idx === this.engine.state.activePlayerIdx ? 'active-card' : ''}`;
            
            // Build Poneglyphs badges
            let poneglyphsHTML = "";
            p.poneglyphs.forEach(id => {
                poneglyphsHTML += `<span class="badge-item poneglyph-badge">🔴 Poneglyph ${id}</span>`;
            });
            p.rubbings.forEach(id => {
                poneglyphsHTML += `<span class="badge-item">📄 Cópia ${id}</span>`;
            });
            
            card.innerHTML = `
                <div class="card-header">
                    <span class="player-title">${p.name}</span>
                    <span class="player-role-badge">${p.faction}</span>
                </div>
                <span class="player-ambition-text">Meta: ${p.ambition.name}</span>
                <div class="player-stats-row">
                    <div class="stat-item">
                        <span class="label">VPs</span>
                        <span class="val highlight">${p.VPs} / ${p.ambition.targetVPs}</span>
                    </div>
                    <div class="stat-item">
                        <span class="label">BERRIES</span>
                        <span class="val">${p.berries} ฿</span>
                    </div>
                    <div class="stat-item">
                        <span class="label">CARTAS</span>
                        <span class="val">${p.hand.length}</span>
                    </div>
                </div>
                <div class="player-inventory-badges">
                    ${poneglyphsHTML || '<span class="badge-item" style="color:var(--text-muted)">Sem segredos</span>'}
                </div>
            `;
            container.appendChild(card);
        });
    }

    renderWeaponMarket() {
        const container = document.getElementById("market-cards");
        container.innerHTML = "";
        
        this.engine.state.weaponMarket.forEach(w => {
            const card = document.createElement("div");
            card.className = "weapon-card";
            card.innerHTML = `
                <div>
                    <div class="title">${w.name}</div>
                    <div class="stats">${w.pa > 0 ? '+'+w.pa+' PA' : ''} ${w.pd > 0 ? '+'+w.pd+' PD' : ''}</div>
                </div>
                <div class="cost">${w.cost} Berries</div>
            `;
            card.addEventListener("click", () => {
                if (this.engine.state.isRoundActive && this.engine.state.actionPoints > 0) {
                    if (confirm(`Deseja comprar ${w.name} por ${w.cost} Berries?`)) {
                        this.engine.buyWeaponFromMarket(w.marketInstanceId);
                        this.renderAll();
                    }
                }
            });
            container.appendChild(card);
        });
    }

    renderLogConsole() {
        const container = document.getElementById("log-content");
        container.innerHTML = "";
        
        this.engine.state.logs.forEach(log => {
            const div = document.createElement("div");
            div.className = `log-entry ${log.type}`;
            div.innerHTML = `<span class="time">[${log.time}]</span>${log.message}`;
            container.appendChild(div);
        });
        
        // Scroll to bottom
        container.scrollTop = container.scrollHeight;
    }

    // ==========================================================================
    // RENDER INTERACTIVE SVG MAP
    // ==========================================================================

    renderMap() {
        const bgG = document.getElementById("map-background");
        const connectionsG = document.getElementById("map-connections");
        const nodesG = document.getElementById("map-nodes");
        const tokensG = document.getElementById("map-tokens");
        
        bgG.innerHTML = "";
        connectionsG.innerHTML = "";
        nodesG.innerHTML = "";
        tokensG.innerHTML = "";
        
        // 1. Draw Red Line background border decoration
        const redLine = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        redLine.setAttribute("x", "0");
        redLine.setAttribute("y", "0");
        redLine.setAttribute("width", "35");
        redLine.setAttribute("height", "650");
        redLine.setAttribute("fill", "url(#redline-grad)");
        bgG.appendChild(redLine);
        
        const redLineText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        redLineText.setAttribute("x", "18");
        redLineText.setAttribute("y", "325");
        redLineText.setAttribute("fill", "rgba(255,255,255,0.4)");
        redLineText.setAttribute("font-family", "var(--font-heading)");
        redLineText.setAttribute("font-size", "14px");
        redLineText.setAttribute("letter-spacing", "6px");
        redLineText.setAttribute("writing-mode", "tb");
        redLineText.setAttribute("text-anchor", "middle");
        redLineText.textContent = "RED LINE";
        bgG.appendChild(redLineText);
        
        // 2. Draw Routes Connections
        this.engine.state.connections.forEach(conn => {
            const from = this.engine.state.islands.find(is => is.id === conn.from);
            const to = this.engine.state.islands.find(is => is.id === conn.to);
            
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", from.x);
            line.setAttribute("y1", from.y);
            line.setAttribute("x2", to.x);
            line.setAttribute("y2", to.y);
            line.className.baseValue = `map-route ${conn.hazard ? 'hazard' : ''}`;
            
            // Highlight connections related to selected node
            if (this.selectedNodeId === conn.from || this.selectedNodeId === conn.to) {
                line.classList.add("active");
            }
            
            connectionsG.appendChild(line);
        });
        
        // 3. Draw Island Nodes
        this.engine.state.islands.forEach(island => {
            const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
            group.className.baseValue = `node-group ${!island.revealed ? 'unexplored' : ''} ${this.selectedNodeId === island.id ? 'selected' : ''}`;
            
            if (island.baseStructure === "forte_marinha" || island.baseStructure === "marineford") {
                group.classList.add("marine-guarrison");
            }
            if (island.baseStructure === "marineford") {
                group.classList.add("navy-ford");
            }
            
            // Outer glowing ring
            const ring = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            ring.setAttribute("cx", island.x);
            ring.setAttribute("cy", island.y);
            ring.setAttribute("r", 32);
            ring.className.baseValue = "node-ring";
            group.appendChild(ring);
            
            // Island core circle
            const core = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            core.setAttribute("cx", island.x);
            core.setAttribute("cy", island.y);
            core.setAttribute("r", 25);
            
            // Assign premium gradient depending on island type
            let gradientClass = "type-unexplored";
            if (island.revealed) {
                if (island.id === 1) gradientClass = "type-naval";
                else if (island.id === 2) gradientClass = "type-final";
                else if (island.name.includes("Invernal")) gradientClass = "type-winter";
                else if (island.name.includes("Vulcânica")) gradientClass = "type-volcano";
                else if (island.name.includes("Deserto")) gradientClass = "type-desert";
                else if (island.name.includes("Selva") || island.name.includes("Ruínas")) gradientClass = "type-nature";
                else if (island.name.includes("País") || island.name.includes("Fantasma")) gradientClass = "type-mystery";
                else gradientClass = "type-mystery";
            }
            core.className.baseValue = `island-base ${gradientClass}`;
            group.appendChild(core);
            
            // Structure Badge (if present)
            if (island.baseStructure) {
                const badge = document.createElementNS("http://www.w3.org/2000/svg", "rect");
                badge.setAttribute("x", island.x - 12);
                badge.setAttribute("y", island.y - 30);
                badge.setAttribute("width", 24);
                badge.setAttribute("height", 10);
                badge.setAttribute("rx", 2);
                badge.setAttribute("fill", island.baseStructure.includes("marine") || island.baseStructure === "marineford" ? "var(--color-marine)" : "var(--color-yonkou)");
                group.appendChild(badge);
                
                const structText = document.createElementNS("http://www.w3.org/2000/svg", "text");
                structText.setAttribute("x", island.x);
                structText.setAttribute("y", island.y - 23);
                structText.setAttribute("fill", "#000");
                structText.setAttribute("font-size", "7px");
                structText.setAttribute("font-weight", "800");
                structText.setAttribute("text-anchor", "middle");
                structText.textContent = island.baseStructure === "forte_marinha" ? "NAVY" : (island.baseStructure === "marineford" ? "HQ" : "YONK");
                group.appendChild(structText);
            }
            
            // Text Label
            const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
            label.setAttribute("x", island.x);
            label.setAttribute("y", island.y + 42);
            label.className.baseValue = "island-label";
            label.textContent = island.revealed ? island.name : "Desconhecido";
            group.appendChild(label);
            
            // Draw fleets / tokens around the node
            if (island.revealed && island.fleets && island.fleets.length > 0) {
                this.renderFleetTokens(island, tokensG);
            }
            
            // Click Handler
            group.addEventListener("click", (e) => {
                e.stopPropagation();
                this.selectNode(island.id);
            });
            
            nodesG.appendChild(group);
        });
    }

    renderFleetTokens(island, containerG) {
        const players = this.engine.state.players;
        const total = island.fleets.length;
        
        // Arrange tokens in a circle around the island center
        const radius = 35;
        island.fleets.forEach((fleet, index) => {
            const angle = (index / total) * 2 * Math.PI - Math.PI / 2;
            const tx = island.x + radius * Math.cos(angle);
            const ty = island.y + radius * Math.sin(angle);
            
            const tokenGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
            const isSelected = (this.selectedNodeId === island.id && this.selectedUnitsIdx.includes(index));
            
            const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            circle.setAttribute("cx", tx);
            circle.setAttribute("cy", ty);
            circle.setAttribute("r", isSelected ? 11 : 9);
            circle.className.baseValue = `token-circle ${isSelected ? 'selected' : ''}`;
            
            // Faction color
            let color = "gray";
            let shortName = "N"; // Neutro
            
            if (fleet.playerOwnerIdx !== 5) {
                const owner = players[fleet.playerOwnerIdx];
                if (owner.faction === "marine") { color = "var(--color-marine)"; shortName = "A"; }
                if (owner.faction === "cipherpol") { color = "var(--color-cipherpol)"; shortName = "CP"; }
                if (owner.faction === "yonkou") { color = "var(--color-yonkou)"; shortName = "Y"; }
                if (owner.faction === "pirate") { color = "var(--color-pirate)"; shortName = "P"; }
                if (owner.faction === "rev") { color = "var(--color-rev)"; shortName = "R"; }
            } else {
                color = "#444";
                shortName = "M"; // Neutral marine
            }
            
            circle.setAttribute("fill", color);
            tokenGroup.appendChild(circle);
            
            const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
            label.setAttribute("x", tx);
            label.setAttribute("y", ty);
            label.className.baseValue = "token-text";
            label.textContent = shortName;
            tokenGroup.appendChild(label);
            
            // Click to toggle unit selection inside node
            tokenGroup.addEventListener("click", (e) => {
                e.stopPropagation();
                this.toggleUnitSelection(island.id, index);
            });
            
            containerG.appendChild(tokenGroup);
        });
    }

    setupMapZoomAndPan() {
        const svg = document.getElementById("board-svg");
        let zoom = 1.0;
        
        document.getElementById("btn-zoom-in").addEventListener("click", () => {
            zoom += 0.1;
            svg.style.transform = `scale(${zoom})`;
        });
        document.getElementById("btn-zoom-out").addEventListener("click", () => {
            if (zoom > 0.6) {
                zoom -= 0.1;
                svg.style.transform = `scale(${zoom})`;
            }
        });
        document.getElementById("btn-zoom-fit").addEventListener("click", () => {
            zoom = 1.0;
            svg.style.transform = `scale(1.0)`;
        });
    }

    // ==========================================================================
    // SELECTION & ACTION STATE HELPERS
    // ==========================================================================

    selectNode(nodeId) {
        this.selectedNodeId = nodeId;
        this.selectedUnitsIdx = []; // Reset selected units
        this.renderAll();
    }

    toggleUnitSelection(nodeId, index) {
        // Select node first
        this.selectedNodeId = nodeId;
        
        const pos = this.selectedUnitsIdx.indexOf(index);
        if (pos === -1) {
            this.selectedUnitsIdx.push(index);
        } else {
            this.selectedUnitsIdx.splice(pos, 1);
        }
        
        this.renderAll();
    }

    renderActionConsole() {
        const state = this.engine.state;
        const activePlayer = state.players[state.activePlayerIdx];
        
        // Disabled by default
        let canMove = false;
        let canRecruit = false;
        let canQuest = false;
        let canCombat = false;
        let canRubbing = false;
        let canMarket = false;
        
        if (state.isRoundActive && state.actionPoints > 0 && this.selectedNodeId) {
            const island = state.islands.find(is => is.id === this.selectedNodeId);
            
            // 1. Move verification: player owns selected units in selected node
            const hasMyUnits = island.fleets && island.fleets.some(f => f.playerOwnerIdx === activePlayer.id);
            if (hasMyUnits && this.selectedUnitsIdx.length > 0) {
                canMove = true;
            }
            
            // 2. Recruit: player base presence
            if (island.revealed && (island.baseStructure || island.id === activePlayer.baseNodeId)) {
                canRecruit = true;
            }
            
            // 3. Quest: Island has quest, player has fleets, and faction is Pirate/Yonkou
            const hasQuest = island.quest !== null && island.revealed;
            const isExplorer = activePlayer.faction === "pirate" || activePlayer.faction === "yonkou";
            if (hasQuest && hasMyUnits && isExplorer) {
                canQuest = true;
            }
            
            // 4. Combat: Other player fleets present in node
            const hasEnemyUnits = island.fleets && island.fleets.some(f => f.playerOwnerIdx !== activePlayer.id);
            if (hasMyUnits && hasEnemyUnits) {
                canCombat = true;
            }
            
            // 5. Rubbing: Poneglyph hidden quest done, player present
            const originalOwned = activePlayer.poneglyphs.includes(island.id);
            const rubbingNotOwned = !activePlayer.rubbings.includes(island.id);
            if (originalOwned && rubbingNotOwned) {
                canRubbing = true;
            }
            
            canMarket = true;
        }
        
        document.getElementById("act-move").disabled = !canMove;
        document.getElementById("act-recruit").disabled = !canRecruit;
        document.getElementById("act-quest").disabled = !canQuest;
        document.getElementById("act-combat").disabled = !canCombat;
        document.getElementById("act-rubbing").disabled = !canRubbing;
        document.getElementById("act-market").disabled = !canMarket;
    }

    // ==========================================================================
    // PLAY ACTION TRIGGER IMPLEMENTATIONS
    // ==========================================================================

    drawEvents() {
        this.engine.drawEraEvents();
        this.renderAll();
        
        // Show Event Space Cards
        const container = document.getElementById("event-cards-container");
        container.innerHTML = "";
        
        this.engine.state.activeEvents.forEach(evt => {
            const card = document.createElement("div");
            card.className = `event-card ${evt.id.includes('legacy') ? 'legacy' : ''}`;
            card.innerHTML = `
                <div class="card-title">${evt.name}</div>
                <div class="card-desc">${evt.desc}</div>
            `;
            container.appendChild(card);
        });
    }

    executeMoveAction() {
        // Prompt user to select destination island
        const state = this.engine.state;
        const currentIsland = state.islands.find(is => is.id === this.selectedNodeId);
        
        // Find adjacent islands
        const connections = state.connections.filter(c => c.from === this.selectedNodeId || c.to === this.selectedNodeId);
        const adjacentIds = connections.map(c => c.from === this.selectedNodeId ? c.to : c.from);
        
        const adjIslands = state.islands.filter(is => adjacentIds.includes(is.id));
        const islandListStr = adjIslands.map(is => `${is.id}: ${is.name}`).join("\n");
        
        const choice = prompt(`Para qual ilha deseja navegar?\n${islandListStr}`);
        const targetId = parseInt(choice);
        
        if (adjacentIds.includes(targetId)) {
            const success = this.engine.moveFleet(this.selectedNodeId, targetId, this.selectedUnitsIdx);
            if (success) {
                this.selectedNodeId = targetId; // Focus on target
                this.selectedUnitsIdx = [];
            }
            this.renderAll();
        } else {
            alert("Seleção inválida de destino.");
        }
    }

    executeRecruitAction() {
        const choices = [
            "1: Navio Básico (Custo: 1 Berry)",
            "2: Navio de Guerra (Custo: 3 Berries)",
            "3: Forte Básico Marinha (Custo: 4 Berries)",
            "4: Fortaleza Yonkou (Custo: 4 Berries)"
        ];
        const selection = prompt(`O que deseja recrutar?\n${choices.join("\n")}`);
        
        let unit = null;
        if (selection === "1") unit = "navio_basico";
        if (selection === "2") unit = "navio_guerra";
        if (selection === "3") unit = "forte_marinha";
        if (selection === "4") unit = "fortaleza_yonkou";
        
        if (unit) {
            this.engine.recruitUnit(this.selectedNodeId, unit);
            this.renderAll();
        }
    }

    executeMarketAction() {
        // Triggers purchase from visible market black list
        alert("Clique diretamente em uma das armas do Mercado Negro para efetuar a compra.");
    }

    executeRubbingAction() {
        this.engine.runRubbing(this.selectedNodeId);
        this.renderAll();
    }

    // ==========================================================================
    // QUEST RESOLUTION MODAL BINDINGS
    // ==========================================================================

    executeQuestAction() {
        const island = this.engine.state.islands.find(is => is.id === this.selectedNodeId);
        const player = this.engine.state.players[this.engine.state.activePlayerIdx];
        
        this.openModal("modal-quest");
        
        document.getElementById("quest-island-details").innerHTML = `
            <h3>${island.quest.name}</h3>
            <p>${island.quest.desc}</p>
            <div class="difficulty">Fadiga / Dificuldade: <strong>${island.quest.difficulty}</strong></div>
        `;
        
        document.getElementById("quest-fleet-power").innerText = island.fleets
            .filter(f => f.playerOwnerIdx === player.id)
            .reduce((sum, f) => sum + f.pa, 0);
            
        document.getElementById("quest-difficulty").innerText = island.quest.difficulty;
        document.getElementById("quest-card-power").innerText = "0";
        
        // Show player action cards hand choices
        const handBox = document.getElementById("quest-card-hand");
        handBox.innerHTML = "";
        
        let selectedCardId = null;
        player.hand.forEach(card => {
            const mCard = document.createElement("div");
            mCard.className = "mini-card";
            mCard.innerHTML = `
                <span class="val">+${card.pa}</span>
                <span class="type">${card.name}</span>
            `;
            mCard.addEventListener("click", () => {
                // Toggle selection
                const prevSelected = handBox.querySelector(".selected");
                if (prevSelected) prevSelected.classList.remove("selected");
                
                mCard.classList.add("selected");
                selectedCardId = card.instanceId;
                document.getElementById("quest-card-power").innerText = card.pa;
            });
            handBox.appendChild(mCard);
        });
        
        // Setup Roll Trigger
        const rollBtn = document.getElementById("btn-quest-roll");
        rollBtn.className = "btn-primary";
        rollBtn.disabled = false;
        
        document.getElementById("quest-roll-section").className = "hidden";
        
        // Remove previous listeners
        const newRollBtn = rollBtn.cloneNode(true);
        rollBtn.parentNode.replaceChild(newRollBtn, rollBtn);
        
        newRollBtn.addEventListener("click", () => {
            newRollBtn.disabled = true;
            const animD1 = document.getElementById("quest-d1");
            const animD2 = document.getElementById("quest-d2");
            
            animD1.classList.add("roll");
            animD2.classList.add("roll");
            
            setTimeout(() => {
                animD1.classList.remove("roll");
                animD2.classList.remove("roll");
                
                const result = this.engine.runQuest(this.selectedNodeId, selectedCardId);
                
                animD1.innerText = result.d1;
                animD2.innerText = result.d2;
                
                document.getElementById("quest-roll-section").className = "quest-roll-results";
                document.getElementById("quest-result-text").innerText = result.success ? "SUCESSO! Saques adquiridos!" : "FALHA! A frota recuou com fadiga.";
                
                this.renderAll();
            }, 600);
        });
    }

    // ==========================================================================
    // COMBAT MODAL RESOLUTION FLOW
    // ==========================================================================

    executeCombatAction() {
        const island = this.engine.state.islands.find(is => is.id === this.selectedNodeId);
        const player = this.engine.state.players[this.engine.state.activePlayerIdx];
        
        // Find other players fleets present
        const otherFleets = island.fleets.filter(f => f.playerOwnerIdx !== player.id);
        const uniqueDefenders = [...new Set(otherFleets.map(f => f.playerOwnerIdx))];
        
        if (uniqueDefenders.length === 0) return;
        
        // Simple selection of target defender for multi-presence nodes
        let defenderIdx = uniqueDefenders[0];
        if (uniqueDefenders.length > 1) {
            const choices = uniqueDefenders.map(id => `${id}: ${this.engine.state.players[id].name}`).join("\n");
            const sel = prompt(`Qual facção deseja atacar?\n${choices}`);
            defenderIdx = parseInt(sel);
        }
        
        const success = this.engine.initiateCombat(player.id, defenderIdx, this.selectedNodeId);
        if (success) {
            this.openCombatModal();
        }
    }

    openCombatModal() {
        const state = this.engine.combatState;
        const attacker = this.engine.state.players[state.attackerIdx];
        const defender = this.engine.state.players[state.defenderIdx];
        const island = this.engine.state.islands.find(is => is.id === state.nodeId);
        
        this.openModal("modal-combat");
        
        // Reset states
        document.getElementById("attacker-combat-roll-box").className = "combat-result-box hidden";
        document.getElementById("defender-combat-roll-box").className = "combat-result-box hidden";
        document.getElementById("combat-allocation-controls").className = "hidden";
        document.getElementById("btn-combat-reveal").className = "btn-primary btn-lg";
        
        // Bind attacker labels
        document.getElementById("combat-attacker-box").querySelector(".side-player-name").innerText = attacker.name;
        document.getElementById("combat-attacker-box").querySelector(".side-faction").innerText = attacker.faction;
        
        // Bind defender labels
        document.getElementById("combat-defender-box").querySelector(".side-player-name").innerText = defender.name;
        document.getElementById("combat-defender-box").querySelector(".side-faction").innerText = defender.faction;
        
        // Draw units summary lists
        this.renderCombatSideUnits("combat-attacker-units", attacker.id, island);
        this.renderCombatSideUnits("combat-defender-units", defender.id, island);
        
        // Initiative Label
        const initText = state.initiativeIdx === attacker.id ? `Iniciativa: Atacante (${attacker.name})` : `Emboscada: Defensor (${defender.name})`;
        document.getElementById("combat-initiative-badge").innerText = initText;
        
        // Phase 1 Setup: weapons choice
        this.setupCombatWeaponChoices("attacker-weapon-choices", attacker);
        this.setupCombatWeaponChoices("defender-weapon-choices", defender);
        
        // Phase 2 Setup: secret haki hand
        this.setupCombatHakiChoices("attacker-haki-hand", attacker);
        this.setupCombatHakiChoices("defender-haki-hand", defender);
        
        // Bind Reveal & Roll Button
        const revealBtn = document.getElementById("btn-combat-reveal");
        const newRevealBtn = revealBtn.cloneNode(true);
        revealBtn.parentNode.replaceChild(newRevealBtn, revealBtn);
        
        newRevealBtn.addEventListener("click", () => {
            this.executeCombatRevealAndDiceRoll();
        });
    }

    renderCombatSideUnits(containerId, playerId, island) {
        const box = document.getElementById(containerId);
        box.innerHTML = "";
        const units = island.fleets.filter(f => f.playerOwnerIdx === playerId);
        units.forEach(u => {
            const div = document.createElement("div");
            div.className = "combat-unit-row";
            div.innerHTML = `🛡️ ${u.unitType} (PA: ${u.pa} / PV: ${u.currentPV})`;
            box.appendChild(div);
        });
    }

    setupCombatWeaponChoices(containerId, player) {
        const box = document.getElementById(containerId);
        box.innerHTML = "";
        
        // Empty Weapon option
        const none = document.createElement("div");
        none.className = "weapon-choice selected";
        none.innerText = "Sem Arma";
        none.dataset.id = "";
        none.addEventListener("click", () => {
            box.querySelector(".selected").classList.remove("selected");
            none.classList.add("selected");
        });
        box.appendChild(none);
        
        player.weapons.forEach(w => {
            const item = document.createElement("div");
            item.className = "weapon-choice";
            item.innerText = `${w.name} (+${w.pa} PA / +${w.pd} PD)`;
            item.dataset.id = w.id;
            item.addEventListener("click", () => {
                box.querySelector(".selected").classList.remove("selected");
                item.classList.add("selected");
            });
            box.appendChild(item);
        });
    }

    setupCombatHakiChoices(containerId, player) {
        const box = document.getElementById(containerId);
        box.innerHTML = "";
        
        player.hand.forEach(c => {
            const item = document.createElement("div");
            item.className = "mini-card";
            item.dataset.instanceId = c.instanceId;
            item.innerHTML = `
                <span class="val">${c.pa}/${c.pd}</span>
                <span class="type">${c.name}</span>
            `;
            item.addEventListener("click", () => {
                const prev = box.querySelector(".selected");
                if (prev) prev.classList.remove("selected");
                item.classList.add("selected");
            });
            box.appendChild(item);
        });
    }

    executeCombatRevealAndDiceRoll() {
        const state = this.engine.combatState;
        
        // Grab values from selections
        const attWChoice = document.getElementById("attacker-weapon-choices").querySelector(".selected").dataset.id;
        const defWChoice = document.getElementById("defender-weapon-choices").querySelector(".selected").dataset.id;
        
        const attHakiSel = document.getElementById("attacker-haki-hand").querySelector(".selected");
        const defHakiSel = document.getElementById("defender-haki-hand").querySelector(".selected");
        
        const attHakiId = attHakiSel ? attHakiSel.dataset.instanceId : null;
        const defHakiId = defHakiSel ? defHakiSel.dataset.instanceId : null;
        
        // Update engine combat steps
        this.engine.playCombatWeapon(attWChoice, defWChoice);
        this.engine.combatSecretHakiBid(attHakiId, defHakiId);
        
        // Roll dice
        const diceBtn = document.getElementById("btn-combat-reveal");
        diceBtn.disabled = true;
        
        const attDice = document.getElementById("attacker-dice");
        const defDice = document.getElementById("defender-dice");
        
        attDice.classList.add("roll");
        defDice.classList.add("roll");
        
        setTimeout(() => {
            attDice.classList.remove("roll");
            defDice.classList.remove("roll");
            
            const math = this.engine.rollCombatDice();
            
            attDice.innerText = this.engine.combatState.attackerRoll.label;
            defDice.innerText = this.engine.combatState.defenderRoll.label;
            
            // Show result boxes
            document.getElementById("attacker-combat-roll-box").className = "combat-result-box";
            document.getElementById("defender-combat-roll-box").className = "combat-result-box";
            
            // Print calculations
            document.getElementById("att-base").innerText = math.attBase;
            document.getElementById("att-weapon").innerText = math.attWeapon;
            document.getElementById("att-secret").innerText = math.attCard;
            document.getElementById("att-dice-val").innerText = math.attDice;
            document.getElementById("att-total").innerText = math.attTotal;
            
            document.getElementById("def-base").innerText = math.defBase;
            document.getElementById("def-weapon").innerText = math.defWeapon;
            document.getElementById("def-secret").innerText = math.defCard;
            document.getElementById("def-dice-val").innerText = math.defDice;
            document.getElementById("def-total").innerText = math.defTotal;
            
            // Proceed to allocation stage
            diceBtn.className = "hidden";
            this.setupDamageAllocationStage(math);
        }, 600);
    }

    setupDamageAllocationStage(math) {
        document.getElementById("combat-allocation-controls").className = "";
        
        const island = this.engine.state.islands.find(is => is.id === this.engine.combatState.nodeId);
        const defender = this.engine.state.players[this.engine.combatState.defenderIdx];
        const units = island.fleets.filter(f => f.playerOwnerIdx === defender.id);
        
        const container = document.getElementById("allocation-targets");
        container.innerHTML = "";
        
        this.combatAllocationMap = {};
        let remainingPA = math.attTotal;
        
        // Find indices relative to global fleet list
        units.forEach(u => {
            const globalIdx = island.fleets.indexOf(u);
            this.combatAllocationMap[globalIdx] = 0;
            
            const row = document.createElement("div");
            row.className = "allocation-row";
            row.innerHTML = `
                <span>${u.unitType} (PV: ${u.currentPV})</span>
                <div class="alloc-buttons">
                    <button class="btn-icon btn-dec">-</button>
                    <span class="alloc-val">0</span>
                    <button class="btn-icon btn-inc">+</button>
                </div>
            `;
            
            const dec = row.querySelector(".btn-dec");
            const inc = row.querySelector(".btn-inc");
            const valSpan = row.querySelector(".alloc-val");
            
            dec.addEventListener("click", () => {
                if (this.combatAllocationMap[globalIdx] > 0) {
                    this.combatAllocationMap[globalIdx]--;
                    remainingPA++;
                    valSpan.innerText = this.combatAllocationMap[globalIdx];
                    this.updateAllocationInstructions(remainingPA);
                }
            });
            
            inc.addEventListener("click", () => {
                if (remainingPA > 0 && this.combatAllocationMap[globalIdx] < u.currentPV) {
                    this.combatAllocationMap[globalIdx]++;
                    remainingPA--;
                    valSpan.innerText = this.combatAllocationMap[globalIdx];
                    this.updateAllocationInstructions(remainingPA);
                }
            });
            
            container.appendChild(row);
        });
        
        this.updateAllocationInstructions(remainingPA);
        
        // Bind Apply Action
        const applyBtn = document.getElementById("btn-combat-apply");
        const newApplyBtn = applyBtn.cloneNode(true);
        applyBtn.parentNode.replaceChild(newApplyBtn, applyBtn);
        
        newApplyBtn.addEventListener("click", () => {
            this.engine.applyCombatAllocation(this.combatAllocationMap);
            this.closeModal("modal-combat");
            this.renderAll();
        });
    }

    updateAllocationInstructions(remPA) {
        const text = document.getElementById("combat-allocation-instructions");
        text.innerHTML = `Pontos de PA Restantes para Alocar Dano: <strong class="font-highlight">${remPA}</strong>. ${remPA > 0 ? '(Excedente será usado para Saques de armas/segredos).' : ''}`;
    }

    // ==========================================================================
    // TRADE DIALOG AND NEGOTIATIONS
    // ==========================================================================

    openTradeModal() {
        const state = this.engine.state;
        const activePlayer = state.players[state.activePlayerIdx];
        
        this.openModal("modal-trade");
        
        // Populate Target Dropdown with other players
        const targetSel = document.getElementById("trade-target");
        targetSel.innerHTML = "";
        
        state.players.forEach(p => {
            if (p.id !== activePlayer.id) {
                const opt = document.createElement("option");
                opt.value = p.id;
                opt.innerText = p.name;
                targetSel.appendChild(opt);
            }
        });
        
        // Render checklist components dynamically
        this.renderTradeAssetChecklist("trade-my-rubbings", activePlayer.rubbings, "Cópia");
        this.renderTradeAssetChecklist("trade-my-weapons", activePlayer.weapons.map(w => w.name), "Arma");
        
        // Force refresh checklists when changing dropdown target
        const refreshTheirChecklists = () => {
            const targetIdx = parseInt(targetSel.value);
            const targetP = state.players[targetIdx];
            this.renderTradeAssetChecklist("trade-their-rubbings", targetP.rubbings, "Cópia");
            this.renderTradeAssetChecklist("trade-their-weapons", targetP.weapons.map(w => w.name), "Arma");
        };
        
        targetSel.addEventListener("change", refreshTheirChecklists);
        refreshTheirChecklists();
    }

    renderTradeAssetChecklist(containerId, list, prefix) {
        const box = document.getElementById(containerId);
        box.innerHTML = "";
        
        list.forEach((item, index) => {
            const div = document.createElement("div");
            div.className = "checkbox-item";
            div.innerHTML = `
                <input type="checkbox" id="${containerId}_${index}" value="${index}">
                <label for="${containerId}_${index}">${prefix} - ${item}</label>
            `;
            box.appendChild(div);
        });
    }

    executeTradeTransaction() {
        const state = this.engine.state;
        const activePlayer = state.players[state.activePlayerIdx];
        
        const targetIdx = parseInt(document.getElementById("trade-target").value);
        const targetPlayer = state.players[targetIdx];
        
        const myBerries = parseInt(document.getElementById("trade-my-berries").value) || 0;
        const theirBerries = parseInt(document.getElementById("trade-their-berries").value) || 0;
        
        if (activePlayer.berries < myBerries || targetPlayer.berries < theirBerries) {
            alert("Saldos de Berries inválidos para efetuar a transação.");
            return;
        }
        
        // Gather selected my assets
        const myRubbingIndices = Array.from(document.getElementById("trade-my-rubbings").querySelectorAll("input:checked")).map(i => parseInt(i.value));
        const myWeaponIndices = Array.from(document.getElementById("trade-my-weapons").querySelectorAll("input:checked")).map(i => parseInt(i.value));
        
        // Gather selected their assets
        const theirRubbingIndices = Array.from(document.getElementById("trade-their-rubbings").querySelectorAll("input:checked")).map(i => parseInt(i.value));
        const theirWeaponIndices = Array.from(document.getElementById("trade-their-weapons").querySelectorAll("input:checked")).map(i => parseInt(i.value));
        
        // Swap Berries
        activePlayer.berries -= myBerries;
        targetPlayer.berries += myBerries;
        
        targetPlayer.berries -= theirBerries;
        activePlayer.berries += theirBerries;
        
        // Swap Rubbings
        const stolenMyRubbings = [];
        myRubbingIndices.sort((a,b) => b-a).forEach(idx => {
            stolenMyRubbings.push(activePlayer.rubbings.splice(idx, 1)[0]);
        });
        targetPlayer.rubbings.push(...stolenMyRubbings);
        
        const stolenTheirRubbings = [];
        theirRubbingIndices.sort((a,b) => b-a).forEach(idx => {
            stolenTheirRubbings.push(targetPlayer.rubbings.splice(idx, 1)[0]);
        });
        activePlayer.rubbings.push(...stolenTheirRubbings);
        
        // Swap Weapons
        const stolenMyWeapons = [];
        myWeaponIndices.sort((a,b) => b-a).forEach(idx => {
            stolenMyWeapons.push(activePlayer.weapons.splice(idx, 1)[0]);
        });
        targetPlayer.weapons.push(...stolenMyWeapons);
        
        const stolenTheirWeapons = [];
        theirWeaponIndices.sort((a,b) => b-a).forEach(idx => {
            stolenTheirWeapons.push(targetPlayer.weapons.splice(idx, 1)[0]);
        });
        activePlayer.weapons.push(...stolenTheirWeapons);
        
        this.engine.log(`Diplomacia: Acordo fechado entre ${activePlayer.name} e ${targetPlayer.name}.`, "trade");
        this.closeModal("modal-trade");
        this.renderAll();
    }

    // ==========================================================================
    // ACT TRANSITIONS & PASSS-AND-PLAY SWITCH OVERLAYS
    // ==========================================================================

    endActiveTurn() {
        this.engine.endPlayerTurn();
        this.renderAll();
        
        // Show Transition secret overlay for local multiplayer protection
        const nextPlayer = this.engine.state.players[this.engine.state.activePlayerIdx];
        
        const modal = document.getElementById("modal-turn-transition");
        modal.classList.add("active");
        
        document.getElementById("next-player-name").innerText = nextPlayer.name;
        document.getElementById("next-player-role").innerText = nextPlayer.faction;
        
        let avatar = "🏴‍☠️";
        if (nextPlayer.faction === "marine") avatar = "⚓";
        if (nextPlayer.faction === "cipherpol") avatar = "🕵️";
        if (nextPlayer.faction === "yonkou") avatar = "👑";
        if (nextPlayer.faction === "rev") avatar = "🔥";
        document.getElementById("next-player-avatar").innerText = avatar;
    }

    confirmTurnReveal() {
        document.getElementById("modal-turn-transition").classList.remove("active");
        this.engine.startPlayerTurn();
        this.renderAll();
    }

    // Modal Helpers
    openModal(id) {
        document.getElementById(id).classList.add("active");
    }

    closeModal(id) {
        document.getElementById(id).classList.remove("active");
    }
}

// Global start binding
window.addEventListener("DOMContentLoaded", () => {
    const engine = new GameEngine();
    window.uiController = new BoardUI(engine);
});
