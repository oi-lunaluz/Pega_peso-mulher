# A Trilha da Força — protótipo integrado (branch experimental)

**Branch:** `feat/pixel-adventure-home-preview` · **não mesclar na `main` sem validação final**.

## Como testar pelo celular

1. Abra o Preview Deployment da branch no Vercel.
2. Acrescente `/?demo=1` ao domínio, ou abra `/pixel-adventure.html`, que redireciona para a demonstração completa.
3. Não é necessário fazer login: o aplicativo inteiro abre com **dados fictícios**, no mesmo layout mobile e com a mesma navegação inferior.
4. Acesse **Treinos**, **Rotina**, **Evolução**, **Ciclo** e **Perfil**, edite as informações e volte a **Início** para conferir o mapa.

**Segurança:** a flag `?demo=1` existe apenas nesta branch. O modo demo desativa leituras de dados privados e gravações locais/remotas do estado do aplicativo. Recarregar a página restaura os dados fictícios originais. Não há migrações SQL nem alteração no banco Supabase.

## Organização do código

| Arquivo | Responsabilidade |
|---|---|
| `src/screens/HomeScreen.vue` | Entrada da Home; alterna pixel/classic |
| `src/screens/PixelAdventureHome.vue` | Missões, cartões e atalhos |
| `src/screens/PixelQuestMap.vue` | Visualização do mapa com 5 fases por área |
| `src/screens/ClassicHome.vue` | Home anterior preservada |
| `src/lib/pixelQuest.js` | Cálculo puro de fases, áreas e ordem das fichas |
| `src/lib/adventureDemo.js` | Dados fictícios para a prévia |
| `src/lib/workoutManagement.js` | Editar, renomear e remover fichas/exercícios sem descartar histórico |
| `src/composables/useAppState.js` | Mesmo estado e ações do aplicativo original; `demoMode` bloqueia persistência |
| `src/AppWorkspace.vue` | Shell compartilhado, menu inferior e telas de sempre |
| `src/styles/pixel-adventure.css` | Estilos da aventura e integração com shell; sem alterar a base das telas |

## Regras de progressão

- **Cinco fases por área**: Área 1 (1–5), Área 2 (6–10), Área 3 (11–15) etc.
- Os números das fases são contínuos. Os **tipos de treino** seguem em ciclo a ordem das fichas cadastradas; se houver cinco fichas, a fase 6 usa a primeira ficha sem voltar a ser chamada de fase 1.
- Cada sessão de **musculação registrada** avança uma fase. Cardio não avança as fases de força.
- A ação **Já fiz** usa a marcação rápida semanal do aplicativo existente, evitando registro duplicado na mesma semana.
- A opção **Simular próxima fase** só aparece na demo e modifica **apenas a visualização**, não o histórico.
- Ao clicar em **Ver / editar ficha**, abre a mesma tela de fichas do aplicativo, com cadastro de exercícios, renomear, editar e remover. Histórico de séries e pesos é preservado.
- Os atalhos e a navegação inferior mantêm Treinos, Rotina, Evolução, Ciclo e Perfil.
- No Perfil, dá para escolher **Aventura pixel art** ou **Painel clássico**.

## O que verificar antes de levar para main

- Fluxo real de autenticação e retorno ao mapa;
- Treinos de semanas diferentes, conclusão rápida e detalhada;
- Renomear/excluir fichas com histórico e conferir indicadores;
- Usabilidade de 320 a 430 px e navegação entre áreas;
- Conflitos de sincronização Supabase ao usar mais de um dispositivo.

A versão estática antiga segue em `preview/pixel-adventure.html` apenas como referência histórica; o endereço navegável de teste agora é a **aplicação Vue com `?demo=1`**, e não uma cópia separada em HTML.

**Produção:** não foi alterada. Não houve upgrade, criação de banco, migração ou promoção de preview para produção.

## Visual completo e dupla de personagens

- `src/screens/PixelSceneHeader.vue`: cabeçalho compartilhado em pixel art para Treinos, Ficha, Exercício, Sessão, Rotina, Evolução, Ciclo, Conclusão e Perfil.
- `public/pixel-hero-girl.svg` e `public/pixel-caramary.svg`: menina de cabelo castanho e CaraMary em quatro patas. Ambas acompanham a personagem no mapa, nas demais telas e no popup de conquista.
- `src/styles/pixel-skin.css`: visual retrô para cards, gráficos, formulários, navegação, botões e conteúdo interno, sem excluir as ações de edição já existentes.
- `src/screens/PixelRewardShelf.vue` e `PixelRewardPopup.vue`: barra de sequência, prêmios conquistados, próxima recompensa e animação de desbloqueio com controles acessíveis.
- `src/lib/gamification.js`: regras puras de consistência, sem dependência de banco ou API externa.

## Regras verificáveis das medalhas

As medalhas são calculadas pelo histórico real de **musculação** e pelos **dias de treinamento planejados**:

- 5 treinos planejados concluídos em sequência: Medalha **Primeiro Embalo**
- 15: Insígnia **Constância de Bronze**
- 30: Insígnia **Rainha da Rotina**
- 60: Insígnia **Lenda do Treino**
- 100: Troféu **CaraMary Supreme**

"Seguidos" significa **sessões programadas cumpridas**, não cinco dias consecutivos do calendário: descansos não quebram; uma falta em dia planejado interrompe a sequência. Um dia não conta duas vezes. Os prêmios dependem da melhor sequência já conquistada, de modo que uma nova semana não apaga as medalhas antigas. Hoje ainda não vencido não conta como falta.

`scheduleTimeline` guarda alterações dos dias planejados com data de vigência a partir do dia seguinte, preservando os compromissos anteriores. Para contas legadas sem histórico de alterações, as semanas anteriores são calculadas com a agenda atual; isso é explicitado na interface. Uma edição do plano não apaga histórico.

Não contam: cardio, abertura de ficha, seleção de fase, vitórias simuladas ou registros inventados. As insígnias são derivadas de dados salvos que já estão no snapshot; **não foi criado serviço pago ou tabela nova**.

Em `/?demo=1`, a prateleira possui botões de **Prévia 5 / 15 / 30**, que abrem o modal ilustrativo sem conceder prêmios reais. É possível navegar por TODAS as telas com treinos fictícios e testar edições sem persistência.

## Checklist de regressão antes de aprovar para main

1. Entrar em `/?demo=1`, conferir bonequinha + CaraMary no mapa e nas telas internas.
2. Navegar pela barra inferior, criar ficha, editar/excluir um exercício e voltar ao mapa.
3. Conferir os filtros de evolução, as preferências de cardio, o registro opcional do ciclo e o perfil.
4. Abrir as prévias das medalhas e verificar se popup fecha por botão e ao tocar fora não fecha inadvertidamente.
5. Simular registros em dias planejados e confirmar que não existem medalhas sem cumprimento de agenda.
6. Testar celular estreito, teclado aberto e rolagem em todas as telas.
7. Depois, numa conta de teste real, verificar sincronização e concorrência entre dispositivos antes de mesclar a branch.

**Importante:** somente a branch `feat/pixel-adventure-home-preview` recebeu as mudanças. A `main` e os dados Supabase permanecem intactos.
