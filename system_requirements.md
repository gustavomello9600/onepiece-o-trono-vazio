# Documento de Requisitos de Sistema (SRS)
## Projeto: ONE PIECE - O TRONO VAZIO

Este documento especifica os requisitos funcionais, não-funcionais, regras de negócio e padrões de código para o protótipo digital do jogo de tabuleiro geopolítico assimétrico.

---

## 1. Padrões de Código e Estrutura do Projeto

Para garantir a legibilidade, manutenibilidade e escalabilidade do protótipo, o desenvolvimento deve aderir aos seguintes padrões visuais de código:

### 1.1. Organização de Arquivos
O projeto deve manter uma estrutura limpa e sem compilação para execução direta no navegador:
* `index.html` — Estrutura de marcação e contêineres de UI.
* `css/style.css` — Sistema de design, variáveis HSL, glassmorphism e animações.
* `js/cards.js` — Banco de dados estático do jogo (cartas, quests, eventos).
* `js/game.js` — Máquina de Estado principal do jogo (Model/State Engine).
* `js/ui.js` — Controladora de interface e renderização (View/Controller).

### 1.2. Padrões de Escrita (Style Guide)
* **Nomenclatura**: Variáveis e funções em *camelCase* (`calculatePassiveIncome`), classes em *PascalCase* (`GameEngine`), constantes globais em *UPPER_SNAKE_CASE* (`GAME_CARDS`).
* **Documentação JSDoc**: Todas as classes e funções principais devem possuir comentários JSDoc especificando o propósito, parâmetros e retornos.
* **Consistência de Chaves**: Estilo *One True Brace Style* (1TBS), com chaves na mesma linha da declaração.
* **Formatação (Prettier)**: Uso de ponto e vírgula, indentação de 4 espaços, aspas duplas em HTML e aspas simples/duplas consistentes em JS.

Exemplo de padrão de código esperado:
```javascript
/**
 * Calcula a renda passiva coletada por um jogador na fase de manutenção.
 * @param {Object} player - O objeto representando o jogador ativo.
 * @returns {number} O valor calculado em Berries.
 */
calculatePassiveIncome(player) {
    let income = 1; // Renda básica
    // Lógica com validações limpas
    return income;
}
```

---

## 2. Requisitos de Negócio e Regras do Jogo

O simulador geopolítico deve honrar as mecânicas descritas no GDD:

### 2.1. Preparação Geográfica (Setup Inicial)
* **Nós do Tabuleiro**: O mapa de 10 nós conexos representa o Novo Mundo.
  * *Red Line (Esquerda)*: Parede intransponível que ancora o início.
  * *Nova Marineford (Nó 1)*: Fortaleza militar inicial da Marinha.
  * *Laugh Tale (Nó 2)*: Destino final bloqueado até o Ato III.
  * *Ilhas Exploricáveis (Nós 3 a 10)*: Começam ocultas (viradas para baixo).
* **Distribuição Oculta de Poneglyphs**: 4 fichas de *Road Poneglyphs* (I, II, III e IV) devem ser sorteadas e alocadas secretamente embaixo de 4 ilhas exploráveis no início da partida.
* **Guarnições da Marinha Neutra**: Ilhas com o selo naval no verso devem ser inicializadas com 1 Forte Básico e 1 Navio Básico neutro.

### 2.2. Fluxo da Rodada e Relógio da Era
* **Fase Global (Início da Rodada)**:
  * O primeiro jogador saca e resolve **3 Cartas de Evento** sequencialmente.
  * Condições climáticas, tributos ou bônus são aplicados à rodada atual.
  * Se o baralho de Eventos do Ato atual se esgotar, o Ato termina e inicia-se o **Entreato**.
* **Fase de Turno Individual**:
  * *Manutenção*: Compra 1 Carta de Ação; coleta Renda Passiva de Berries.
  * *Negociação*: Jogador ativo pode realizar trocas diretas de Berries, Armas ou Rubbings (acordos imediatos são vinculativos; promessas futuras não).
  * *Ações*: O jogador consome seus Action Points (AP).
* **Limite Ecológico de Recursos**:
  * Limite máximo de mão de Cartas de Ação: 5 cartas.
  * Limite máximo de cofre de Berries: Sem limite (acumulável).

### 2.3. As Ações e seus Custos (Economia de Ritmo)
* **Navegar (1 AP)**: Mover frotas para um nó adjacente.
  * Rotas perigosas (Hazard) causam 1 de dano a 1 Navio básico da frota, a menos que o jogador possua cartas de ação ou armas defensivas contra o clima.
  * Entrar em uma ilha oculta interrompe o movimento dela e força a ação de explorar.
* **Recrutar (1 AP)**: Posicionar Navios Básicos, Navios de Guerra, Fortes ou Células Ocultas consumindo Berries e AP.
* **Quest / Explorar (1 AP)**: Exclusivo de Piratas/Yonkous.
  * Desvira o nó de ilha para revelar sua Quest.
  * Se houver Marinha Neutra no nó, ela deve ser derrotada militarmente antes da Quest poder ser tentada.
  * Resolução da Quest: Teste baseado em `Força da Frota + Valor de Carta de Ação descartada + 2D6` contra a dificuldade do nó.
* **Guerrear / Combater (1 AP)**: Declarar ataque contra frotas inimigas no mesmo nó.
* **Copiar Poneglyph (1 AP)**: Gerar uma Cópia (Rubbing) a partir de um Poneglyph original presente no nó.
* **Mercado Negro (1 AP)**: Comprar uma das 3 cartas de armas expostas no mercado consumindo Berries.

### 2.4. Assimetria Absoluta de Fações
* **Almirante (Marinha)**: 3 AP por turno. Foco em controle territorial e escolta de tributos. Ambições: *Justiça Absoluta*, *Justiça Moral*, *Justiça Burocrática*.
* **Cipher-Pol**: 4 AP por turno. Pode mover e agir secretamente (Furtividade). Inverte iniciativa na defesa. Ambição: *Égide Sombria*.
* **Yonkou**: 3 AP por turno. Grande poder militar estático. Só pode realizar Quests se usar seu Navio de Comandante. Ambições: *Império de Ferro*, *Sindicato do Caos*.
* **Capitão Pirata**: 4 AP por turno. Alta mobilidade. Foco em cumprir Quests e coletar Bounty. Ambições: *Aventureiro do Amanhecer*, *Conquistador Implacável*, *Magnata do Submundo*.
* **Líder Revolucionário**: 4 AP por turno. Furtivo na defesa. Espalha células ideológicas para causar golpes de estado sem lutar fisicamente. Ambição: *Chamas da Liberdade*.

### 2.5. O Mecanismo de Combate
* **Iniciativa**: O atacante ataca primeiro e aplica dano imediatamente, a menos que o defensor seja Cipher-Pol ou Revolucionário (que roubam a iniciativa e desferem o contra-ataque primeiro).
* **Fases do Duelo**:
  1. *Abre-Alas*: Revelação de Armas equipadas ou cartas táticas da mão.
  2. *Haki Secreto (Blefe)*: Cada lado baixa uma Carta de Ação virada para baixo. Elas são reveladas simultaneamente.
  3. *Dados Customizados*: Rolagem de 1D6 modificado (0, +1 PA, +1 PD, ★ Crítico).
* **Alocação de Dano**:
  * Pontos de Defesa (PD) são alocados a unidades específicas pelo defensor.
  * Pontos de Ataque (PA) do atacante são distribuídos livremente. Unidades sem PV suficiente são removidas do tabuleiro.
* **Saque por Overkill (Looting)**:
  * Se uma estrutura ou navio principal for destruído, cada ponto de PA excedente permite roubar 1 item do defensor seguindo a ordem: Rubbings -> Armas -> Cartas de Ação -> Poneglyphs Originais.

### 2.6. Transição de Atos e Fim do Jogo
* **O Entreato**:
  * Jogadores que atingiram a meta de VPs de sua ambição compram 1 carta e escolhem manter ou trocar sua ambição.
  * Jogadores que falharam compram 2 e são obrigados a trocar por uma das novas ambições.
  * Injeção de Cartas de Legado (ex: Buster Call) no próximo baralho de Era.
* **Condições de Morte Súbita (Ato III)**:
  * *One Piece*: Rebelde viaja até Laugh Tale com as 4 cópias/originais dos Poneglyphs e vence a Quest Final.
  * *Apagar a História*: Governo Mundial reúne e protege os 4 Poneglyphs originais simultaneamente em suas bases.
  * *Impasse*: Maior número cumulativo de VPs após o esgotamento do baralho do Ato III.

---

## 3. Requisitos da Interface de Usuário (UI/UX)

Para corrigir falhas de usabilidade e contraste vistas no protótipo original:

### 3.1. Usabilidade Local (Pass-and-Play)
* **Janela de Confirmação de Turno**:
  * Ao encerrar o turno de um jogador, o app deve exibir um overlay completo, desfocando todo o tabuleiro.
  * O painel deve indicar claramente quem é o próximo jogador a assumir o controle.
  * As cartas da mão do jogador e o painel de ações devem permanecer invisíveis até que o botão "Assumir Controle" seja pressionado.

### 3.2. Visibilidade Visual e Contraste do Tabuleiro (SVG)
* **Legibilidade de Rótulos**: As legendas das ilhas devem possuir cor clara (`hsl(210, 20%, 90%)` ou ouro) com uma sombra de texto preta (`text-shadow: 0 2px 4px rgba(0,0,0,0.9)`) para estarem perfeitamente legíveis sobre o oceano escuro.
* **Contraste das Ilhas**: Em vez de círculos pretos planos, as ilhas devem possuir:
  * Cores e bordas diferenciadas de acordo com o tipo (ex: azul claro para Naval, vermelho para Vulcânica, branco para Invernal, verde para Natureza).
  * Glow suave ao passar o cursor (hover) e uma borda dourada acentuada quando selecionada.
* **Caminhos de Navegação**:
  * Aumentar a opacidade das conexões (`stroke: rgba(255, 255, 255, 0.25)`) para que os caminhos sejam visíveis de primeira vista.
  * Rotas perigosas (Hazards) devem ter uma animação de pulsação tracejada em vermelho com efeito de alerta.
* **Organização das Peças (Tokens)**:
  * Unidades ativas ao redor das ilhas não devem colidir ou se amontoar caoticamente. Devem estar dispostas radialmente com tamanho visível e cores de facção bem definidas.
