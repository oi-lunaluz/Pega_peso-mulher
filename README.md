# Pega Peso, Mulher!

Aplicativo de acompanhamento de musculação, cardio e ciclo menstrual. Interface mobile-first com a mascote **Mary (CaraMary)**.

## Tecnologia e execução

- Vue 3, Vite e ícones Lucide;
- Deploy automático no Vercel a partir da branch `main`;
- Persistência local no navegador, sem login ou sincronização.

```bash
npm install
npm run dev
npm test
npm run build
```

O build roda primeiro os testes Node (`node --test`) e depois compila o Vue. Se um teste falhar, o deploy não deve ser publicado.

## Organização

```text
src/
  App.vue                      # portal: cadastro ou área autenticada
  AppWorkspace.vue             # layout, navegação e modais do aplicativo
  AppIcon.vue                  # ícones SVG padronizados
  composables/
    useAppState.js             # estado, ações, sessões e persistência
  screens/
    AuthScreen.vue             # cadastro básico e entrada local
    HomeScreen.vue             # início e semana
    RoutineScreen.vue          # planejamento flexível
    WorkoutsScreen.vue         # fichas e cardio
    WorkoutDetailScreen.vue    # detalhes da ficha
    SessionScreen.vue          # cronômetro + mascote por cardio
    ExerciseScreen.vue         # séries e cargas
    FinishedScreen.vue         # conclusão
    ProgressScreen.vue         # evolução por ficha e exercício
    CycleScreen.vue            # ciclo e registros
    ProfileScreen.vue          # preferências locais
  lib/
    planner.js                 # regras puras da agenda semanal
    planner.test.js            # faltas, compensação, cardio
    trainingMath.js            # séries, volume, cronômetro
    trainingMath.test.js
    localAuth.js               # cadastro local de demonstração
    localAuth.test.js
    storage.js                 # leitura, escrita e migração seguras
    storage.test.js
  styles/                      # CSS por contexto, na ordem de precedência
  style.css                    # ponto único dos imports CSS
public/
  caramelo-*.svg               # mascote base
  mary-cardio-*.svg            # seis modalidades ilustradas
```

## Regras importantes

- **Agenda semanal:** a pessoa escolhe em quais dias pretende treinar.
- **Fila de fichas:** faltar em um dia planejado não avança a ficha de musculação.
- **Pendências:** o aviso compara sessões planejadas e concluídas desde a ativação da agenda. Ao modificar os dias, a dívida anterior é preservada.
- **Conclusão:** apenas finalizar a ficha que está na posição atual avança a sequência. Fichas iniciadas fora de ordem podem ser registradas, mas não movem a fila.
- **Cardio:** modalidade e duração são gravadas separadamente, sem alterar a sequência de musculação. A mascote exibida depende da modalidade escolhida.
- **Evolução:** métricas usam séries de fato registradas; filtro por treino ou exercício.
- **Ciclo:** registros opcionais, informações estimadas e não indicadas para contracepção.

## Compatibilidade de dados

Chaves mantidas para preservar dados antigos:

- `pega-peso-mulher-mvp-v1` — treinos, rotina, histórico e agenda;
- `pega-peso-mulher-cycle-v1` — ciclo;
- `pega-peso-mulher-profile-v1` — preferências.

Não limpe o armazenamento local sem uma cópia dos dados. Os dados **não acompanham automaticamente a pessoa ao mudar de aparelho ou navegador**.

## Limitações da versão atual

A tela de cadastro/login utiliza apenas armazenamento local do navegador: **não é autenticação segura de produção**, não há verificação de e-mail, recuperação de senha, backup remoto, sincronização, medição automática por sensores ou testes E2E de navegador. A senha não fica em texto puro, mas os dados salvos no navegador não são criptografados. Para lançar contas reais, integrar um provedor de identidade com backend. A compilação e os testes unitários verificam parte da qualidade, mas ainda é importante testar interações em um celular real.

## Cadastro local de demonstração

A primeira visita apresenta **Criar cadastro** (nome, e-mail, senha com 8+ caracteres e confirmação); também há **Já tenho cadastro**. Cada cadastro guarda treinos, ciclo e perfil em chaves separadas neste navegador. O primeiro cadastro herda os dados usados no aplicativo antes da existência de login. A opção **Sair do cadastro** está em Meu perfil. A sessão vale somente para a aba atual. **Não use senhas já usadas em outros sites**, pois não há servidor nem proteção real de contas. Para disponibilizar o aplicativo a outras pessoas, substituir esse protótipo por autenticação por servidor.
