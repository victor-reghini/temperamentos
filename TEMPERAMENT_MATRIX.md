# INSTRUÇÕES DE ENGENHARIA: TEMPERAMENT MATRIX

Você atuará como Engenheiro de Software Full Stack e Especialista em Front-end. Sua missão é desenvolver a aplicação web "Temperament: Matriz Neurobiológica dos 4 Temperamentos", baseando-se estritamente na identidade visual e no layout de barras do 12axes (https://12axes.vercel.app/).

---

## 1. IDENTIDADE VISUAL E LAYOUT (PADRÃO 12axes)
- **Visual:** Interface escura, minimalista e rápida, sem distrações.
- **Botões Likert Centrais:**
  * 5 botões horizontais em escala geométrica decrescente/crescente.
  * Cores de resposta: Vermelho vibrante (Discordo Totalmente), Laranja (Discordo), Cinza Chumbo (Neutro), Verde Folha (Concordo), Verde Esmeralda (Concordo Totalmente).
- **Barras de Temperamento:**
  * 4 barras principais com cores associadas aos humores clássicos:
    - Colérico: Gradiente Vermelho/Laranja (`#dc2626` -> `#ea580c`)
    - Sanguíneo: Gradiente Amarelo/Ouro (`#eab308` -> `#ca8a04`)
    - Melancólico: Gradiente Azul Cobalto (`#2563eb` -> `#1d4ed8`)
    - Fleumático: Gradiente Verde Petróleo/Cinza (`#059669` -> `#475569`)
  * Layout com marcadores centrais e percentuais absolutos claramente legíveis.

---

## 2. ARQUITETURA TOLERANTE A FALHAS (ENTREGA INCREMENTAL)
Desenvolva a camada de dados em três fases independentes, controladas por checagem de variáveis de ambiente:

1. **Fase 1 (Modo Offline / Sem Backend Obrigatório):**
   - Estado gerenciado no `localStorage`.
   - Se o banco estiver ausente, o resultado é encodificado em Base64 no hash da URL (`/results#scores={hash}`). A página monta o gráfico lendo a URL diretamente.
   - Gerador de imagens via HTML5 Canvas (Stories 9:16 e Feed 1:1) executado 100% no navegador.
   - Geração de PDF via `@react-pdf/renderer` no cliente.
   - Paywall em Modo Simulação: se não houver chaves da Stripe, o relatório pago (Manual Neurofuncional) é liberado com uma tag informativa de "Modo de Demonstração".

2. **Fase 2 (Banco Serverless Plugável):**
   - Conector para Supabase em `/api/results`. Caso as variáveis `NEXT_PUBLIC_SUPABASE_URL` existam, salva no banco e redireciona para `/r/{id}`.
   - Modo de Comparação entre Amigos: `/compare?id1={id1}&id2={id2}` ou fallback `/compare?data1={hash1}&data2={hash2}`.

3. **Fase 3 (Stripe Checkout Integrado):**
   - Se `STRIPE_SECRET_KEY` estiver preenchida, o botão de compra redireciona para a Stripe Checkout Session (`/api/create-checkout-session`) e aguarda o webhook (`/api/stripe-webhook`).
   - Se a chave não existir, mantém a liberação simulada da Fase 1 sem gerar erros de execução.

---

## 3. HOSPEDAGEM, NETLIFY E SEGURANÇA
- **Stack:** React com Vite ou Next.js, TypeScript e Tailwind CSS.
- **Hospedagem:** Netlify com Edge/Serverless Functions.
- **Regras de Segurança no `netlify.toml`:**
  * Headers HTTP estritos: CSP bloqueando scripts externos não homologados (apenas `'self'` e `js.stripe.com`), `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`.
  * Esquemas Zod para validação das respostas dos formulários, rejeitando entradas fora do intervalo `[-2, 2]`.
  * Identificadores de teste gerados com NanoID criptograficamente seguro.

---

## 4. MOTOR PSICOMÉTRICO E BANCO DE QUESTÕES
- **Base Científica:** Integração do modelo PEN de Eysenck (Extroversão x Neuroticismo) com o Fisher Temperament Inventory (Dopamina/Sanguíneo, Serotonina/Fleumático, Testosterona/Colérico e Estrogênio/Melancólico).
- **Eixos Analisados:**
  * Eixo 1: Reatividade (Impulso Imediato vs. Resposta Ponderada)
  * Eixo 2: Foco Direcional (Resultados/Metas vs. Conexões Humanas)
  * Eixo 3: Retenção de Estímulo (Marcação Profunda vs. Volatilidade)
  * Eixo 4: Ativação Energética (Expansão Externa vs. Recarga Solitária)
  * Proporção de Temperamentos: % individual para Colérico, Sanguíneo, Melancólico e Fleumático.
- **Modalidades do Quiz:**
  * **Rápido:** 20 afirmativas | ~2-3 min | ~75% de precisão (triagem direta do temperamento dominante).
  * **Médio:** 40 afirmativas | ~5-6 min | ~90% de precisão (equilíbrio contra empates artificiais).
  * **Completo:** 96 afirmativas | ~13-15 min | ~98% de precisão (análise exaustiva sob estresse e cansaço).
- **Banco de Questões:** Crie o arquivo `src/data/temperamentQuestions.json` com no mínimo 150 afirmativas balanceadas.

---

## 5. COMPARTILHAMENTO, EXPORTAÇÃO E MODO COMPARATIVO
- **Canvas Exporter:**
  * Card 9:16 (Stories) e Card 1:1 (WhatsApp) desenhando as barras coloridas dos temperamentos, percentuais e temperamento composto (ex: "Colérico-Melancólico").
- **WhatsApp Direct:** Mensagem formatada: *"Descobri minha matriz de temperamentos no TemperamentAxes: [X]% Colérico, [Y]% Melancólico. Descubra o seu e compare com o meu: [LINK]"*.
- **Comparador de Equipe/Amigos:** Gráfico comparativo sobrepondo duas matrizes e destacando potenciais atritos de convivência ou ritmo de trabalho.

Entregue o código completo, components limpos e tipagem estrita em TypeScript.