// js/cards.js
// Configuration data for Event Decks, Action Cards, Weapon Cards, and Islands/Quests

const GAME_CARDS = {
    // Action Cards containing tactical effects and numeric combat stats
    actionCards: [
        { id: "ac_1", name: "Haki do Conquistador", pa: 3, pd: 1, desc: "Anula efeitos de armas inimigas básicas nesta rodada." },
        { id: "ac_2", name: "Haki do Armamento", pa: 2, pd: 2, desc: "Ataques ignoram armaduras de navios básicos." },
        { id: "ac_3", name: "Haki da Observação", pa: 1, pd: 3, desc: "Se defender, revela a carta secreta do atacante antes do cálculo." },
        { id: "ac_4", name: "Manobra Evasiva", pa: 0, pd: 4, desc: "Foge do combate se o atacante não possuir navios de guerra." },
        { id: "ac_5", name: "Vento de Cauda", pa: 1, pd: 1, desc: "Ação de Mover custa 0 AP para o restante do seu turno." },
        { id: "ac_6", name: "Recrutamento Rápido", pa: 1, pd: 1, desc: "Recrute 2 navios básicos adicionais ao fazer a ação Recrutar." },
        { id: "ac_7", name: "Kairouseki Shackle", pa: 2, pd: 1, desc: "Imobiliza um líder inimigo no mesmo nó por 1 rodada." },
        { id: "ac_8", name: "Ataque Abre-Alas", pa: 4, pd: 0, desc: "Dano massivo sem nenhuma proteção defensiva." },
        { id: "ac_9", name: "Muralha de Ferro", pa: 0, pd: 5, desc: "Forte base defensiva para suportar ataques pesados." },
        { id: "ac_10", name: "Espionagem Cipher-Pol", pa: 1, pd: 2, desc: "Compre 1 carta de ação aleatória do cofre do oponente." },
        { id: "ac_11", name: "Emboscada Revolucionária", pa: 2, pd: 2, desc: "Inverte a iniciativa se for o defensor no combate." },
        { id: "ac_12", name: "Tiro de Canhão Especial", pa: 3, pd: 0, desc: "Destrói 1 navio inimigo antes da fase de Haki." },
        { id: "ac_13", name: "Retirada Tática", pa: 0, pd: 3, desc: "Retorna a frota sobrevivente para a sua base mais próxima." },
        { id: "ac_14", name: "Suborno de Berries", pa: 1, pd: 1, desc: "Pague 2 Berries ao oponente para cancelar a ação de combate atual." },
        { id: "ac_15", name: "Aliança de Conveniência", pa: 2, pd: 2, desc: "+1 PA e +1 PD adicionais se lutar ao lado de um aliado neutro." }
    ],

    // Weapon Cards for purchase in the Market
    weapons: [
        { id: "wp_1", name: "Canhões de Kairouseki", cost: 4, pa: 2, pd: 0, desc: "Permite atacar navios em nós com perigo climáticos sem sofrer avarias." },
        { id: "wp_2", name: "Casco Blindado", cost: 3, pa: 0, pd: 2, desc: "+2 Pontos de Vida (PV) originais para a Nau Principal." },
        { id: "wp_3", name: "Akuma no Mi Artificial", cost: 6, pa: 3, pd: 1, desc: "Unidade ganha capacidade de causar dano em dobro a estruturas." },
        { id: "wp_4", name: "Lâmina Térmica", cost: 3, pa: 1, pd: 1, desc: "Sempre garante +1 de Iniciativa ao atacar em ilhas quentes (Vulcânicas)." },
        { id: "wp_5", name: "Casco de Madeira Adam", cost: 5, pa: 1, pd: 3, desc: "+3 PV para a Nau/Estrutura equipada e ignora danos de tempestades." },
        { id: "wp_6", name: "Velas de Borrasca", cost: 4, pa: 1, pd: 0, desc: "Movimentar esta frota consome 0 AP, mas exige gastar 1 Berry." }
    ],

    // Events Decks categorized by Act/Era
    events: {
        actI: [
            { id: "evt_i_1", name: "Clima Estável no Novo Mundo", desc: "Ações de Mapear e Explorar custam 0 Berries adicionais nesta rodada." },
            { id: "evt_i_2", name: "Tributo Celestial Anual", desc: "A Marinha (Almirante) recebe 3 Berries para cada Rota de Tributo ativa." },
            { id: "evt_i_3", name: "Incursão de Supernovas", desc: "Todos os piratas ganham +1 AP nesta rodada devido à agitação geral." },
            { id: "evt_i_4", name: "Propaganda de Mary Geoise", desc: "Revolucionários perdem 1 célula oculta de sua escolha devido ao aumento da vigilância." },
            { id: "evt_i_5", name: "Febre do Ouro", desc: "Quests resolvidas nesta rodada pagam +2 Berries de bônus." },
            { id: "evt_i_6", name: "Calmaria de Vento", desc: "Mover frotas através de rotas sem perigos custa 1 AP adicional nesta rodada." },
            { id: "evt_i_7", name: "Mercadores do Submundo", desc: "Reduz em 1 Berry o custo de todas as armas no Mercado Negro nesta rodada." },
            { id: "evt_i_8", name: "Patrulha Marítima Neutra", desc: "Gera 1 Navio Básico neutro em todas as ilhas inexploradas com o selo da Marinha." }
        ],
        actII: [
            { id: "evt_ii_1", name: "Tempestade Eletromagnética", desc: "Qualquer movimento através de caminhos com perigos causa 1 de Dano a 1 Navio básico da frota." },
            { id: "evt_ii_2", name: " Buster Call Ativa", desc: "A Marinha ganha +2 de PA temporários em combates no nó de Nova Marineford ou adjacentes." },
            { id: "evt_ii_3", name: "Levante Popular", desc: "Revolucionários podem converter 1 base civil em base aliada se tiverem células no nó." },
            { id: "evt_ii_4", name: "Caça às Bruxas da CP9", desc: "Cipher-Pol pode revelar a mão de 2 jogadores à sua escolha gratuitamente." },
            { id: "evt_ii_5", name: "Bloqueio Naval do Governo", desc: "Nenhum jogador rebelde pode usar rotas de Red Line nesta rodada." },
            { id: "evt_ii_6", name: "Inflação de Armamentos", desc: "O custo de compra de armas no Mercado Negro aumenta em 2 Berries nesta rodada." },
            { id: "evt_ii_7", name: "Territórios em Pânico", desc: "Yonkous coletam metade de sua renda passiva usual devido ao pânico civil." },
            { id: "evt_ii_8", name: "Ataque Pirata Coordenado", desc: "Piratas e Yonkous ganham Iniciativa no Ataque mesmo contra Cipher-Pol e Revolucionários." }
        ],
        actIII: [
            { id: "evt_iii_1", name: "Laugh Tale Revelada", desc: "O nó da Expedição Final (Laugh Tale) está oficialmente aberto no extremo leste da teia." },
            { id: "evt_iii_2", name: "Buster Call Global", desc: "Almirantes podem ativar a Buster Call em qualquer ilha do Novo Mundo, destruindo 1 base/fortaleza." },
            { id: "evt_iii_3", name: "Guerra Total", desc: "Todos os combates nesta rodada causam o dobro de dano (1 PA vira 2 PA)." },
            { id: "evt_iii_4", name: "Colapso do Mercado Negro", desc: "Armas não podem mais ser compradas no mercado. Armas existentes mantêm seus efeitos." },
            { id: "evt_iii_5", name: "Voz de Todas as Coisas", desc: "Qualquer jogador Rebelde adjacente a um Poneglyph original pode copiá-lo sem gastar AP." },
            { id: "evt_iii_6", name: "Lei Marcial Absoluta", desc: "Marinha e Cipher-Pol ignoram Iniciativa de Defesa dos Revolucionários." }
        ],
        // Legacy Cards (Injected via Ambition Consequence)
        legacy: {
            busterCall: { id: "legacy_buster", name: "BUSTER CALL (Legado)", desc: "A Marinha pode bombardear 1 nó, causando 3 de dano a todas as unidades inimigas e destruindo fortes básicos." },
            rebellion: { id: "legacy_rebel", name: "CHAMAS DA REVOLTA (Legado)", desc: "Gera revoltas em 2 ilhas sob controle de Yonkous ou Marinha, removendo a guarnição e gerando VPs para os insurgentes." },
            monopoly: { id: "legacy_monop", name: "AUDITORIA FISCAL (Legado)", desc: "Exige que todos os jogadores com mais de 6 Berries paguem 2 Berries ao cofre de Nova Marineford." }
        }
    },

    // Island template configurations with coordinates and quests
    islands: [
        // FIXED NODES
        { id: 1, name: "Nova Marineford", x: 100, y: 325, type: "naval", isFixed: true, revealed: true, quest: null },
        { id: 2, name: "Laugh Tale", x: 900, y: 325, type: "final", isFixed: true, revealed: false, quest: { name: "O Trono Vazio", difficulty: 12, desc: "Superar os enigmas do Século Perdido e cimentar a Nova Era.", reward: "Vitória Rebelde de Morte Súbita!" } },
        
        // EXPLORABLE ISLANDS
        { id: 3, name: "Ilha Invernal", x: 280, y: 150, type: "climate", isFixed: false, revealed: false, quest: { name: "Nevasca Eterna", difficulty: 5, desc: "Achar abrigo seguro nas cavernas de gelo e evitar congelamento.", reward: "2 Berries, +1 VP" } },
        { id: 4, name: "Selva de Feras", x: 300, y: 480, type: "nature", isFixed: false, revealed: false, quest: { name: "Besta Alfa", difficulty: 6, desc: "Dominar ou aniquilar o Gorila Gigante que governa a selva.", reward: "Compre 1 Arma Grátis" } },
        { id: 5, name: "País Fechado", x: 480, y: 120, type: "political", isFixed: false, revealed: false, quest: { name: "Abrir as Fronteiras", difficulty: 7, desc: "Subverter o Xogunato local para conseguir passagem livre.", reward: "+2 VP, Poneglyph se presente" } },
        { id: 6, name: "Ilha Vulcânica", x: 500, y: 520, type: "climate", isFixed: false, revealed: false, quest: { name: "Fuga do Magma", difficulty: 6, desc: "Coletar minérios raros do vulcão prestes a entrar em erupção.", reward: "4 Berries" } },
        { id: 7, name: "Deserto de Areia", x: 520, y: 325, type: "climate", isFixed: false, revealed: false, quest: { name: "Ruínas Antigas", difficulty: 5, desc: "Decifrar inscrições antigas perdidas na tempestade de areia.", reward: "+1 VP, Rubbing de Poneglyph Aleatório" } },
        { id: 8, name: "Arquipélago Flutuante", x: 680, y: 150, type: "nature", isFixed: false, revealed: false, quest: { name: "Correntes de Ar", difficulty: 8, desc: "Navegar através das perigosas ilhas que flutuam no céu.", reward: "Compre 2 Cartas de Ação" } },
        { id: 9, name: "Ruínas Submersas", x: 720, y: 500, type: "nature", isFixed: false, revealed: false, quest: { name: "Monstros Marinhos", difficulty: 7, desc: "Combater os Reis dos Mares que guardam a cidade submersa.", reward: "5 Berries, +1 VP" } },
        { id: 10, name: "Território Fantasma", x: 700, y: 325, type: "mystery", isFixed: false, revealed: false, quest: { name: "Névoa da Ilusão", difficulty: 6, desc: "Passar pela neblina densa sem perder o rumo do navio.", reward: "Poneglyph se presente" } }
    ],

    // Island Route connections (point-to-point lines)
    connections: [
        { from: 1, to: 3, hazard: false },
        { from: 1, to: 4, hazard: false },
        
        { from: 3, to: 5, hazard: false },
        { from: 3, to: 7, hazard: true }, // Dangerous route (storm)
        
        { from: 4, to: 7, hazard: false },
        { from: 4, to: 6, hazard: true }, // Dangerous route (lava current)
        
        { from: 5, to: 8, hazard: false },
        { from: 5, to: 7, hazard: false },
        
        { from: 6, to: 7, hazard: false },
        { from: 6, to: 9, hazard: false },
        
        { from: 7, to: 8, hazard: false },
        { from: 7, to: 10, hazard: false },
        { from: 7, to: 9, hazard: false },
        
        { from: 8, to: 2, hazard: true }, // Laugh Tale threshold
        { from: 10, to: 2, hazard: false },
        { from: 9, to: 2, hazard: true }  // Laugh Tale threshold
    ],

    // Global Setup templates (determines Starting positioning)
    setups: [
        {
            id: "setup_1",
            name: "Convergência do Nordeste",
            marinefordId: 1,
            yonkouStarts: [
                { id: 5, label: "Yonkou 1 (Região Norte)" },
                { id: 9, label: "Yonkou 2 (Região Sul)" }
            ],
            pirateEntryNodes: [3, 4]
        },
        {
            id: "setup_2",
            name: "Arquipélago Dividido",
            marinefordId: 1,
            yonkouStarts: [
                { id: 8, label: "Yonkou 1 (Nordeste)" },
                { id: 6, label: "Yonkou 2 (Sudeste)" }
            ],
            pirateEntryNodes: [4, 3]
        }
    ]
};
