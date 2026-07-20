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
        <rect x="40" y="226" width="130" height="48" rx="10" class="hiw-box"/>
        <text class="hiw-t" x="105" y="246" text-anchor="middle">verify</text>
        <text class="hiw-s" x="105" y="262" text-anchor="middle">fact-check vs context</text>
        <line x1="145" y1="204" x2="112" y2="224" class="hiw-line" marker-end="url(#ddArrow)"/>
        <path d="M40 244 L24 244 L24 178 L66 178" class="hiw-line" fill="none" stroke-dasharray="4 3" marker-end="url(#ddArrow)"/>
        <line x1="170" y1="256" x2="248" y2="270" class="hiw-line" marker-end="url(#ddArrow)"/>
        <line x1="340" y1="204" x2="340" y2="244" class="hiw-line" marker-end="url(#ddArrow)"/>
        <line x1="535" y1="204" x2="380" y2="244" class="hiw-line" marker-end="url(#ddArrow)"/>
        <rect x="250" y="246" width="180" height="52" rx="10" class="hiw-box hiw-violet"/>
        <text class="hiw-t" x="340" y="268" text-anchor="middle">advance</text>
        <text class="hiw-s" x="340" y="285" text-anchor="middle">next step, or finish</text>
        <path d="M430 272 L620 272 L620 84 L424 84" class="hiw-line" fill="none" stroke-dasharray="4 3" marker-end="url(#ddArrow)"/>
      </svg>
      <p class="dd-cap">The supervisor routes to a worker. Tutor answers pass through "verify" — an unsupported verdict loops back (dashed) for one bounded revision. Every path converges on "advance", which loops for multi-step plans or ends.</p>
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
    <h2>Multimodal input &mdash; photograph a handwritten answer to mark it</h2>
    <p>SPM answers are written by hand on paper. So the student can snap a photo instead of retyping: a <strong>vision model</strong> reads the handwriting, and the existing marker grades the text. The design principle is <em>convert at the boundary</em> &mdash; one node turns pixels into text, and everything downstream (retrieval, marking, verification) runs unchanged because by then it is just text.</p>
    <div class="dd-fig">
      <svg viewBox="0 0 680 250" role="img" aria-label="Image to transcription to marking flow">${AR2}
        <rect x="16" y="40" width="120" height="60" rx="10" class="hiw-box"/>
        <text class="hiw-s" x="76" y="64" text-anchor="middle" style="font-weight:600">photo</text>
        <text class="hiw-s" x="76" y="80" text-anchor="middle">handwritten</text>
        <text class="hiw-s" x="76" y="94" text-anchor="middle">answer</text>
        <line x1="136" y1="70" x2="172" y2="70" class="hiw-line" marker-end="url(#ddArrow2)"/>
        <rect x="174" y="40" width="150" height="60" rx="10" class="hiw-box hiw-violet"/>
        <text class="hiw-t" x="249" y="62" text-anchor="middle">transcribe</text>
        <text class="hiw-s" x="249" y="79" text-anchor="middle">vision model reads it</text>
        <text class="hiw-s" x="249" y="93" text-anchor="middle">pixels &rarr; text</text>
        <line x1="324" y1="70" x2="360" y2="70" class="hiw-line" marker-end="url(#ddArrow2)"/>
        <rect x="362" y="40" width="150" height="60" rx="10" class="hiw-box hiw-accent"/>
        <text class="hiw-s" x="437" y="60" text-anchor="middle" style="font-weight:600">transcription</text>
        <text class="hiw-s" x="437" y="76" text-anchor="middle">shown to student</text>
        <text class="hiw-s" x="437" y="90" text-anchor="middle">to catch a misread</text>
        <line x1="512" y1="70" x2="548" y2="70" class="hiw-line" marker-end="url(#ddArrow2)"/>
        <rect x="550" y="40" width="114" height="60" rx="10" class="hiw-box"/>
        <text class="hiw-t" x="607" y="66" text-anchor="middle">marker</text>
        <text class="hiw-s" x="607" y="82" text-anchor="middle">(unchanged)</text>
        <text class="hiw-mono" x="16" y="150">the whole existing pipeline &mdash; retrieval, marking, verification &mdash; is untouched</text>
        <rect x="174" y="162" width="338" height="48" rx="9" class="hiw-region"/>
        <text class="hiw-s" x="343" y="182" text-anchor="middle">by the time these run, the answer is text &mdash;</text>
        <text class="hiw-s" x="343" y="198" text-anchor="middle">so nothing downstream had to change</text>
      </svg>
      <p class="dd-cap">One transcribe node is the only addition; two-stage (transcribe, then mark) keeps the transcription inspectable and separately testable.</p>
    </div>
    <p>Two engineering details worth noting. First, in the model router <strong>vision is a hard constraint, not a preference</strong>: a text-only model physically cannot read an image, so the router must never fall through to one (and never promotes a plain text request up into a pricier vision model either). Second, it <strong>fails open</strong> end to end &mdash; no image is a no-op, and an oversized or unreadable image, or a vision-model outage, simply proceeds on whatever text was typed rather than erroring. The two-stage split (transcribe, <em>then</em> mark) also means transcription accuracy and marking accuracy can be evaluated separately.</p>
    <p class="dd-src">In the code: <a href="https://github.com/nisakhantalib/bangkit-agentic/blob/master/ai-service/app/graph/nodes.py" target="_blank" rel="noreferrer">app/graph/nodes.py</a> (transcribe_node) &middot; <a href="https://github.com/nisakhantalib/bangkit-agentic/blob/master/ai-service/app/llm/router.py" target="_blank" rel="noreferrer">app/llm/router.py</a> (vision tier) &middot; <a href="https://github.com/nisakhantalib/bangkit-agentic/blob/master/ai-service/tests/test_multimodal.py" target="_blank" rel="noreferrer">tests/test_multimodal.py</a></p>
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
        <text class="hiw-s" x="279" y="158" text-anchor="middle" style="font-weight:600">hybrid search</text>
        <text class="hiw-s" x="279" y="174" text-anchor="middle">meaning + exact terms</text>
        <line x1="364" y1="162" x2="390" y2="162" class="hiw-line" marker-end="url(#ddArrow2)"/>
        <rect x="392" y="138" width="208" height="48" rx="9" class="hiw-box hiw-accent"/>
        <text class="hiw-s" x="496" y="158" text-anchor="middle" style="font-weight:600">6 chunks + source labels</text>
        <text class="hiw-s" x="496" y="174" text-anchor="middle">"Bab 1: Mikroorganisma..."</text>
      </svg>
      <p class="dd-cap">Top row runs when the container image is built; bottom row runs on every question.</p>
    </div>
    <p>Retrieval is <strong>hybrid</strong>: two rankers run on every question and their rankings are fused. <em>Vector search</em> matches by meaning ("tiny living things" finds the mikroorganisma chunk even with zero shared words); <em>BM25 keyword search</em> matches exact terms ("Bab 3", "Teorem Pythagoras", vocabulary copied verbatim from a textbook) that embeddings can under-rank. Each covers the other's blind spot. The two rankings are combined with <strong>Reciprocal Rank Fusion</strong> — a chunk's final score is <code class="dd-code">&Sigma; 1/(60+rank)</code> across both lists — which fuses by <em>position</em>, neatly sidestepping the problem that cosine scores (0&ndash;1) and BM25 scores (unbounded) live on incomparable scales.</p>
    <p>The tutor then gets a strict instruction: <em>answer only from this retrieved context, and cite the section</em>. If retrieval returns nothing relevant, it says so rather than inventing an answer.</p>
    <p>And the answer isn't just trusted — it's <strong>verified</strong>. A separate fact-checking node re-reads the retrieved context and the tutor's answer and returns a structured verdict: supported, or a list of specific unsupported claims. An unsupported verdict sends those exact claims back to the tutor for <em>one</em> revision ("your previous answer claimed X, which the context doesn't support — rewrite using only facts present"). One revision, never more: the loop is bounded by an attempt counter, and if the verifier itself fails, the answer passes through unchanged — verification improves quality, never availability. This is the generate&rarr;verify&rarr;correct pattern from the corrective-RAG literature, implemented as two graph nodes.</p>
    <details class="dd-det"><summary>Deep-dive: structured output with self-healing</summary><div>
      <p>The quiz and marking agents must return machine-readable JSON matching an exact schema (Pydantic models). Raw LLM output is unreliable, so each structured node validates the response — and on failure retries once with the validation errors fed back as a repair prompt. Contract enforced at the boundary, not hoped for.</p>
      <pre class="dd-pre">result, error = <span class="f">_structured</span>(llm, prompt, QuizSpec)
<span class="c"># 1. call LLM   2. validate against QuizSpec</span>
<span class="c"># 3. on failure: retry once with the errors in a repair prompt</span>
<span class="c"># 4. still invalid: degrade gracefully, never crash</span></pre>
    </div></details>
    <p class="dd-src">In the code: <a href="https://github.com/nisakhantalib/bangkit-agentic/blob/master/ai-service/app/rag/ingest.py" target="_blank" rel="noreferrer">ai-service/app/rag/ingest.py</a> &middot; <a href="https://github.com/nisakhantalib/bangkit-agentic/blob/master/ai-service/app/rag/retriever.py" target="_blank" rel="noreferrer">ai-service/app/rag/retriever.py</a> &middot; <a href="https://github.com/nisakhantalib/bangkit-agentic/blob/master/ai-service/app/rag/keyword.py" target="_blank" rel="noreferrer">ai-service/app/rag/keyword.py</a> (BM25) &middot; <a href="https://github.com/nisakhantalib/bangkit-agentic/blob/master/ai-service/app/schemas/quiz.py" target="_blank" rel="noreferrer">ai-service/app/schemas/quiz.py</a></p>
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

// ---- Evaluation, live proof, and skills map (inserted by heading anchors) ----
(function () {
  const GH = "https://github.com/nisakhantalib/bangkit-agentic/blob/master/";
  const secs = [...document.querySelectorAll("#projectDetail .dd")];
  const deploySec = secs.find(s => s.querySelector("h2")?.textContent.includes("shipping it"));
  const bugSec = secs.find(s => s.querySelector(".dd-bugs"));
  if (!deploySec || !bugSec) return;

  // --- Evaluation section: inserted BEFORE the deployment layer ---
  const evalHtml = `
  <section class="detail-section dd">
    <h2>Evaluation &mdash; "TDD for agents"</h2>
    <p>An LLM's output can silently degrade: a prompt tweak that improves tutoring might break marking. So the agents are tested the way UI code is tested &mdash; against fixed expectations, on every push.</p>
    <ul class="dd-list">
      <li><strong>Golden datasets.</strong> Hand-written cases with known-correct outcomes: marking cases (question, student answer, expected score bounds, concepts the feedback must mention) and tutor cases (question, facts the answer must include, citation required). Deliberately small starter sets &mdash; the honest scaling answer is "grow the datasets and track pass rates over time".</li>
      <li><strong>Metric functions.</strong> Each output is scored programmatically: is the awarded mark within the expected bounds? Does feedback surface the required concepts? Is the answer grounded and cited?</li>
      <li><strong>Two run modes.</strong> In CI, the harness runs against a scripted fake model &mdash; fast, free, deterministic &mdash; guarding the metric logic and graph wiring on every push. Locally, the same harness runs against real Groq models for true accuracy numbers.</li>
    </ul>
    <pre class="dd-pre"><span class="c"># evals/metrics.py — marking is judged, not trusted</span>
<span class="k">def</span> <span class="f">marking_within_tolerance</span>(result, case):
    <span class="k">if</span> result[<span class="s">"total_max"</span>] != case[<span class="s">"expected_total_max"</span>]: <span class="k">return</span> <span class="k">False</span>
    awarded = result[<span class="s">"total_awarded"</span>]
    <span class="k">return</span> case[<span class="s">"min"</span>] &lt;= awarded &lt;= case[<span class="s">"max"</span>]

<span class="c"># evals/runner.py — same harness, swappable model</span>
<span class="k">for</span> report <span class="k">in</span> <span class="f">run_all</span>(model_router.complete):
    <span class="f">print</span>(report)   <span class="c"># marking_accuracy: 4/4 · tutor_groundedness: 3/3</span></pre>
    <p class="dd-src">In the code: <a href="${GH}ai-service/evals/metrics.py" target="_blank" rel="noreferrer">ai-service/evals/metrics.py</a> &middot; <a href="${GH}ai-service/evals/runner.py" target="_blank" rel="noreferrer">ai-service/evals/runner.py</a> &middot; <a href="${GH}ai-service/evals/datasets" target="_blank" rel="noreferrer">ai-service/evals/datasets/</a> &middot; <a href="${GH}ai-service/tests/test_evals.py" target="_blank" rel="noreferrer">ai-service/tests/test_evals.py</a></p>
  </section>`;
  deploySec.insertAdjacentHTML("beforebegin", evalHtml);

  // --- Live proof section: inserted AFTER the bug log ---
  const liveHtml = `
  <section class="detail-section dd" id="ddLive">
    <h2>Live deployment &mdash; verify it yourself</h2>
    <p>The service below is the real thing running on Azure Container Apps. It scales to zero when idle, so the first check after a quiet period takes ~20 seconds while the container cold-starts.</p>
    <div class="dd-livebox">
      <div class="dd-liverow">
        <span class="dd-livedot" id="ddLiveDot"></span>
        <span id="ddLiveText">Checking service status&hellip;</span>
        <button class="dds-btn" id="ddLiveBtn" style="margin-left:auto">Check now</button>
      </div>
      <div class="dds-data" id="ddLiveData" style="margin-top:0.7rem; display:none"></div>
    </div>
    <ul class="dd-list" style="margin-top:1rem">
      <li><strong>Live app:</strong> <a href="https://bangkit-agentic.vercel.app" target="_blank" rel="noreferrer">bangkit-agentic.vercel.app</a> &mdash; ask the tutor a question and watch it answer with a citation.</li>
      <li><strong>Health endpoint:</strong> <a href="https://bangkit-ai-service.proudstone-816d3797.southeastasia.azurecontainerapps.io/health" target="_blank" rel="noreferrer">/health</a> &mdash; the raw service response, straight from Azure.</li>
      <li><strong>Pipeline:</strong> <a href="https://github.com/nisakhantalib/bangkit-agentic/actions" target="_blank" rel="noreferrer">GitHub Actions</a> &mdash; every merge to master tests, builds, and deploys automatically.</li>
    </ul>
    <div class="dd-shots">
      <figure><img src="shots/azure-containerapp.png" alt="Azure Container App overview" loading="lazy" onerror="this.closest('figure').remove()"/><figcaption>Azure Container App: revisions, scaling, and the deployed image</figcaption></figure>
      <figure><img src="shots/azure-deploy-run.png" alt="GitHub Actions deploy run" loading="lazy" onerror="this.closest('figure').remove()"/><figcaption>A green deploy run: OIDC login &rarr; build &rarr; push &rarr; rollout</figcaption></figure>
      <figure><img src="shots/bangkit-demo.gif" alt="Live demo of the tutor answering with a citation" loading="lazy" onerror="this.closest('figure').remove()"/><figcaption>The tutor answering with a curriculum citation, live</figcaption></figure>
    </div>
  </section>

  <section class="detail-section dd">
    <h2>Choosing the orchestration pattern &mdash; and why</h2>
    <p>There are four established loop shapes for agentic systems. I studied all four hands-on (LangGraph, reflection, Reflexion, and ReAct labs) and chose deliberately. The differences come down to one question: <strong>who decides the next step, and when?</strong></p>
    <div class="dd-fig">
      <svg viewBox="0 0 880 240" role="img" aria-label="Four agentic orchestration patterns compared">
        <defs><marker id="opArr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M2 1L8 5L2 9" fill="none" stroke="currentColor" stroke-width="1.5"/></marker></defs>
        <g class="hiw-mono">
          <rect x="10" y="16" width="200" height="200" rx="12" class="hiw-region"/>
          <text x="110" y="40" text-anchor="middle" style="font-weight:700">plan-and-execute</text>
          <text x="110" y="56" text-anchor="middle" class="hiw-s">(this project)</text>
          <rect x="40" y="70" width="140" height="34" rx="8" class="hiw-box hiw-accent"/><text x="110" y="91" text-anchor="middle" class="hiw-s">plan once</text>
          <rect x="40" y="120" width="140" height="34" rx="8" class="hiw-box"/><text x="110" y="141" text-anchor="middle" class="hiw-s">execute steps</text>
          <line x1="110" y1="104" x2="110" y2="118" class="hiw-line" marker-end="url(#opArr)"/>
          <path d="M180 137 C 205 137 205 87 180 87" class="hiw-line" fill="none" stroke-dasharray="3 3"/>
          <text x="110" y="185" text-anchor="middle" class="hiw-s">steps fixed upfront</text>
          <text x="110" y="201" text-anchor="middle" class="hiw-s">by the supervisor</text>

          <rect x="230" y="16" width="200" height="200" rx="12" class="hiw-region"/>
          <text x="330" y="40" text-anchor="middle" style="font-weight:700">ReAct</text>
          <text x="330" y="56" text-anchor="middle" class="hiw-s">(studied)</text>
          <rect x="260" y="70" width="140" height="34" rx="8" class="hiw-box"/><text x="330" y="91" text-anchor="middle" class="hiw-s">model reasons</text>
          <rect x="260" y="120" width="140" height="34" rx="8" class="hiw-box"/><text x="330" y="141" text-anchor="middle" class="hiw-s">calls a tool</text>
          <line x1="330" y1="104" x2="330" y2="118" class="hiw-line" marker-end="url(#opArr)"/>
          <path d="M400 137 C 425 137 425 87 400 87" class="hiw-line" fill="none" marker-end="url(#opArr)"/>
          <text x="330" y="185" text-anchor="middle" class="hiw-s">model decides every</text>
          <text x="330" y="201" text-anchor="middle" class="hiw-s">step, stops itself</text>

          <rect x="450" y="16" width="200" height="200" rx="12" class="hiw-region"/>
          <text x="550" y="40" text-anchor="middle" style="font-weight:700">reflection</text>
          <text x="550" y="56" text-anchor="middle" class="hiw-s">(studied)</text>
          <rect x="480" y="70" width="140" height="34" rx="8" class="hiw-box"/><text x="550" y="91" text-anchor="middle" class="hiw-s">generate</text>
          <rect x="480" y="120" width="140" height="34" rx="8" class="hiw-box"/><text x="550" y="141" text-anchor="middle" class="hiw-s">critique</text>
          <line x1="550" y1="104" x2="550" y2="118" class="hiw-line" marker-end="url(#opArr)"/>
          <path d="M620 137 C 645 137 645 87 620 87" class="hiw-line" fill="none" marker-end="url(#opArr)"/>
          <text x="550" y="185" text-anchor="middle" class="hiw-s">loop until quality</text>
          <text x="550" y="201" text-anchor="middle" class="hiw-s">gate / max iterations</text>

          <rect x="670" y="16" width="200" height="200" rx="12" class="hiw-region"/>
          <text x="770" y="40" text-anchor="middle" style="font-weight:700">Reflexion</text>
          <text x="770" y="56" text-anchor="middle" class="hiw-s">(studied)</text>
          <rect x="700" y="64" width="140" height="30" rx="8" class="hiw-box"/><text x="770" y="83" text-anchor="middle" class="hiw-s">generate + critique</text>
          <rect x="700" y="104" width="140" height="30" rx="8" class="hiw-box hiw-violet"/><text x="770" y="123" text-anchor="middle" class="hiw-s">critique &rarr; new search</text>
          <rect x="700" y="144" width="140" height="30" rx="8" class="hiw-box"/><text x="770" y="163" text-anchor="middle" class="hiw-s">revise + cite</text>
          <line x1="770" y1="94" x2="770" y2="102" class="hiw-line" marker-end="url(#opArr)"/>
          <line x1="770" y1="134" x2="770" y2="142" class="hiw-line" marker-end="url(#opArr)"/>
          <path d="M840 159 C 866 159 866 79 840 79" class="hiw-line" fill="none" marker-end="url(#opArr)"/>
          <text x="770" y="196" text-anchor="middle" class="hiw-s">critique drives fresh</text>
          <text x="770" y="212" text-anchor="middle" class="hiw-s">retrieval each round</text>
        </g>
      </svg>
      <p class="dd-cap">Same building blocks (nodes, edges, conditional routing) &mdash; four different answers to "who decides the next step".</p>
    </div>
    <p><strong>Why plan-and-execute here:</strong> a tutoring service has enumerable intents (tutor / quiz / mark) and real latency and cost budgets. Planning once &mdash; the supervisor decomposes the request into an ordered plan, then the graph executes it &mdash; means a predictable number of LLM calls per request, deterministic routing that 60+ tests can pin down, and evals that don't have to reason about open-ended loops. ReAct's model-decides-every-step loop earns its extra cost when the steps <em>can't</em> be enumerated upfront (open-ended research, general assistants) &mdash; which this product isn't.</p>
    <p><strong>Where the studied patterns did shape this codebase:</strong> the verification node is the corrective-RAG idea from the reflection family, deliberately bounded to a single revision (availability beats perfection in a service); studying a reference multi-agent RAG architecture (DocChat) is what surfaced the hybrid-retrieval and verification gaps that became Milestone 8. And the honest line: full Reflexion &mdash; critique <em>generating new retrieval queries</em> across multiple rounds with accumulated history &mdash; is studied but not shipped; the natural home for it would be iteratively refining generated quiz questions.</p>
    <p class="dd-src">In the code: <a href="https://github.com/nisakhantalib/bangkit-agentic/blob/master/ai-service/app/graph/supervisor.py" target="_blank" rel="noreferrer">supervisor.py</a> (plan-and-execute) &middot; <a href="https://github.com/nisakhantalib/bangkit-agentic/blob/master/ai-service/app/graph/build.py" target="_blank" rel="noreferrer">build.py</a> (the loop) &middot; <a href="https://github.com/nisakhantalib/bangkit-agentic/blob/master/ai-service/app/graph/nodes.py" target="_blank" rel="noreferrer">nodes.py</a> (bounded verification)</p>
    <p class="dd-src">Full write-up: <a href="agentic-study-notes.html" target="_blank" rel="noreferrer">Agentic AI study reference &mdash; all five materials, code + mappings &rarr;</a></p>
    <details class="dd-det"><summary>Study notes: the five materials, with code (collapsed appendix)</summary><div>
      <p style="font-size:0.85rem"><em>Condensed notes from the hands-on labs behind the comparison above (LangGraph, reflection, Reflexion, ReAct, and a reference multi-agent RAG build). Code shown is from the lab materials; the "in this repo" lines are where each idea lives here.</em></p>

      <h4 style="margin:1rem 0 0.3rem">1 &middot; LangGraph mechanics</h4>
      <p style="font-size:0.85rem">Four primitives: a TypedDict <strong>state</strong> flowing through the graph, <strong>nodes</strong> (state in, changes out), fixed <strong>edges</strong>, and <strong>routers</strong> returning the next node's name.</p>
      <pre class="dd-pre"><span class="k">def</span> <span class="f">router</span>(state):
    <span class="k">if</span> state[<span class="s">'is_authenticated'</span>]: <span class="k">return</span> <span class="s">"success_node"</span>
    <span class="k">return</span> <span class="s">"failure_node"</span>

workflow.add_conditional_edges(<span class="s">"ValidateCredential"</span>, router, {...})
app = workflow.compile()</pre>
      <p class="dd-src">In this repo: state.py, build.py, _dispatch() &mdash; same contract, plus dependency injection the labs don't teach.</p>

      <h4 style="margin:1rem 0 0.3rem">2 &middot; Reflection: generate &rarr; critique &rarr; loop</h4>
      <p style="font-size:0.85rem">Two roles alternate over a message list; the critique returns <em>as a HumanMessage</em> so the generator experiences it as a user asking for changes. Weakness: stopping on a magic message count.</p>
      <pre class="dd-pre"><span class="k">def</span> <span class="f">reflection_node</span>(messages):
    res = reflect_chain.invoke({<span class="s">"messages"</span>: messages})
    <span class="k">return</span> [HumanMessage(content=res.content)]  <span class="c"># critique disguised as user</span>

<span class="k">def</span> <span class="f">should_continue</span>(state):
    <span class="k">if</span> len(state) > 6: <span class="k">return</span> END   <span class="c"># magic number — the weakness</span>
    <span class="k">return</span> <span class="s">"reflect"</span></pre>
      <p class="dd-src">In this repo: the family idea became verify_node &mdash; structured verdict, bounded to one revision.</p>

      <h4 style="margin:1rem 0 0.3rem">3 &middot; Reflexion: critique drives new retrieval</h4>
      <p style="font-size:0.85rem">Two upgrades: the critique is schema-forced and must name <em>search queries</em> (what to go fetch), and stopping counts real tool calls instead of messages. A revisor then rewrites with mandatory references.</p>
      <pre class="dd-pre"><span class="k">class</span> <span class="f">AnswerQuestion</span>(BaseModel):
    answer: str
    reflection: Reflection          <span class="c"># {missing, superfluous}</span>
    search_queries: List[str]       <span class="c"># critique DRIVES retrieval</span>

<span class="k">def</span> <span class="f">event_loop</span>(state):
    n = sum(isinstance(m, ToolMessage) <span class="k">for</span> m <span class="k">in</span> state)
    <span class="k">return</span> END <span class="k">if</span> n >= MAX_ITERATIONS <span class="k">else</span> <span class="s">"execute_tools"</span></pre>
      <p class="dd-src">In this repo: studied, not shipped &mdash; natural home would be iterative quiz refinement against the vector store.</p>

      <h4 style="margin:1rem 0 0.3rem">4 &middot; ReAct: the model decides every step</h4>
      <p style="font-size:0.85rem">A two-node cycle, agent &harr; tools. The model ends its own loop by simply not asking for a tool. Any docstringed function becomes a capability.</p>
      <pre class="dd-pre"><span class="k">def</span> <span class="f">should_continue</span>(state):
    <span class="k">if not</span> state[<span class="s">"messages"</span>][-1].tool_calls: <span class="k">return</span> <span class="s">"end"</span>
    <span class="k">return</span> <span class="s">"continue"</span>

workflow.add_edge(<span class="s">"tools"</span>, <span class="s">"agent"</span>)   <span class="c"># tools always return to agent</span></pre>
      <p class="dd-src">In this repo: deliberately not the core architecture (see above); the scoped use-case is a calculator tool inside marking.</p>

      <h4 style="margin:1rem 0 0.3rem">5 &middot; Reference multi-agent RAG (DocChat)</h4>
      <p style="font-size:0.85rem">Three keepers: a relevance gate before generation (CAN_ANSWER / PARTIAL / NO_MATCH), hybrid BM25+vector retrieval, and a verification agent whose failing verdict routes back to re-research.</p>
      <pre class="dd-pre"><span class="k">def</span> <span class="f">_decide_next_step</span>(self, state):
    <span class="k">if</span> <span class="s">"Supported: NO"</span> <span class="k">in</span> state[<span class="s">"verification_report"</span>]:
        <span class="k">return</span> <span class="s">"re_research"</span>
    <span class="k">return</span> <span class="s">"end"</span></pre>
      <p class="dd-src">In this repo: the study that produced Milestone 8 &mdash; hybrid retrieval (keyword.py + RRF) and verify_node. The relevance gate remains unimplemented.</p>
      <p class="dd-src" style="margin-top:0.8rem">Full version with complete code and comparison table: <a href="agentic-study-notes.html" target="_blank" rel="noreferrer">open the study reference &rarr;</a></p>
    </div></details>
  </section>

  <section class="detail-section dd">
    <h2>Skills demonstrated &mdash; mapped to the code</h2>
    <p>Each core junior AI-engineering competency, tied to the file that implements it in this repo. And, honestly stated, what this project does <em>not</em> cover.</p>
    <div class="dd-skillgrid">
      <div class="dd-skill"><h4>LLM API integration</h4><p>Multi-model router with fallback + exponential-backoff cooldown across Groq-hosted Llama models.</p><a href="${GH}ai-service/app/llm/router.py" target="_blank" rel="noreferrer">app/llm/router.py</a></div>
      <div class="dd-skill"><h4>Prompt engineering</h4><p>Role-scoped system prompts: grounding constraints, citation requirements, JSON-only contracts, repair prompts.</p><a href="${GH}ai-service/app/graph/nodes.py" target="_blank" rel="noreferrer">app/graph/nodes.py</a></div>
      <div class="dd-skill"><h4>Hybrid RAG</h4><p>Markdown-aware chunking; BM25 keyword + vector retrieval fused by reciprocal rank (RRF), metadata-filtered, with graceful filter relaxation.</p><a href="${GH}ai-service/app/rag" target="_blank" rel="noreferrer">app/rag/</a></div>
      <div class="dd-skill"><h4>Agent orchestration</h4><p>LangGraph supervisor: intent classification, task decomposition into plans, conditional routing, execution loop.</p><a href="${GH}ai-service/app/graph" target="_blank" rel="noreferrer">app/graph/</a></div>
      <div class="dd-skill"><h4>Answer verification</h4><p>Fact-checking node judges tutor answers against retrieved context; unsupported claims drive one bounded self-correction. Fails open.</p><a href="${GH}ai-service/app/graph/nodes.py" target="_blank" rel="noreferrer">app/graph/nodes.py</a></div>
      <div class="dd-skill"><h4>Adaptive output</h4><p>Presenter agent emits schema-validated render instructions - Mermaid diagram, table, or slides - when a visual aids the answer. Cost-gated, fails open to text.</p><a href="${GH}ai-service/app/schemas/visual.py" target="_blank" rel="noreferrer">app/schemas/visual.py</a></div>
      <div class="dd-skill"><h4>Multimodal (vision)</h4><p>A photographed handwritten answer is transcribed by a vision model (hard-constrained routing) then marked by the existing pipeline. Two-stage, fails open.</p><a href="${GH}ai-service/app/graph/nodes.py" target="_blank" rel="noreferrer">app/graph/nodes.py</a></div>
      <div class="dd-skill"><h4>Structured output</h4><p>Pydantic-validated agent responses with a one-shot self-repair retry before graceful degradation.</p><a href="${GH}ai-service/app/schemas/quiz.py" target="_blank" rel="noreferrer">app/schemas/quiz.py</a></div>
      <div class="dd-skill"><h4>LLM evaluation</h4><p>Golden datasets + metric functions; CI smoke against a scripted model, real-model runs locally; optional LangSmith tracing.</p><a href="${GH}ai-service/evals" target="_blank" rel="noreferrer">evals/</a></div>
      <div class="dd-skill"><h4>Testing</h4><p>31 pytest tests: unit, graph integration with fakes, API-level, auth behaviour, and regression tests pinning fixed bugs.</p><a href="${GH}ai-service/tests" target="_blank" rel="noreferrer">tests/</a></div>
      <div class="dd-skill"><h4>Deployment / AI infra</h4><p>Multi-stage Docker, GitHub Actions CI/CD with OIDC (no stored cloud secrets), Azure Container Apps with scale-to-zero.</p><a href="${GH}.github/workflows/deploy.yml" target="_blank" rel="noreferrer">deploy.yml</a> &middot; <a href="${GH}ai-service/Dockerfile" target="_blank" rel="noreferrer">Dockerfile</a></div>
      <div class="dd-skill"><h4>Security</h4><p>Server-side secret handling, API-key auth on /v1 routes, CORS allow-listing, secrets in Azure's encrypted store.</p><a href="${GH}ai-service/app/security.py" target="_blank" rel="noreferrer">app/security.py</a></div>
    </div>
    <p class="dd-notcovered"><strong>Not covered by this project</strong> (stated plainly rather than implied): model fine-tuning and <em>audio</em> input. Vision input is covered (photographed handwritten answers are transcribed and marked); speech is the same boundary-conversion pattern and would be the natural next addition. Classical model training &mdash; BERT and Bi-LSTM in PyTorch &mdash; is demonstrated separately in the <a href="project.html?id=evidence">Evidence Detection</a> project.</p>
  </section>`;
  bugSec.insertAdjacentHTML("afterend", liveHtml);

  // --- Live status widget logic ---
  const HEALTH = "https://bangkit-ai-service.proudstone-816d3797.southeastasia.azurecontainerapps.io/health";
  const dot = document.getElementById("ddLiveDot");
  const txt = document.getElementById("ddLiveText");
  const dataEl = document.getElementById("ddLiveData");
  const btn = document.getElementById("ddLiveBtn");

  async function check() {
    dot.className = "dd-livedot wait"; txt.textContent = "Contacting the service (cold start can take ~20s)…";
    dataEl.style.display = "none"; btn.disabled = true;
    try {
      const ctrl = new AbortController();
      const timer = setTimeout(() => ctrl.abort(), 45000);
      const res = await fetch(HEALTH, { signal: ctrl.signal });
      clearTimeout(timer);
      const body = await res.json();
      dot.className = "dd-livedot ok";
      txt.textContent = "Service is live on Azure — responding right now.";
      dataEl.textContent = "GET /health → " + JSON.stringify(body);
      dataEl.style.display = "block";
    } catch (e) {
      dot.className = "dd-livedot err";
      txt.textContent = "Couldn't reach the service from this page (it may be scaled to zero, or the browser blocked the cross-origin call). The /health link above works directly.";
    }
    btn.disabled = false;
  }
  btn.addEventListener("click", check);
  check();
})();
