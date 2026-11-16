# Protótipo — A Trilha da Força (Pixel Adventure)

Esta branch foi criada **só para testar a gamificação da tela inicial**. Não substitui a branch `main` e **não requer alterações no Supabase**.

## O que tem aqui

- Home redesenhada como uma floresta de pixel art, com cenário, fantasminhas e uma protagonista de cabelo castanho;
- Uma fase para cada ficha, seguindo a ordem definida no cadastro;
- Fases **numeradas continuamente**. Com cinco fichas, por exemplo, as fases 1–5 usam os cinco treinos; a **fase 6** utiliza novamente o primeiro treino, mas continua numerada como 6, depois 7, 8, e assim por diante;
- Progresso real lido **somente** do histórico existente. O botão **Simular vitória** altera apenas o estado visual da sessão atual, sem salvar no banco;
- Áreas com cinco fases cada e navegação para áreas seguintes;
- Arquivo de prévia sem dependências: `preview/pixel-adventure.html`. Abra-o diretamente no navegador após baixar/clonar a branch. Ele utiliza as ilustrações originais em `public/`.

## Rodar localmente

```bash
git clone -b feat/pixel-adventure-home-preview https://github.com/oi-lunaluz/Pega_peso-mulher.git
cd Pega_peso-mulher
npm install
npm run dev
```

Abra o endereço `http://localhost:5173` **no mesmo computador que estiver rodando o Vite**. O aplicativo Vue mantém o fluxo de autenticação existente, mas só a Home desta branch muda. Para ver o conceito **sem entrar em nenhuma conta**, abra `preview/pixel-adventure.html` depois de baixar o repositório.

Se estiver em outro aparelho (celular), `localhost` se refere ao próprio celular, não ao computador. Use o endereço de rede local indicado pelo Vite, desde que ambos estejam na mesma rede. A branch é publicada automaticamente como Preview Deployment no Vercel; a demonstração independente fica em `/pixel-adventure.html` no endereço do deploy.

## Arquivos principais

- `src/screens/PixelAdventureHome.vue` — Home alternativa do app;
- `src/styles/pixel-adventure.css` — estilos responsivos;
- `src/lib/pixelQuest.js` e `pixelQuest.test.js` — sequência ilimitada, cálculo de fases e testes;
- `public/pixel-forest.svg` e `public/pixel-hero-girl.svg` — arte vetorial pixelada original;
- `preview/pixel-adventure.html` — prévia estática e interativa.

**Importante:** o protótipo visual não cria fichas nem grava vitórias. O treino real, quando aberto no aplicativo completo, continua seguindo o fluxo atual; qualquer sincronização eventual do app deve ser feita apenas por ações reais fora da simulação.
