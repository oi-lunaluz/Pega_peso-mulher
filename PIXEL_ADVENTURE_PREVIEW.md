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
