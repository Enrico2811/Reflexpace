<div align="center">

# 🎯 Reflexpace

**Treine sua mira e seus reflexos todos os dias, direto no navegador.**
Uma Academia Holográfica espacial para gamers que querem evoluir de verdade.

![Status](https://img.shields.io/badge/status-em%20desenvolvimento-orange)
![Plataforma](https://img.shields.io/badge/plataforma-web%20(desktop)-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-ready-3178C6?logo=typescript&logoColor=white)
![Licença](https://img.shields.io/badge/licen%C3%A7a-MIT-green)

<!-- Quando houver, adicione aqui um GIF da jogabilidade -->
<!-- ![Gameplay](docs/gameplay.gif) -->

</div>

---

## ✨ Sobre o projeto

**Reflexpace** é um treinador de reflexos e mira com sessões curtas de 2 a 3 minutos, pensado para quem joga FPS e hero shooters (como *Marvel Rivals*) e quer um aquecimento diário com progresso visível.

Você entra como **Cadete** numa Academia Holográfica, enfrenta drones de treino, bate recordes pessoais e acompanha sua evolução em gráficos claros, dia após dia.

## 🎮 Modos de jogo

### 🔵 Alvo Certo (*Target Lock*)
Acerte rapidamente os alvos **ciano** e **ignore as iscas vermelhas**. Treina velocidade de reação, precisão e controle de impulso.

### 🌀 Rastreamento (*Tracking*)
Mantenha a mira sobre um alvo que muda de direção, acelera e para sem aviso. Treina controle fino do mouse, essencial para heróis de feixe contínuo.

## 📈 Recordes e evolução

- 🏆 **Recordes pessoais** por modo e dificuldade
- 📊 **Gráficos de evolução**: score, rating, tempo de reação e precisão
- 🟩 **Mapa de calor** de dias treinados
- 🕸️ **Radar de habilidades**
- 🔥 **Streak diário** e **Missão Diária** com desafio igual para todos
- 🎖️ **Reflex Rating** e patentes (Cadete → Grão-Mestre)
- 💡 **Insights automáticos** sobre o seu desempenho

## 🛠️ Tecnologias

| Área | Tecnologia |
|---|---|
| Linguagem | TypeScript |
| Build | Vite |
| Jogo | Canvas 2D |
| Gráficos | Chart.js |
| Áudio | Web Audio API |
| Dados | localStorage / IndexedDB (100% local) |
| Testes | Vitest |
| Deploy | GitHub Pages |

## 📁 Estrutura

Monorepo com *npm workspaces*:

```
reflexpace/
├─ shared/        # lógica pura do jogo, sem DOM nem Node (usada pelo front e pelo back)
│  ├─ src/
│  │  ├─ modes/   # simulação dos modos (Alvo Certo pronto, Rastreamento em breve)
│  │  ├─ scoring/ # pontuação, rating e recordes
│  │  └─ ...      # tipos, sessão, RNG com semente
│  └─ tests/
├─ frontend/      # app no navegador (Vite + Canvas 2D)
│  └─ src/
│     ├─ core/    # loop, canvas e input do navegador
│     ├─ modes/   # renderização de cada modo
│     ├─ storage/ # persistência local e export/import
│     └─ ui/      # telas e gráficos
├─ backend/       # API (Fastify): sessões, métricas e ranking no futuro
│  └─ src/
└─ docs/          # documentação e mídia
```

A regra é simples: tudo o que precisa dar o **mesmo resultado** no navegador e no servidor (simulação, pontuação, tipos de sessão) mora em `shared/`. Assim o backend poderá recalcular e validar pontuações sem duplicar código.

## 🚀 Como rodar

Requer [Node.js](https://nodejs.org/) 20 ou mais recente.

```bash
git clone https://github.com/SEU-USUARIO/reflexpace.git
cd reflexpace
npm install
npm run dev
```

Abra `http://localhost:5173` no navegador.

| Comando | O que faz |
|---|---|
| `npm run dev` | Frontend com recarga automática |
| `npm run dev:backend` | Backend em `http://localhost:3000` (rota `/health`) |
| `npm test` | Roda os testes (Vitest) |
| `npm run typecheck` | Checa os tipos dos três pacotes |
| `npm run lint` | Verifica o código (ESLint) |
| `npm run format` | Formata o código (Prettier) |
| `npm run build` | Gera a versão de produção do frontend em `frontend/dist/` |

## 🗺️ Roadmap

- [x] Documento de design do jogo
- [x] Núcleo do jogo (loop, input, RNG)
- [x] Modo Alvo Certo
- [ ] Modo Rastreamento
- [ ] Recordes, rating e persistência
- [ ] Hangar de Evolução (gráficos)
- [ ] Missão Diária, streak e conquistas
- [ ] Visual temático e sons
- [ ] Deploy no GitHub Pages

O plano completo, com fórmulas de pontuação, telas e decisões técnicas, está em [`GAME_DESIGN.md`](GAME_DESIGN.md).

## ⚖️ Aviso legal

Este é um projeto de fã independente, **inspirado em ficção científica espacial**, sem qualquer afiliação com franquias, estúdios ou marcas registradas. Todos os nomes, arte e sons do jogo são originais.

## 🤝 Contribuindo

Sugestões e ideias são bem-vindas! Abra uma *issue* para discutir mudanças antes de enviar um *pull request*.

## 📄 Licença

Distribuído sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.
