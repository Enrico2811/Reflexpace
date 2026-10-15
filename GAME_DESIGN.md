# 🎯 Reflexpace: Documento de Design

> Treinador de reflexos e mira para gamers, com tema de ordem espacial intergaláctica.
> Versão do documento: 0.1 (rascunho inicial) · Plataforma: Web (desktop) · Status: planejamento

---

## 1. Visão geral

### 1.1 Resumo em uma frase
Um treino diário de mira e reflexos, em sessões de 2 a 3 minutos, dentro de uma "Academia Holográfica" espacial, onde cada sessão deixa um recorde, um número de rating e um ponto a mais no gráfico de evolução.

### 1.2 Problema que resolve
Gamers de FPS e hero shooters (como Marvel Rivals, Overwatch, Valorant) querem treinar mira, mas:
- aquecer dentro de partidas ranqueadas é ruim;
- treinadores de mira existentes são frios, difíceis de acompanhar ao longo do tempo ou exigem instalação;
- falta uma sensação clara de progresso.

### 1.3 Pilares de design
1. **Sessão curta, loop apertado.** Dá para treinar em 2 minutos e ainda querer "só mais uma".
2. **Progresso visível.** Todo resultado é comparado ao seu passado, nunca a um número abstrato.
3. **Justiça e precisão.** Medição de tempo confiável; o jogo mede *você*, não a sorte.
4. **Estilo próprio.** Visual de holotreino espacial, bonito e legível, sem atrapalhar a mira.
5. **Hábito saudável.** Retenção por maestria e progresso, sem mecânicas manipuladoras.

### 1.4 Público-alvo
Qualquer pessoa, com foco em gamers competitivos de PC que usam mouse.

---

## 2. Tema e identidade

### 2.1 Ambientação
O jogador é um **Cadete** na **Academia Holográfica**, uma estação espacial onde guerreiros treinam com drones holográficos. O treino é feito numa câmara escura com projeções luminosas.

### 2.2 Aviso sobre direitos autorais
O tema é *inspirado* em ficção científica espacial, mas o projeto deve usar **nome, personagens, logos, músicas e termos próprios**. Isso protege o repositório de pedidos de remoção e permite publicar e até monetizar no futuro. Estética genérica de "sabre de energia", "holograma" e "drone de treino" é livre.

### 2.3 Paleta de cores
| Uso | Cor | Hex |
|---|---|---|
| Fundo do espaço | Azul-noite | `#070B1A` |
| Painéis | Azul-aço | `#101A33` |
| Alvo válido (aliado/treino) | Ciano holográfico | `#27E1FF` |
| Alvo falso (isca) | Vermelho energia | `#FF3B4E` |
| Destaque / recorde | Dourado | `#FFC53D` |
| Texto | Branco gelo | `#E8F1FF` |

Modo alternativo para daltonismo: trocar ciano/vermelho por azul/laranja e formas diferentes (círculo vs. losango).

### 2.4 Tipografia e sons
- Fontes sugeridas (livres): **Orbitron** ou **Exo 2** para títulos, **Inter** para texto.
- Áudio sintetizado via Web Audio API (zumbidos de energia, "pings" de acerto), sem usar samples de terceiros.

---

## 3. Loop principal

```
Menu → escolher modo → (contagem 3-2-1) → sessão de 60s → resultados
   → comparação com seu recorde → rating atualizado → gráfico → "Jogar de novo"
```

### 3.1 Missão Diária
Todo dia há uma configuração fixa (semente de aleatoriedade baseada na data) por modo. Isso permite comparar o resultado com amigos e dá motivo para voltar. Uma tentativa "oficial" por dia, treino livre ilimitado.

---

## 4. Modos de jogo

### 4.1 Modo 1: Alvo Certo (*Target Lock*)

**Objetivo:** acertar rapidamente os alvos corretos e ignorar as iscas.

**Mecânica**
- Alvos circulares (drones) aparecem em posições aleatórias da arena.
- **Ciano** = acertar. **Vermelho** = não clicar (isca).
- Cada alvo tem um tempo de vida (começa ~1,4 s e diminui com o desempenho).
- Até N alvos simultâneos (começa com 3, aumenta com o nível).
- Clique no alvo certo = ponto + bônus pela velocidade. Clique no vazio = erro. Clique na isca = penalidade forte. Alvo que expira = erro.

**Variações de dificuldade**
| Nível | Tamanho do alvo | Vida do alvo | Alvos simultâneos | Iscas |
|---|---|---|---|---|
| Cadete | Grande | 1,6 s | 2 | 10% |
| Guardião | Médio | 1,2 s | 3 | 20% |
| Mestre | Pequeno | 0,9 s | 4 | 30% |

**Métricas coletadas**
- Tempo de reação mediano (ms): do aparecimento ao clique.
- Precisão (%): acertos ÷ (acertos + erros de clique + expirados).
- Iscas acertadas (erros de inibição).
- Melhor sequência (combo).

### 4.2 Modo 2: Rastreamento (*Tracking*)

**Objetivo:** manter a mira sobre um alvo que se move de forma imprevisível. Treina o controle fino do mouse, como o de heróis com feixe contínuo em jogos de herói-atirador.

**Mecânica**
- Um único alvo se move pela arena com padrões variados: linear com trocas bruscas de direção, curvas suaves, paradas e arrancadas.
- Enquanto o cursor estiver sobre o alvo (e o botão pressionado, se a opção "segurar para travar" estiver ativa), o jogador ganha pontos e a "barra de trava" enche.
- Fora do alvo, o combo zera.
- A velocidade e a imprevisibilidade aumentam gradualmente durante a sessão.

**Métricas coletadas**
- **Tempo no alvo (%)**: métrica principal.
- Maior tempo de trava contínua (s).
- Tempo médio para reencontrar o alvo após perdê-lo (ms).
- Erro médio de distância ao centro (px).

**Padrões de movimento (geração procedural, determinística por semente)**
1. *Strafe*: vai e volta horizontal com inversões aleatórias.
2. *Orbita*: movimento circular com raio variável.
3. *Zigue-zague*: mudanças bruscas em ângulos aleatórios.
4. *Stop & go*: parada repentina seguida de arrancada.

---

## 5. Pontuação, rating e recordes

### 5.1 Pontuação da sessão (Alvo Certo)
```
pontos_acerto = 100 + bônus_velocidade
bônus_velocidade = max(0, (vida_do_alvo - tempo_de_reação) / vida_do_alvo) * 100
multiplicador_combo = 1 + min(combo, 20) * 0.05
erro de clique no vazio = -25 pontos e zera o combo
isca acertada = -100 pontos e zera o combo
alvo expirado = -15 pontos e zera o combo
score_final = soma dos pontos * multiplicador
```

### 5.2 Pontuação da sessão (Rastreamento)
```
score_final = tempo_no_alvo_ms * fator_dificuldade * (1 + bônus_trava_longa)
bônus_trava_longa = min(maior_trava_s, 10) * 0.03
```

> As fórmulas são ponto de partida. Serão calibradas com testes reais (ver seção 10).

### 5.3 Reflex Rating (RR)
Um número por modo que resume sua habilidade atual, inspirado em Elo:
- Começa em **1000**.
- Após cada sessão oficial, compara-se o score com a **expectativa** baseada na média das últimas 10 sessões:
  `RR_novo = RR + K * (score_normalizado - expectativa)`, com K = 24 (menor conforme mais sessões).
- Sobe de forma rápida no começo e estabiliza com o tempo.
- Sessões de treino livre não alteram o rating.

### 5.4 Patentes (apenas visual, ligadas ao RR)
| Patente | RR |
|---|---|
| Cadete | 0–999 |
| Aprendiz | 1000–1299 |
| Guardião | 1300–1599 |
| Cavaleiro | 1600–1899 |
| Mestre | 1900–2199 |
| Grão-Mestre | 2200+ |

### 5.5 Recordes pessoais
Salvos **por modo × dificuldade**:
- Maior score
- Menor tempo de reação mediano (Alvo Certo)
- Maior % no alvo (Rastreamento)
- Maior trava contínua (Rastreamento)
- Maior combo

Ao bater um recorde: animação dourada na tela de resultados + registro no histórico.

---

## 6. Evolução: gráficos e estatísticas

A tela **"Hangar de Evolução"** é o coração da retenção.

### 6.1 Gráficos
1. **Linha: Score ao longo do tempo** (por modo, com filtro 7 / 30 / 90 dias / tudo) e linha de média móvel.
2. **Linha: Reflex Rating** com marcações de mudança de patente.
3. **Linha: Tempo de reação mediano (ms)** (menor = melhor, eixo invertido para "subir = melhorar").
4. **Barras: Precisão por sessão**.
5. **Mapa de calor de dias treinados** (estilo contribuições do GitHub), mostrando constância.
6. **Radar de habilidades** (Velocidade de reação, Precisão, Rastreamento, Inibição de iscas, Consistência).

### 6.2 Estatísticas rápidas
- Sequência atual de dias (streak) e maior sequência.
- Total de sessões e tempo treinado.
- Melhoria desde a primeira semana (% comparado).
- Melhor horário do dia (quando você performa melhor).

### 6.3 Insights automáticos
Mensagens curtas geradas a partir dos dados, por exemplo:
- "Seu tempo de reação melhorou 12% nos últimos 14 dias."
- "Você erra mais iscas depois de 2 sessões seguidas. Faça uma pausa."

---

## 7. Retenção e gamificação

| Mecânica | Descrição |
|---|---|
| Streak diário | Dias seguidos com pelo menos 1 sessão oficial. 1 "congelamento" gratuito por semana. |
| Missão Diária | Desafio fixo do dia, mesma semente para todos. |
| Conquistas | Ex.: "Primeiro sangue de drone" (1ª sessão), "Relâmpago" (reação < 200 ms), "Fantasma" (100% de precisão), "Semana de ferro" (7 dias). |
| Desbloqueáveis | Temas de arena, cursores/miras, cores de alvo, ao atingir marcos. |
| Desafios pessoais | "Supere seu recorde de ontem" e metas semanais sugeridas. |
| Compartilhar resultado | Cartão de resultado em imagem para postar nas redes. |

**Princípios éticos**
- Sem loot box, sem moeda paga, sem notificações culpabilizantes.
- Sessões têm final claro; o jogo avisa quando você já treinou bastante.
- Streak nunca é motivo de punição pesada.

---

## 8. Interface (telas)

1. **Menu principal:** logo, patente atual, botões *Missão Diária*, *Alvo Certo*, *Rastreamento*, *Evolução*, *Configurações*.
2. **Seleção de dificuldade e modo (treino livre vs. oficial).**
3. **Arena:** HUD mínimo (tempo, score, combo), nada que distraia da mira.
4. **Resultados:** score, métricas, comparação com recorde, variação de RR, animação de recorde.
5. **Hangar de Evolução:** gráficos e estatísticas (seção 6).
6. **Conquistas.**
7. **Configurações:** sensibilidade, mira (crosshair), volume, tema, acessibilidade, exportar/importar dados, apagar dados.

### 8.1 Configurações que importam para gamers
- Sensibilidade (com **Pointer Lock** opcional para movimento relativo do mouse, mais próximo do jogo real).
- Estilo, cor e tamanho da mira.
- Tamanho da arena e proporção de tela.
- FPS alvo e aviso de FPS baixo (impacta a medição).

---

## 9. Arquitetura técnica

### 9.1 Stack proposta
| Camada | Escolha | Motivo |
|---|---|---|
| Linguagem | **TypeScript** | Segurança de tipos para lógica de jogo e dados |
| Build | **Vite** | Rápido, simples, ótimo para GitHub Pages |
| Renderização do jogo | **Canvas 2D** | Leve, preciso, suficiente para alvos 2D |
| Gráficos de evolução | **Chart.js** (ou uPlot) | Simples e bonito |
| Interface (menus) | **HTML + CSS** (vanilla) | Sem peso de framework; pode migrar depois |
| Áudio | **Web Audio API** | Sons sintetizados, sem arquivos |
| Armazenamento | **localStorage / IndexedDB** | Sem servidor no MVP |
| Testes | **Vitest** | Lógica de pontuação e rating testável |
| Deploy | **GitHub Pages** (via GitHub Actions) | Gratuito, direto do repositório |

### 9.2 Estrutura de pastas
```
reflexpace/
├─ src/
│  ├─ core/          # loop do jogo, relógio, RNG com semente, input
│  ├─ modes/         # target-lock.ts, tracking.ts
│  ├─ scoring/       # pontuação, rating, recordes
│  ├─ storage/       # persistência, export/import
│  ├─ ui/            # telas, componentes, gráficos
│  ├─ audio/         # sintetizador de sons
│  └─ main.ts
├─ public/           # ícones, fontes
├─ docs/             # este documento, imagens, GIFs
├─ tests/
├─ index.html
└─ README.md
```

### 9.3 Decisões técnicas importantes
- **Loop de jogo:** `requestAnimationFrame` com tempo medido por `performance.now()`; lógica independente da taxa de quadros (delta time).
- **Precisão de input:** usar `event.timeStamp` do evento de ponteiro para medir reação, e não o horário do frame.
- **Aleatoriedade determinística:** gerador com semente (ex.: mulberry32) para Missão Diária e para reproduzir sessões.
- **Pointer Lock API** para modo de mira relativa.
- **Latência de exibição:** o navegador não mede a latência do monitor. O jogo deve avisar que o tempo é "tempo de reação no navegador" e útil para comparação consigo mesmo.
- **Prevenção de trapaça (futuro):** só relevante se houver ranking online; no MVP, tudo é local.

### 9.4 Modelo de dados (resumo)
```ts
type Session = {
  id: string;
  mode: 'target-lock' | 'tracking';
  difficulty: 'cadet' | 'guardian' | 'master';
  official: boolean;        // conta para rating e streak
  dailySeed?: string;
  startedAt: number;        // timestamp
  durationMs: number;
  score: number;
  metrics: Record<string, number>; // reaction_median, accuracy, on_target_pct...
  ratingBefore: number;
  ratingAfter: number;
};
```

---

## 10. Plano de desenvolvimento (roadmap passo a passo)

### Fase 0: Preparação
- [ ] Definir nome final e verificar disponibilidade do repositório/domínio
- [ ] Criar repositório, licença (MIT), `.gitignore`, README
- [x] Configurar Vite + TypeScript + ESLint + Prettier + Vitest

### Fase 1: Núcleo do jogo
- [x] Loop de jogo, canvas responsivo, entrada de mouse
- [x] RNG com semente
- [x] Gravação de sessão em memória

### Fase 2: Modo Alvo Certo (MVP jogável)
- [x] Spawn de alvos e iscas, tempo de vida, hit detection
- [x] Pontuação e métricas
- [x] Tela de resultados simples

### Fase 3: Modo Rastreamento
- [ ] Movimento procedural do alvo (4 padrões)
- [ ] Métricas de tempo no alvo
- [ ] Resultados

### Fase 4: Persistência, recordes e rating
- [ ] Salvar sessões, recordes por modo e dificuldade
- [ ] Reflex Rating e patentes
- [ ] Animação de novo recorde

### Fase 5: Hangar de Evolução
- [ ] Gráficos de linha, barras e mapa de calor
- [ ] Estatísticas e insights automáticos

### Fase 6: Gamificação e polimento
- [ ] Missão Diária, streak, conquistas
- [ ] Visual temático completo, partículas, sons sintetizados
- [ ] Configurações (sensibilidade, mira, acessibilidade)
- [ ] Exportar/importar dados

### Fase 7: Lançamento
- [ ] Testes com gamers reais e calibração das fórmulas
- [ ] GIFs e screenshots no README
- [ ] Deploy no GitHub Pages
- [ ] Divulgação (Reddit, Discord de Marvel Rivals, etc.)

### Ideias futuras (pós-MVP)
- Ranking global e entre amigos (requer backend)
- Novos modos: Flick Shots, Troca de alvo (target switching), Go/No-Go avançado
- Replays de sessão
- Planos de treino semanais personalizados
- Versão instalável (PWA)

---

## 11. Riscos e como lidar

| Risco | Mitigação |
|---|---|
| Fórmulas de pontuação injustas ou fáceis de explorar | Testes automatizados e calibração com jogadores reais |
| Medição de reação variar por hardware | Comparar sempre o jogador consigo mesmo; avisar sobre limitações |
| Problemas de direitos autorais com o tema | Usar nomes, arte e sons originais (seção 2.2) |
| Escopo crescer demais | Seguir o roadmap por fases; só avançar com a fase anterior jogável |
| Jogo ficar repetitivo | Missão diária, variação de padrões, conquistas e novos modos futuros |

---

## 12. Decisões em aberto

1. ~~**Nome final** do jogo~~ Decidido: **Reflexpace**.
2. Rastreamento: exigir **segurar o botão** do mouse ou apenas manter o cursor sobre o alvo?
3. Haverá **conta/login** no futuro, ou o projeto continua 100% local?
4. Licença do código: MIT (recomendada) ou outra?
5. Idioma: só português ou **português + inglês** desde o início (melhor para alcance no GitHub).
