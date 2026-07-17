// Bangkit deep-dive: injects the full technical walkthrough into the project
// detail page. Scoped naturally to Bangkit — it mounts after the .how-it-works
// section, which only the Bangkit project defines.

(function () {
  const anchor = document.querySelector("#projectDetail .how-it-works");
  if (!anchor) return;

  const AR = '<defs><marker id="ddArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M2 1L8 5L2 9" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></marker></defs>';

  const html = `
  <section class="detail-section dd">
    <h2>Trace one request, step by step</h2>
    <p class="detail-lead">Pick a scenario and step through exactly what happens at each hop — what data is passed, what each component decides, and what comes back. This is the real control flow, simplified only in wording.</p>
    <div id="ddSim"></div>
  </section>

  <section class="detail-section dd">
    <h2>Layer 1 &mdash; the frontend: a thin, safe proxy</h2>
    <p>The Next.js app on Vercel is deliberately <strong>not</strong> where the intelligence lives. When a student sends a message, a server-side API route (never the browser) forwards it to the agent service. Two decisions matter:</p>
    <ul class="dd-list">
      <li><strong>Server-to-server only.</strong> The call carries a secret key in an <code class="dd-code">X-API-Key</code> header. It lives in Vercel's server environment and never reaches the browser, so a visitor can't read it and run up the LLM bill.</li>
      <li><strong>Strangler-fig migration.</strong> The original app called the LLM directly. The new path is opt-in: when <code class="dd-code">AI_SERVICE_URL</code> is set, requests route to the agent service; if the service is unreachable, the code silently falls back to the direct path. Zero downtime, instant rollback.</li>
    </ul>
    <pre class="dd-pre"><span class="c">// web/lib/agentService.js — the proxy call (simplified)</span>
<span class="k">export async function</span> <span class="f">callAgentService</span>({ request, subject, chapter }) {
  <span class="k">const</span> res = <span class="k">await</span> <span class="f">fetch</span>(\`\${BASE_URL}/v1/agent\`, {
    method: <span class="s">"POST"</span>,
    headers: { <span class="s">"Content-Type"</span>: <span class="s">"application/json"</span>, <span class="s">"X-API-Key"</span>: API_KEY },
    body: <span class="f">JSON.stringify</span>({ request, subject, chapter }),
    signal: <span class="f">AbortSignal.timeout</span>(30000),  <span class="c">// don't hang forever</span>
  });
  <span class="k">return</span> res.<span class="f">json</span>();
}</pre>
    <p class="dd-src">In the code: <a href="https://github.com/nisakhantalib/bangkit-agentic/blob/master/web/lib/agentService.js" target="_blank" rel="noreferrer">web/lib/agentService.js</a> &middot; <a href="https://github.com/nisakhantalib/bangkit-agentic/blob/master/web/app/api/chat/route.js" target="_blank" rel="noreferrer">web/app/api/chat/route.js</a></p>
  </section>

  <section class="detail-section dd">
    <h2>Layer 2 &mdash; the agent service: where the thinking happens</h2>
    <p>A <strong>FastAPI</strong> web server wrapping a <strong>LangGraph</strong> state machine. FastAPI handles HTTP; LangGraph orchestrates the agents. A request entering <code class="dd-code">POST /v1/agent</code> becomes a shared <em>state</em> object that flows through the graph.</p>
    <div class="dd-fig">
      <svg viewBox="0 0 680 340" role="img" aria-label="The LangGraph agent graph">${AR}
        <rect x="20" y="20" width="640" height="300" rx="16" class="hiw-region" stroke-dasharray="4 4"/>
        <text class="hiw-mono" x="40" y="44">LangGraph state machine</text>
        <rect x="260" y="58" width="160" height="52" rx="10" class="hiw-box hiw-accent"/>
        <text class="hiw-t" x="340" y="80" text-anchor="middle">supervisor</text>
        <text class="hiw-s" x="340" y="97" text-anchor="middle">classify &middot; plan &middot; scope</text>
        <line x1="300" y1="110" x2="180" y2="150" class="hiw-line" marker-end="url(#ddArrow)"/>
        <line x1="340" y1="110" x2="340" y2="150" class="hiw-line" marker-end="url(#ddArrow)"/>
        <line x1="380" y1="110" x2="500" y2="150" class="hiw-line" marker-end="url(#ddArrow)"/>
        <rect x="70" y="152" width="150" height="52" rx="10" class="hiw-box"/>
        <text class="hiw-t" x="145" y="174" text-anchor="middle">tutor</text>
        <text class="hiw-s" x="145" y="191" text-anchor="middle">grounded answer</text>
        <rect x="265" y="152" width="150" height="52" rx="10" class="hiw-box"/>
        <text class="hiw-t" x="340" y="174" text-anchor="middle">quiz_gen</text>
        <text class="hiw-s" x="340" y="191" text-anchor="middle">validated JSON</text>
        <rect x="460" y="152" width="150" height="52" rx="10" class="hiw-box"/>
        <text class="hiw-t" x="535" y="174" text-anchor="middle">marker</text>
        <text class="hiw-s" x="535" y="191" text-anchor="middle">rubric grading</text>
        <line x1="145" y1="204" x2="300" y2="244" class="hiw-line" marker-end="url(#ddArrow)"/>
        <line x1="340" y1="204" x2="340" y2="244" class="hiw-line" marker-end="url(#ddArrow)"/>
        <line x1="535" y1="204" x2="380" y2="244" class="hiw-line" marker-end="url(#ddArrow)"/>
        <rect x="250" y="246" width="180" height="52" rx="10" class="hiw-box hiw-violet"/>
        <text class="hiw-t" x="340" y="268" text-anchor="middle">advance</text>
        <text class="hiw-s" x="340" y="285" text-anchor="middle">next step, or finish</text>
        <path d="M250 272 L150 272 L150 210" class="hiw-line" fill="none" stroke-dasharray="4 3" marker-end="url(#ddArrow)"/>
      </svg>
      <p class="dd-cap">The supervisor routes to a worker; each worker returns to "advance", which loops for multi-step plans or ends.</p>
    </div>
    <details class="dd-det"><summary>Deep-dive: what "shared state" actually means</summary><div>
      <p>LangGraph passes one typed dictionary — the state — through every node. A node reads what it needs and returns only the fields it changes; LangGraph merges them. That's how the tutor sees what the supervisor decided without them calling each other directly.</p>
      <pre class="dd-pre"><span class="k">class</span> <span class="f">TutorState</span>(TypedDict, total=<span class="k">False</span>):
    request: str          <span class="c"># the student's question</span>
    intent: str           <span class="c"># tutor | quiz | mark   (set by supervisor)</span>
    plan: list[str]       <span class="c"># ordered steps for multi-part requests</span>
    subject: str          <span class="c"># "sains" | "matematik"</span>
    chapter: str
    retrieved: list[dict] <span class="c"># RAG results          (set by retrieve node)</span>
    answer: str           <span class="c"># final text           (set by tutor node)</span>
    quiz: dict            <span class="c"># validated quiz       (set by quiz node)</span></pre>
    </div></details>
    <p class="dd-src">In the code: <a href="https://github.com/nisakhantalib/bangkit-agentic/blob/master/ai-service/app/graph/build.py" target="_blank" rel="noreferrer">ai-service/app/graph/build.py</a> &middot; <a href="https://github.com/nisakhantalib/bangkit-agentic/blob/master/ai-service/app/graph/state.py" target="_blank" rel="noreferrer">ai-service/app/graph/state.py</a></p>
  </section>`;

  anchor.insertAdjacentHTML("afterend", html);
  window.__ddAnchor = document.querySelectorAll("#projectDetail .dd");
})();

(function () {
  const sections = document.querySelectorAll("#projectDetail .dd");
  if (!sections.length) return;
  const last = sections[sections.length - 1];

  const AR2 = '<defs><marker id="ddArrow2" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M2 1L8 5L2 9" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></marker></defs>';

  const html = `
  <section class="detail-section dd">
    <h2>Layer 3 &mdash; the supervisor: decomposition and routing</h2>
    <p>This node is what makes the system "agentic" rather than a single prompt. Three jobs on every request:</p>
    <ul class="dd-list">
      <li><strong>Intent classification.</strong> Tutor, quiz, or mark? A fast, cheap model reads the question and returns a structured verdict.</li>
      <li><strong>Scope extraction.</strong> Which subject and chapter? If the caller stated it, that wins; otherwise the supervisor infers it.</li>
      <li><strong>Task decomposition.</strong> "Explain chapter 1, then quiz me" becomes an ordered plan: <code class="dd-code">["tutor", "quiz"]</code>. The graph executes each step in turn — that loop through "advance" in the diagram above.</li>
    </ul>
    <div class="dd-cards">
      <div class="dd-card"><h4><span class="dd-dot" style="background:#10b981"></span>Model tiering</h4><p>The supervisor uses a small fast model (routing is easy). The tutor and marker use a larger one (reasoning is hard). Right tool, right cost.</p></div>
      <div class="dd-card"><h4><span class="dd-dot" style="background:#3b82f6"></span>Caller scope wins</h4><p>If the request already specifies subject and chapter, the supervisor never overrides it with a guess. Explicit input beats inference — a real bug fix (see the log below).</p></div>
    </div>
    <p class="dd-src">In the code: <a href="https://github.com/nisakhantalib/bangkit-agentic/blob/master/ai-service/app/graph/supervisor.py" target="_blank" rel="noreferrer">ai-service/app/graph/supervisor.py</a> &middot; <a href="https://github.com/nisakhantalib/bangkit-agentic/blob/master/ai-service/app/graph/nodes.py" target="_blank" rel="noreferrer">ai-service/app/graph/nodes.py</a></p>
  </section>

  <section class="detail-section dd">
    <h2>Layer 4 &mdash; retrieval: why answers don't hallucinate</h2>
    <p>Before any agent answers, a retrieve step runs — the RAG (Retrieval-Augmented Generation) pipeline. The curriculum becomes searchable once at build time; every question then searches it by meaning.</p>
    <div class="dd-fig">
      <svg viewBox="0 0 680 200" role="img" aria-label="RAG ingestion and retrieval">${AR2}
        <text class="hiw-mono" x="16" y="24">BUILD TIME &mdash; ingestion (runs once)</text>
        <rect x="16" y="36" width="120" height="48" rx="9" class="hiw-box"/>
        <text class="hiw-s" x="76" y="56" text-anchor="middle" style="font-weight:600">lesson files</text>
        <text class="hiw-s" x="76" y="72" text-anchor="middle">markdown</text>
        <line x1="136" y1="60" x2="162" y2="60" class="hiw-line" marker-end="url(#ddArrow2)"/>
        <rect x="164" y="36" width="120" height="48" rx="9" class="hiw-box"/>
        <text class="hiw-s" x="224" y="56" text-anchor="middle" style="font-weight:600">chunk</text>
        <text class="hiw-s" x="224" y="72" text-anchor="middle">by heading</text>
        <line x1="284" y1="60" x2="310" y2="60" class="hiw-line" marker-end="url(#ddArrow2)"/>
        <rect x="312" y="36" width="120" height="48" rx="9" class="hiw-box"/>
        <text class="hiw-s" x="372" y="56" text-anchor="middle" style="font-weight:600">embed</text>
        <text class="hiw-s" x="372" y="72" text-anchor="middle">&rarr; vectors</text>
        <line x1="432" y1="60" x2="458" y2="60" class="hiw-line" marker-end="url(#ddArrow2)"/>
        <rect x="460" y="36" width="140" height="48" rx="9" class="hiw-box hiw-amber"/>
        <text class="hiw-s" x="530" y="56" text-anchor="middle" style="font-weight:600">vector store</text>
        <text class="hiw-s" x="530" y="72" text-anchor="middle">204 chunks</text>

        <text class="hiw-mono" x="16" y="126">QUERY TIME &mdash; retrieval (every question)</text>
        <rect x="16" y="138" width="150" height="48" rx="9" class="hiw-box hiw-accent"/>
        <text class="hiw-s" x="91" y="158" text-anchor="middle" style="font-weight:600">question + scope</text>
        <text class="hiw-s" x="91" y="174" text-anchor="middle">sains &middot; ch 1</text>
        <line x1="166" y1="162" x2="192" y2="162" class="hiw-line" marker-end="url(#ddArrow2)"/>
        <rect x="194" y="138" width="170" height="48" rx="9" class="hiw-box"/>
        <text class="hiw-s" x="279" y="158" text-anchor="middle" style="font-weight:600">filter + similarity</text>
        <text class="hiw-s" x="279" y="174" text-anchor="middle">top matches by meaning</text>
        <line x1="364" y1="162" x2="390" y2="162" class="hiw-line" marker-end="url(#ddArrow2)"/>
        <rect x="392" y="138" width="208" height="48" rx="9" class="hiw-box hiw-accent"/>
        <text class="hiw-s" x="496" y="158" text-anchor="middle" style="font-weight:600">6 chunks + source labels</text>
        <text class="hiw-s" x="496" y="174" text-anchor="middle">"Bab 1: Mikroorganisma..."</text>
      </svg>
      <p class="dd-cap">Top row runs when the container image is built; bottom row runs on every question.</p>
    </div>
    <p>The tutor then gets a strict instruction: <em>answer only from this retrieved context, and cite the section</em>. If retrieval returns nothing relevant, it says so rather than inventing an answer. That single constraint is the difference between a study tool teachers can trust and a confident liar.</p>
    <details class="dd-det"><summary>Deep-dive: structured output with self-healing</summary><div>
      <p>The quiz and marking agents must return machine-readable JSON matching an exact schema (Pydantic models). Raw LLM output is unreliable, so each structured node validates the response — and on failure retries once with the validation errors fed back as a repair prompt. Contract enforced at the boundary, not hoped for.</p>
      <pre class="dd-pre">result, error = <span class="f">_structured</span>(llm, prompt, QuizSpec)
<span class="c"># 1. call LLM   2. validate against QuizSpec</span>
<span class="c"># 3. on failure: retry once with the errors in a repair prompt</span>
<span class="c"># 4. still invalid: degrade gracefully, never crash</span></pre>
    </div></details>
    <p class="dd-src">In the code: <a href="https://github.com/nisakhantalib/bangkit-agentic/blob/master/ai-service/app/rag/ingest.py" target="_blank" rel="noreferrer">ai-service/app/rag/ingest.py</a> &middot; <a href="https://github.com/nisakhantalib/bangkit-agentic/blob/master/ai-service/app/rag/retriever.py" target="_blank" rel="noreferrer">ai-service/app/rag/retriever.py</a> &middot; <a href="https://github.com/nisakhantalib/bangkit-agentic/blob/master/ai-service/app/schemas/quiz.py" target="_blank" rel="noreferrer">ai-service/app/schemas/quiz.py</a></p>
  </section>

  <section class="detail-section dd">
    <h2>Layer 5 &mdash; shipping it: Docker, CI/CD, and Azure</h2>
    <p>Writing the service is one skill; hosting it so it updates itself is another. The service is packaged as a <strong>Docker image</strong> — code, dependencies, and the pre-built curriculum corpus in one portable box. On every merge to master, GitHub Actions logs into Azure, builds the image, pushes it to a registry, and rolls it out to <strong>Azure Container Apps</strong>, which scales to zero when idle so the demo costs nothing between visits.</p>
    <div class="dd-fig">
      <svg viewBox="0 0 680 250" role="img" aria-label="CI/CD pipeline with OIDC">${AR2}
        <rect x="20" y="30" width="180" height="56" rx="10" class="hiw-box"/>
        <text class="hiw-t" x="110" y="53" text-anchor="middle">GitHub Actions</text>
        <text class="hiw-s" x="110" y="71" text-anchor="middle">triggered by merge</text>
        <rect x="480" y="30" width="180" height="56" rx="10" class="hiw-box hiw-violet"/>
        <text class="hiw-t" x="570" y="53" text-anchor="middle">Microsoft Entra</text>
        <text class="hiw-s" x="570" y="71" text-anchor="middle">verifies identity</text>
        <line x1="200" y1="50" x2="476" y2="50" class="hiw-line" marker-end="url(#ddArrow2)"/>
        <text class="hiw-mono" x="338" y="42" text-anchor="middle">1. signed OIDC token</text>
        <line x1="476" y1="68" x2="200" y2="68" class="hiw-line" marker-end="url(#ddArrow2)"/>
        <text class="hiw-mono" x="338" y="84" text-anchor="middle">2. short-lived session &mdash; no stored password</text>
        <line x1="110" y1="86" x2="110" y2="128" class="hiw-line" marker-end="url(#ddArrow2)"/>
        <text class="hiw-mono" x="126" y="112">3. build + push image</text>
        <rect x="20" y="130" width="180" height="56" rx="10" class="hiw-box hiw-amber"/>
        <text class="hiw-t" x="110" y="153" text-anchor="middle">Container Registry</text>
        <text class="hiw-s" x="110" y="171" text-anchor="middle">stores the image</text>
        <line x1="200" y1="158" x2="288" y2="158" class="hiw-line" marker-end="url(#ddArrow2)"/>
        <text class="hiw-mono" x="244" y="150" text-anchor="middle">4. deploy</text>
        <rect x="290" y="130" width="180" height="56" rx="10" class="hiw-box hiw-accent"/>
        <text class="hiw-t" x="380" y="153" text-anchor="middle">Container App</text>
        <text class="hiw-s" x="380" y="171" text-anchor="middle">scales 0 &rarr; 1 on traffic</text>
        <line x1="380" y1="186" x2="380" y2="212" class="hiw-line" marker-end="url(#ddArrow2)"/>
        <rect x="235" y="214" width="290" height="30" rx="8" class="hiw-box"/>
        <text class="hiw-mono" x="380" y="233" text-anchor="middle">https://...azurecontainerapps.io</text>
      </svg>
      <p class="dd-cap">OIDC federation: Azure trusts tokens GitHub signs for this exact repo and branch. Nothing long-lived is stored.</p>
    </div>
    <details class="dd-det"><summary>Deep-dive: why OIDC instead of a stored key</summary><div>
      <p>Instead of saving an Azure password in GitHub, Azure is told to trust tokens GitHub signs — but only when the token claims to come from this exact repository on this exact branch. GitHub mints a fresh signed token per run; Azure verifies signature and claim, then issues a short-lived session. If a token ever leaked, it's already expired and only ever named one repo.</p>
    </div></details>
    <p class="dd-src">In the code: <a href="https://github.com/nisakhantalib/bangkit-agentic/blob/master/ai-service/Dockerfile" target="_blank" rel="noreferrer">ai-service/Dockerfile</a> &middot; <a href="https://github.com/nisakhantalib/bangkit-agentic/blob/master/.github/workflows/deploy.yml" target="_blank" rel="noreferrer">.github/workflows/deploy.yml</a> &middot; <a href="https://github.com/nisakhantalib/bangkit-agentic/blob/master/ai-service/DEPLOY.md" target="_blank" rel="noreferrer">ai-service/DEPLOY.md</a></p>
  </section>

  <section class="detail-section dd">
    <h2>Debugging log: seven production-only failures</h2>
    <p>Every bug below passed local tests and CI, then failed only in production — because local and production differed in permissions, network, or configuration (the "dev/prod parity gap"). Each was diagnosed from logs and fixed at the root cause.</p>
    <div class="dd-bugs">
      <div class="dd-bug"><span>01</span><div><h4>Packaging error</h4><p>The Python package wouldn't install in CI — setuptools couldn't auto-discover modules in a flat layout. Fixed with explicit package configuration.</p><p class="dd-fix">Fix: <a href="https://github.com/nisakhantalib/bangkit-agentic/blob/master/ai-service/pyproject.toml" target="_blank" rel="noreferrer">pyproject.toml &rarr; [build-system] + packages.find</a></p></div></div>
      <div class="dd-bug"><span>02</span><div><h4>Cloud build blocked</h4><p>The free-tier subscription disables Azure's cloud build service. Moved the image build into GitHub Actions — same image, earlier stage.</p><p class="dd-fix">Fix: <a href="https://github.com/nisakhantalib/bangkit-agentic/blob/master/.github/workflows/deploy.yml" target="_blank" rel="noreferrer">deploy.yml &rarr; 'Build and push image' step</a></p></div></div>
      <div class="dd-bug"><span>03</span><div><h4>OIDC claim mismatch</h4><p>Azure rejected the login: GitHub had moved to immutable subject claims embedding account and repo IDs. Tightened the trust rule to the exact claim.</p><p class="dd-fix">Fix: <a href="https://github.com/nisakhantalib/bangkit-agentic/blob/master/ai-service/DEPLOY.md" target="_blank" rel="noreferrer">DEPLOY.md &rarr; federated-credential setup</a></p></div></div>
      <div class="dd-bug"><span>04</span><div><h4>Embedder crashed the container</h4><p>The embedding library was missing from dependencies; a lazy import passed CI and crashed only at container startup. Added the dep, pre-baked the model, degraded gracefully.</p><p class="dd-fix">Fix: <a href="https://github.com/nisakhantalib/bangkit-agentic/blob/master/ai-service/pyproject.toml" target="_blank" rel="noreferrer">pyproject.toml &rarr; fastembed dep</a> &middot; <a href="https://github.com/nisakhantalib/bangkit-agentic/blob/master/ai-service/Dockerfile" target="_blank" rel="noreferrer">Dockerfile &rarr; model pre-bake</a> &middot; <a href="https://github.com/nisakhantalib/bangkit-agentic/blob/master/ai-service/app/main.py" target="_blank" rel="noreferrer">main.py &rarr; _build_index fallback</a></p></div></div>
      <div class="dd-bug"><span>05</span><div><h4>Empty vector store</h4><p>An embedding failure during ingestion left the store empty, so every answer lost its grounding. Made the whole build-index step fall back reliably.</p><p class="dd-fix">Fix: <a href="https://github.com/nisakhantalib/bangkit-agentic/blob/master/ai-service/app/main.py" target="_blank" rel="noreferrer">main.py &rarr; _build_index()</a> &middot; <a href="https://github.com/nisakhantalib/bangkit-agentic/blob/master/ai-service/tests/test_security.py" target="_blank" rel="noreferrer">regression test</a></p></div></div>
      <div class="dd-bug"><span>06</span><div><h4>Caller scope overridden</h4><p>The supervisor's guess overrode the caller's explicit subject/chapter, so the retrieval filter matched nothing. Made explicit input authoritative over inference.</p><p class="dd-fix">Fix: <a href="https://github.com/nisakhantalib/bangkit-agentic/blob/master/ai-service/app/graph/supervisor.py" target="_blank" rel="noreferrer">supervisor.py &rarr; caller_subject or ...</a> &middot; <a href="https://github.com/nisakhantalib/bangkit-agentic/blob/master/ai-service/app/rag/retriever.py" target="_blank" rel="noreferrer">retriever.py &rarr; chapter-filter relaxation</a> &middot; <a href="https://github.com/nisakhantalib/bangkit-agentic/blob/master/ai-service/tests/test_graph.py" target="_blank" rel="noreferrer">regression tests</a></p></div></div>
      <div class="dd-bug"><span>07</span><div><h4>Stale deployment</h4><p>A green pipeline deployed an old commit — the fix was never merged. A successful deploy means "the pipeline ran", not "my latest code is live". Always check the deployed commit SHA.</p><p class="dd-fix">Fix: <a href="https://github.com/nisakhantalib/bangkit-agentic/blob/master/ai-service/DEPLOY.md" target="_blank" rel="noreferrer">verify with: az containerapp show --query ...image</a></p></div></div>
    </div>
  </section>`;

  last.insertAdjacentHTML("afterend", html);
})();

// ---- Interactive request simulator ----
(function () {
  const mount = document.querySelector("#ddSim");
  if (!mount) return;

  const scenarios = {
    tutor: { label: "Explain a concept", request: '"Apakah maksud mikroorganisma?"', steps: [
      { who: "Browser", c: "#3b82f6", title: "Student sends the question", detail: "Typed in the chat box on the live site and sent to the Next.js API route on Vercel's server.", data: 'POST /api/chat  { message: "Apakah maksud mikroorganisma?", subject: "sains" }' },
      { who: "Frontend", c: "#3b82f6", title: "Forwarded with the secret key", detail: "Vercel's server (not the browser) calls the agent service, attaching X-API-Key. The browser never sees this key.", data: 'POST /v1/agent  X-API-Key: ••••••  { request, subject: "sains" }' },
      { who: "Supervisor", c: "#10b981", title: "Classifies intent and scope", detail: "A fast model reads the question, decides intent is 'tutor', and keeps the caller-provided scope. Single-step plan.", data: 'intent: "tutor" · subject: "sains" · chapter: "1" · plan: ["tutor"]' },
      { who: "Retrieve", c: "#d97706", title: "RAG pulls the real lesson text", detail: "The retriever filters the vector store to sains/chapter 1 and returns the chunks closest in meaning — each tagged with its source section.", data: '6 chunks · top: "Bab 1: Mikroorganisma > 1.1 Dunia Mikroorganisma"' },
      { who: "Tutor", c: "#10b981", title: "Answers from that context only", detail: "The larger model is told to use only the retrieved text and cite the section. No context would mean 'I can\\'t answer' — never a guess.", data: '"Mikroorganisma ialah organisma seni... (Bab 1: Mikroorganisma > 1.1)"' },
      { who: "Browser", c: "#3b82f6", title: "Grounded answer returns", detail: "Back through the frontend to the browser, carrying its citation so the student can trust and verify it.", data: '{ answer: "...", sources: ["Bab 1: Mikroorganisma > 1.1 ..."] }' },
    ]},
    quiz: { label: "Make a quiz", request: '"Quiz me on chapter 1 sains"', steps: [
      { who: "Browser", c: "#3b82f6", title: "Student requests a quiz", detail: "Same entry point — the request just expresses a different intent this time.", data: 'POST /api/chat  { message: "Quiz me on chapter 1 sains" }' },
      { who: "Supervisor", c: "#10b981", title: "Routes to quiz generation", detail: "Intent classifies as 'quiz'. Subject and chapter are extracted and routing follows.", data: 'intent: "quiz" · subject: "sains" · chapter: "1"' },
      { who: "Retrieve", c: "#d97706", title: "Retrieve source material", detail: "Questions must come from real curriculum, so retrieval runs first — grounding the quiz in actual chapter content.", data: '6 chunks from Bab 1: Mikroorganisma' },
      { who: "Quiz gen", c: "#10b981", title: "Generate, then validate JSON", detail: "The model writes questions as JSON. The node validates against a strict schema; if malformed, it retries once with the errors fed back.", data: '{ questions: [{ question, options, answer, explanation }] }  ✓ valid' },
      { who: "Browser", c: "#3b82f6", title: "Structured quiz returns", detail: "A validated quiz object goes back to the frontend, which renders it as interactive questions.", data: '{ quiz: { subject, chapter, questions: [...] } }' },
    ]},
    multi: { label: "A compound request", request: '"Explain chapter 1, then quiz me"', steps: [
      { who: "Browser", c: "#3b82f6", title: "A two-part request", detail: "One message, two jobs. Where a single-prompt chatbot struggles and an agentic system shines.", data: 'POST /api/chat  { message: "Explain chapter 1, then quiz me" }' },
      { who: "Supervisor", c: "#10b981", title: "Decomposes into a plan", detail: "The key agentic moment: the request becomes an ordered list of steps for the graph to execute in turn.", data: 'plan: ["tutor", "quiz"]  ← task decomposition' },
      { who: "Retrieve → Tutor", c: "#10b981", title: "Step 1: explain", detail: "The graph runs the first plan step — retrieve, then tutor — producing a grounded explanation.", data: 'answer: "Mikroorganisma ialah... (Bab 1 > 1.1)"' },
      { who: "Advance", c: "#8b5cf6", title: "Pops the plan, loops back", detail: "The 'advance' node removes the finished step and returns control to routing. One step remains.", data: 'plan: ["quiz"]  ← one step left, loop continues' },
      { who: "Retrieve → Quiz", c: "#10b981", title: "Step 2: quiz", detail: "The second step runs — retrieve again, then generate a validated quiz from the same chapter.", data: 'quiz: { questions: [...] }  ✓ valid' },
      { who: "Browser", c: "#3b82f6", title: "Both results return together", detail: "The final state carries both explanation and quiz. The plan is empty, so the graph ends.", data: '{ answer: "...", quiz: {...}, plan: [] }' },
    ]},
  };

  let cur = "tutor", idx = 0;

  function esc(s) { return s.replace(/</g, "&lt;").replace(/>/g, "&gt;"); }

  function render() {
    const sc = scenarios[cur];
    const tabs = Object.keys(scenarios).map(k =>
      `<button class="dds-tab ${k===cur?'on':''}" data-k="${k}">${scenarios[k].label}</button>`).join("");
    const dots = sc.steps.map((_, i) =>
      `<span class="dds-dot ${i===idx?'on':''} ${i<idx?'done':''}"></span>`).join("");
    const s = sc.steps[idx];
    mount.innerHTML = `
      <div class="dds">
        <div class="dds-tabs">${tabs}</div>
        <div class="dds-req">Simulating: <span>${esc(sc.request)}</span></div>
        <div class="dds-stage">
          <div class="dds-badge" style="--bc:${s.c}">${s.who}</div>
          <div class="dds-title">${s.title}</div>
          <div class="dds-detail">${s.detail}</div>
          <div class="dds-data">${esc(s.data)}</div>
        </div>
        <div class="dds-dots">${dots}</div>
        <div class="dds-nav">
          <button class="dds-btn" id="ddsPrev" ${idx===0?'disabled':''}>← Back</button>
          <span class="dds-count">Step ${idx+1} of ${sc.steps.length}</span>
          <button class="dds-btn primary" id="ddsNext">${idx===sc.steps.length-1?'Restart':'Next →'}</button>
        </div>
      </div>`;
    mount.querySelectorAll(".dds-tab").forEach(b => b.onclick = () => { cur=b.dataset.k; idx=0; render(); });
    document.getElementById("ddsPrev").onclick = () => { if (idx>0){idx--; render();} };
    document.getElementById("ddsNext").onclick = () => { idx = (idx===scenarios[cur].steps.length-1)?0:idx+1; render(); };
  }
  render();
})();
