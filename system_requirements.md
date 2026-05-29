# Especificação de Requisitos de Sistema (SRS)
## Projeto: ONE PIECE - O TRONO VAZIO
**Gênero:** Simulação Geopolítica Assimétrica em Campanha de Tabuleiro
**Tecnologia:** HTML5 / CSS3 / JavaScript (Vanilla)

Este documento descreve detalhadamente as regras de negócio, lógica de jogo, requisitos funcionais e não-funcionais que devem ser respeitados no desenvolvimento do protótipo digital de *One Piece: O Trono Vazio*.

---

## 1. Modelo de Arquitetura e Estrutura de Código

Para atender ao requisito de bons padrões visuais de código, a arquitetura deve seguir uma separação rigorosa entre estado lógico, dados estáticos e renderização de tela.

### 1.1. Padrões de Código
* **Documentação JSDoc**: Todas as classes, métodos e propriedades críticas devem ser documentados com anotações JSDoc claras.
* **CamelCase**: Funções e variáveis locais em *camelCase* (`calculateLootingDamage`).
* **PascalCase**: Classes em *PascalCase* (`GameEngine`, `BoardUI`).
* **SNAKE_CASE**: Constantes estáticas e chaves globais em *UPPER_SNAKE_CASE* (`GAME_CARDS`).
* **Estrutura Modular**:
  - `cards.js` — Base estática de dados para Cartas de Ação, Armas, Eventos, Quests e Nós Geográficos.
  - `game.js` — Máquina de estados (Model). Sem interações com o DOM.
  - `ui.js` — Manipulação de interface, eventos de clique, animações e renderização (View/Controller).

---

## 2. Componentes e Setup Geográfico (O Tabuleiro)

A topologia do jogo é composta por uma rede de nós conectados (*Point-to-Point Movement*) representando a Grand Line.

### 2.1. O Tabuleiro e Conexões
* **Red Line (Borda Esquerda)**: Uma barreira física que delimita a entrada.
* **Laugh Tale (Nó de Expedição Final)**: Localizado na extremidade direita (Orla do Abismo). Inacessível até o Ato III.
* **Conexões (Rotas Marítimas)**: Linhas direcionais ligando ilhas adjacentes.
  - *Rotas Comuns*: Trânsito básico sem modificadores.
  - *Rotas com Perigo Climático (Hazards)*: Rotas que causam 1 ponto de dano a navios básicos que as atravessem sem frotas blindadas ou armas adequadas.

### 2.2. Nós de Ilhas e Atributos
Cada nó de ilha possui a seguinte estrutura de dados:
```javascript
{
    id: number,
    name: string,
    x: number,
    y: number,
    type: "naval" | "final" | "climate" | "nature" | "mystery" | "political",
    revealed: boolean,
    poneglyph: 1 | 2 | 3 | 4 | null, // ID do Road Poneglyph oculto
    baseStructure: "forte_marinha" | "fortaleza_yonkou" | "base_revolucionaria" | "marineford" | null,
    fleets: Array<FleetUnit>,
    quest: QuestObject | null
}
```

### 2.3. Unidades do Jogo (Frotas, Líderes e Estruturas)
O jogo possui valores fixos de Pontos de Ataque (PA) e Pontos de Vida (PV) originais. Unidades não acumulam dano entre rodadas; se não forem destruídas durante o combate, regeneram para seus PVs originais no fim do turno.

#### Estruturas Físicas (Imóveis):
* **Forte Básico Marinha**: PV 2 / PA 0.
* **Fortaleza de Yonkou**: PV 4 / PA 0.
* **Nova Marineford (Sede Marinha)**: PV 5 / PA 0.

#### Frotas (Mobilidade Marítima):
* **Navio Básico (Genérico)**: PA 1 / PV 1.
* **Navio de Guerra (Marinha)**: PA 2 / PV 2.
* **Navio de Comandante (Exclusivo Yonkou)**: PA 2 / PV 2 (Única frota Yonkou autorizada a realizar Quests).
* **Navio de Capitão Pirata (Nau Principal)**: PA 2 / PV 3.

#### Líderes de Elite (Tokens Anexáveis):
Os Líderes são tokens que concedem buffs permanentes quando anexados a frotas no mesmo nó:
* **Token de Yonkou**: PA 5 / PV 5.
* **Token de Almirante**: PA 4 / PV 4.
* **Token de Capitão Pirata**: PA 3 / PV 2.
* **Token de Líder Revolucionário**: PA 3 / PV 3.
* **Token de Cipher-Pol**: PA 3 / PV 3.

---

## 3. Estrutura da Campanha e Relógio do Jogo

A campanha consiste em 3 Atos consecutivos, nos quais o tabuleiro físico (ilhas reveladas, frotas, bases) não sofre "reset".

### 3.1. O Relógio do Jogo: O Baralho de Eventos
* No início de cada rodada, saca-se **3 Cartas de Evento** do baralho da Era/Ato atual.
* Cada carta de evento deve ter seus efeitos aplicados imediatamente.
* Quando o baralho de eventos de Era se esgota, a rodada é finalizada e o jogo entra na fase de **Entreato**.

### 3.2. O Entreato e a Transição de Ambições
Ao fim de cada Ato, os jogadores avaliam se completaram a meta de VPs de sua ambição atual:
* **Sucesso (VPs >= Meta da Ambição)**:
  - O jogador pode escolher entre manter sua Ambição atual ou trocá-la por uma nova carta sorteada do baralho de ambições fora de jogo.
  - **Efeito Borboleta (Legado)**: Injeta cartas de Evento de Legado específicas (ex: "Buster Call") no baralho do Ato seguinte.
* **Fracasso (VPs < Meta da Ambição)**:
  - O jogador perde a ambição atual.
  - Deve sortear 2 cartas de ambições disponíveis e escolher uma delas como sua nova Ambição obrigatória para o próximo Ato.
* **Ajuste de Turno**: Reinicia-se a contagem de VPs de Ato dos jogadores para 0.

### 3.3. O Fim do Jogo e Vitória de Morte Súbita (Ato III)
No Ato III, as condições padrão de vitória mudam para Morte Súbita:
* **Vitória Rebelde (Encontrar o One Piece!)**:
  - Apenas para papéis Rebeldes (Pirata, Yonkou, Revolucionário).
  - O jogador deve possuir as **4 informações de Road Poneglyph** (Originais ou Cópias/Rubbings).
  - Deve deslocar sua peça de Líder até *Laugh Tale* (Nó 2) e vencer a *Quest da Expedição Final* (Dificuldade 12).
* **Vitória da Ordem (Apagar a História!)**:
  - Apenas para papéis do Governo Mundial (Almirante, Cipher-Pol).
  - O jogador do Governo deve capturar e manter simultaneamente os **4 Road Poneglyphs originais** dentro de Fortalezas ou Bases controladas ativamente.
* **Vitória por Pontos (Impasse Global)**:
  - Se o baralho de eventos do Ato III acabar e ninguém completar uma vitória súbita, o jogador com mais VPs cumulativos acumulados ao longo dos Atos é o vencedor.

---

## 4. Os Papéis e as 11 Ambições Assimétricas

Cada jogador joga com um papel específico. O número de ações (AP) e a forma de pontuar varia de acordo com o papel e a ambição.

### 4.1. Almirante da Marinha (3 Ações por Turno)
* **Ambição A: Justiça Absoluta**:
  - *Scoring:* Ganha 1 VP por estrutura rebelde destruída ou líder inimigo derrotado.
  - *Legacy:* Injeta "BUSTER CALL" no deck seguinte se tiver sucesso.
* **Ambição B: Justiça Moral / Reformista**:
  - *Scoring:* Ganha 1 VP interceptando Quests piratas ou evitando danos colaterais a ilhas populosas.
  - *Legacy:* Ilhas civis defendem-se automaticamente de piratas básicos no próximo Ato.
* **Ambição C: Justiça Burocrática**:
  - *Scoring:* Ganha 1 VP para cada Token de Tributo transportado com sucesso das ilhas para Nova Marineford.
  - *Legacy:* Aumenta a renda em Berries no próximo Ato.

### 4.2. Agente da Cipher-Pol (4 Ações por Turno)
* **Ambição Única: A Égide Sombria**:
  - *Furtividade:* Os tokens da CP podem ficar virados para baixo (ocultos). Não sofrem ataques diretos regulares de frotas neutras.
  - *Iniciativa:* Sempre detém iniciativa no combate se for atacado nas sombras.
  - *Scoring:* Ganha 2 VPs ao eliminar líderes inimigos via Assassinato tático ou ao confiscar Rubbings de Poneglyphs.

### 4.3. Yonkou (3 Ações por Turno)
* **Ambição A: Império de Ferro**:
  - *Scoring:* Ganha 1 VP passivo por rodada para cada 2 ilhas conectadas sob seu controle territorial.
  - *Legacy:* Causa penalidade de AP para inimigos entrando em seus territórios no próximo Ato.
* **Ambição B: Sindicato do Caos**:
  - *Scoring:* Ganha 1 VP quando outro jogador destrói frotas da marinha através de contratos (bounties) pagos pelo Yonkou.

### 4.4. Capitão Pirata (4 Ações por Turno)
* **Ambição A: Aventureiro do Amanhecer**:
  - *Scoring:* Ganha 1 VP ao revelar ilhas inexploradas ou vencer Quests de exploração.
  - *Legacy:* Atalhos permanentes de navegação revelados no mapa.
* **Ambição B: Conquistador Implacável**:
  - *Scoring:* Ganha 1 VP ao afundar frotas genéricas inimigas ou ao Saquear ilhas (zerando seus recursos).
* **Ambição C: Magnata do Submundo**:
  - *Scoring:* Ganha 1 VP ao acumular 10 Berries ou ao vender Cópias (Rubbings) de Poneglyphs para outros jogadores.

### 4.5. Líder Revolucionário (4 Ações por Turno)
* **Ambição Única: As Chamas da Liberdade**:
  - *Scoring:* Ganha 2 VPs ao realizar "Golpes de Estado" em ilhas controladas pela Marinha ou Yonkou (Golpes ocorrem quando o número de Células Revolucionárias no nó supera o número de guarnições inimigas).
  - *Legacy:* Ilhas libertadas bloqueiam tributos para a Marinha.

### 4.6. Pacto Shichibukai (Acordo Mecânico)
* O Almirante pode conceder o status de *Shichibukai* a um Capitão Pirata.
* O Pirata ganha imunidade às patrulhas da Marinha neutra no mapa.
* Em contrapartida, o Pirata deve transferir 30% de sua renda passiva em Berries para a Marinha e não pode atacar frotas militares. Se o pacto for quebrado, o pirata adquire status de traidor e a Marinha ganha bônus de combate contra ele.

---

## 5. Fluxo do Turno e Economia de Ações

### 5.1. Turno de Jogo
O turno de um jogador compreende três fases rígidas:
1. **Fase de Manutenção**:
   - Compra automática de 1 Carta de Ação.
   - Cálculo e coleta de Berries (Tributos para a Marinha, Feudos para Yonkou, Saques para Piratas, Células para Revolucionários).
2. **Fase de Negociação (Free-Talk)**:
   - Trocas mútuas de Berries, Armas compradas e Rubbings de Poneglyphs.
3. **Fase de Ações**:
   - Execução de ações consumindo AP (3 ou 4 dependendo do papel).

### 5.2. As Ações Principais
* **Navegar (1 AP)**: Deslocar frota. Entrar em nós inexplorados interrompe a movimentação.
* **Recrutar (1 AP)**: Construir navios ou frotas no tabuleiro.
* **Quest / Explorar (1 AP)**: Desvendar ilhas ou fazer testes de Quests.
* **Guerrear (1 AP)**: Iniciar combate no mesmo nó contra outras facções.
* **Copiar Poneglyph (1 AP)**: Gerar Rubbings de Poneglyph original no nó.
* **Mercado Negro (1 AP)**: Comprar armas disponíveis no mercado aberto.

---

## 6. Sistema de Combate

Combates são resolvidos no mesmo nó em que duas facções hostis residem.

### 6.1. Iniciativa
* O atacante tem a **Iniciativa** (seu dano é resolvido antes do contra-ataque do defensor).
* Exceção: Cipher-Pol ou Revolucionários na defesa roubam a iniciativa e contra-atacam primeiro.

### 6.2. Fases de Combate
1. **Abre-Alas (Armas)**: Cada jogador pode revelar 1 arma equipada ou carta de tática da mão.
2. **Haki Secreto (Blefe)**: Cada jogador escolhe em segredo 1 Carta de Ação da mão e coloca virada para baixo. Ambas são reveladas ao mesmo tempo, somando seus valores de PA/PD.
3. **Dado Customizado**: Rola-se 1D6 com faces: `[0]`, `[+1 PA]`, `[+1 PA]`, `[+1 PD]`, `[+1 PD]`, `[★ Crítico]`.

### 6.3. Alocação de Dano e Overkill Looting
* O defensor aloca seus pontos de defesa (PD) totais em frotas específicas.
* O atacante aloca seu poder de ataque (PA). Unidades que recebem dano igual ou superior a seus PVs são destruídas.
* **Looting (Saque)**: Se o atacante destruir uma estrutura militar, nau capitânia ou comandante e possuir PA excedente (PA residual > 0):
  - Para cada 1 PA excedente, rouba 1 item na ordem de prioridade:
    1. *Cópias (Rubbings) de Poneglyph*.
    2. *Cartas de Arma equipadas*.
    3. *Cartas de Ação da mão do perdedor*.
    4. *Poneglyph Original (Se presente)*.

---

## 7. Requisitos de Usabilidade e Interface (UI/UX)

Para atender à melhoria exigida de usabilidade e visibilidade de UI:

### 7.1. Interface Pass-and-Play (Segredo da Mão)
* O jogo deve exibir uma tela de transição de turno borrada sempre que o controle mudar de jogador.
* A tela deve conter o nome do próximo jogador e um botão de confirmação.
* Nenhuma carta ou ação pode ser selecionada antes da confirmação, garantindo a privacidade das mãos de Haki.

### 7.2. Contraste e Identificação de Elementos
* **Legendagem de Ilhas**: Todo texto SVG deve usar contorno escuro (`paint-order: stroke fill`) de 3.5px para destacar-se no background escuro.
* **Gráficos Procedurais das Ilhas**: As ilhas reveladas devem exibir degradês coloridos de acordo com seu clima/bioma e brilhar ao passar o mouse.
* **Rotas de Navegação**:
  - Rotas comuns devem ter linhas bem visíveis com opacidade mínima de `0.22`.
  - Rotas de perigo devem ter animações tracejadas que pulsam em vermelho para indicar perigo geográfico.
* **Ajuste de Visualização**: Fichas de frotas devem ter bordas nítidas e aumentar levemente ao passar o mouse, com uma marcação dourada brilhante ao serem selecionadas para movimentação.
