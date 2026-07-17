window.portfolioProjects = {
  bangkit: {
    title: "Bangkit - Multi-Agent AI Learning Platform",
    owner: "Khairunnisa Khan",
    date: "2026",
    type: "Full-Stack GenAI / Agentic System",
    artClass: "bangkit-art",
    tags: [["LangGraph", "violet"], ["Python", "blue"], ["FastAPI", "green"], ["RAG", "gold"], ["Next.js", "cyan"], ["Docker", "red"]],
    screenshot: "shots/alphaplus.jpg",
    summary:
      "A full-stack exam-prep platform for Malaysian SPM students, re-architected around a Python multi-agent service (LangGraph + FastAPI) that plans and executes tutoring, quiz-generation, and marking over a RAG-grounded curriculum.",
    introTitle: "Bangkit - Multi-Agent AI Learning Platform",
    overview:
      "A full-stack learning platform for Malaysian SPM students, evolved from a Next.js app that called LLM APIs directly into a genuine multi-agent system. A Python service (FastAPI + LangGraph) hosts a supervisor agent that classifies intent, extracts subject/chapter scope, and decomposes multi-step requests into an ordered plan, then routes to tutor, quiz-generation, and marking agents - each grounded in a RAG pipeline over curriculum content and digitized SPM past papers. The Next.js frontend remains, now delegating AI work to the service via an opt-in, fall-back-safe integration.",
    features: [
      ["Multi-agent orchestration (LangGraph)", "A supervisor agent performs intent classification, scope extraction, and task decomposition - turning a compound request such as 'revise Chapter 1 then quiz me' into an ordered plan that the graph executes step by step, looping through retrieve -> agent for each step."],
      ["RAG over curriculum + past papers", "Built an ingestion pipeline (markdown-aware chunking, embedding-based retrieval, metadata-filtered vector store) so the tutor answers strictly from retrieved content and cites the exact chapter and section, with digitized SPM papers and marking schemes as a separate collection."],
      ["Schema-validated structured output", "Quiz-generation and marking agents validate every response against Pydantic contracts and self-heal with a repair prompt on failure - replacing brittle JSON parsing with an enforced contract at the boundary."],
      ["Resilient LLM layer", "A Python model router provides multi-model fallback with exponential-backoff cooldown across Groq-hosted models, assigning a fast cheap model to routing and a larger model to tutoring and marking."],
      ["Evaluation harness ('TDD for agents')", "Golden datasets and metrics measure marking accuracy and answer groundedness, running in CI against a scripted model and against real models locally, with optional LangSmith tracing - applying test-automation discipline to LLM behaviour."],
      ["Containerized and CI/CD-ready", "Multi-stage Docker build, GitHub Actions CI (lint, tests, eval smoke, image build), API-key auth and CORS for server-to-server use, and a cloud deploy pipeline (Azure Container Apps / AWS App Runner - the same image runs on either)."]
    ],
    stack: [["AI service", "Python, FastAPI, LangGraph, Pydantic"], ["RAG", "Embedding-based retrieval, metadata-filtered vector store, source citations, LangSmith tracing"], ["LLM", "Groq SDK (Llama 3.3 70B), multi-model fallback router"], ["Frontend", "Next.js (App Router), React, Tailwind CSS"], ["Infra", "Docker, GitHub Actions CI/CD, Azure Container Apps (live), ACR"]],
    howItWorks: {
      intro:
        "The simplest way to picture it: a student walks into a tutoring center. A receptionist figures out what kind of help they need and sends them to the right specialist - one explains concepts, one writes practice quizzes, one grades answers. Crucially, before answering, the specialist pulls the actual textbook page and answers from that, telling you which page they used. That is exactly this system: the receptionist is the \"supervisor\", the specialists are the \"agents\", the textbook is a searchable \"vector store\", and \"which page\" is the citation.",
      diagram: `<svg class="hiw-diagram" viewBox="0 0 640 560" role="img" aria-label="How a student question flows through the system">
  <defs><marker id="hiwArrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto"><path d="M2 1L8 5L2 9" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></marker></defs>
  <g font-family="Inter, sans-serif">
    <rect x="230" y="16" width="180" height="50" rx="10" class="hiw-box hiw-neutral"/>
    <text x="320" y="38" text-anchor="middle" class="hiw-t">1. Student asks</text>
    <text x="320" y="55" text-anchor="middle" class="hiw-s">in the browser</text>
    <line x1="320" y1="66" x2="320" y2="92" class="hiw-line" marker-end="url(#hiwArrow)"/>

    <rect x="210" y="96" width="220" height="50" rx="10" class="hiw-box hiw-blue"/>
    <text x="320" y="118" text-anchor="middle" class="hiw-t">2. Frontend (Vercel)</text>
    <text x="320" y="135" text-anchor="middle" class="hiw-s">Next.js forwards the question</text>
    <line x1="320" y1="146" x2="320" y2="172" class="hiw-line" marker-end="url(#hiwArrow)"/>

    <rect x="40" y="176" width="560" height="300" rx="16" class="hiw-region"/>
    <text x="320" y="200" text-anchor="middle" class="hiw-region-label">3. Agent service (Python, on Azure)</text>

    <rect x="220" y="216" width="200" height="50" rx="10" class="hiw-box hiw-accent"/>
    <text x="320" y="238" text-anchor="middle" class="hiw-t">Supervisor</text>
    <text x="320" y="255" text-anchor="middle" class="hiw-s">reads it, makes a plan</text>

    <line x1="270" y1="266" x2="165" y2="312" class="hiw-line" marker-end="url(#hiwArrow)"/>
    <line x1="320" y1="266" x2="320" y2="312" class="hiw-line" marker-end="url(#hiwArrow)"/>
    <line x1="370" y1="266" x2="475" y2="312" class="hiw-line" marker-end="url(#hiwArrow)"/>

    <rect x="70" y="316" width="150" height="50" rx="10" class="hiw-box hiw-accent"/>
    <text x="145" y="338" text-anchor="middle" class="hiw-t">Tutor</text>
    <text x="145" y="355" text-anchor="middle" class="hiw-s">explains</text>

    <rect x="245" y="316" width="150" height="50" rx="10" class="hiw-box hiw-accent"/>
    <text x="320" y="338" text-anchor="middle" class="hiw-t">Quiz maker</text>
    <text x="320" y="355" text-anchor="middle" class="hiw-s">sets questions</text>

    <rect x="420" y="316" width="150" height="50" rx="10" class="hiw-box hiw-accent"/>
    <text x="495" y="338" text-anchor="middle" class="hiw-t">Marker</text>
    <text x="495" y="355" text-anchor="middle" class="hiw-s">grades answers</text>

    <line x1="145" y1="366" x2="270" y2="410" class="hiw-line" marker-end="url(#hiwArrow)"/>
    <line x1="320" y1="366" x2="320" y2="410" class="hiw-line" marker-end="url(#hiwArrow)"/>
    <line x1="495" y1="366" x2="370" y2="410" class="hiw-line" marker-end="url(#hiwArrow)"/>

    <rect x="210" y="414" width="220" height="50" rx="10" class="hiw-box hiw-amber"/>
    <text x="320" y="436" text-anchor="middle" class="hiw-t">Curriculum library</text>
    <text x="320" y="453" text-anchor="middle" class="hiw-s">finds the real lesson text</text>

    <line x1="320" y1="476" x2="320" y2="502" class="hiw-line" marker-end="url(#hiwArrow)"/>

    <rect x="205" y="506" width="230" height="50" rx="10" class="hiw-box hiw-green"/>
    <text x="320" y="528" text-anchor="middle" class="hiw-t">4. Grounded answer</text>
    <text x="320" y="545" text-anchor="middle" class="hiw-s">with a citation, back to student</text>
  </g>
</svg>`,
      explainerUrl: "bangkit-explainer.html",
      steps: [
        ["Student asks", "A question is typed in the browser on the live site."],
        ["Frontend forwards it", "The Next.js app on Vercel passes the question to the AI service - it does not answer itself."],
        ["Supervisor plans", "The Python agent service (running on Azure) reads the question, works out the intent, and routes it to the right agent - tutor, quiz maker, or marker."],
        ["Agent retrieves real content", "Before answering, the agent searches the curriculum library for the actual matching lesson text, so nothing is made up."],
        ["Grounded answer returns", "The answer comes back with a citation to the exact chapter and section, all the way back to the student."]
      ]
    },
    github: "https://github.com/nisakhantalib/bangkit-agentic",
    demo: "https://bangkit-agentic.vercel.app/"
  },
  paws: {
    title: "Paws Preferences",
    owner: "Khairunnisa Khan",
    date: "2024",
    type: "Interactive Web Application",
    artClass: "paw-art",
    tags: [["React", "blue"], ["Tailwind CSS", "cyan"], ["API", "gold"]],
    screenshot: "shots/paws.jpg",
    summary:
      "An interactive web application that lets users browse random cat photos through a swipe-based interface.",
    introTitle: "Paws Preferences",
    overview:
      "An interactive React web application that allows users to browse random cat photos through a swipe-based interface. The project focuses on playful interaction design, responsive layouts, and clean frontend implementation.",
    features: [
      ["Swipe-based browsing", "Created a simple interaction model for moving through cat photos in a more engaging way than a static gallery."],
      ["Dynamic image loading", "Fetched changing cat images from an external source and handled updates in the interface."],
      ["Responsive interface", "Built the page with React and Tailwind CSS so the experience works smoothly across screen sizes."],
      ["Lightweight user flow", "Kept the app focused and easy to use with a direct browse-and-react experience."]
    ],
    stack: [["Frontend", "React, Tailwind CSS"], ["Data", "Random cat photo API"], ["Deployment", "GitHub Pages"]],
    github: "https://github.com/nisakhantalib/pawpreference",
    demo: "https://nisakhantalib.github.io/pawpreference"
  },
  maqis: {
    title: "MAQIS Admin Portal",
    owner: "Khairunnisa Khan",
    date: "2025",
    type: "Frontend Developer Work",
    artClass: "maqis-art",
    tags: [["Next.js", "blue"], ["React", "green"], ["TypeScript", "violet"], ["Tailwind CSS", "cyan"], ["Recharts", "red"]],
    screenshot: "shots/maqis.jpg",
    summary:
      "A full-stack admin portal prototype for the MAQIS Digital Platform, built with a modern dashboard interface and reporting components.",
    introTitle: "MAQIS Digital Platform Admin Portal",
    overview:
      "A full-stack admin portal prototype for the MAQIS Digital Platform, developed using a modern frontend stack for dashboard views, reporting components, and operational workflows.",
    features: [
      ["Dashboard interface", "Built a functional admin-facing prototype with structured screens for platform management."],
      ["Reporting components", "Used Recharts to support data visualization and clearer operational insights."],
      ["Tender support", "Contributed to technical documentation and compliance materials for a government tender submission."],
      ["Modern frontend stack", "Implemented the interface using Next.js, React, TypeScript, and Tailwind CSS."]
    ],
    stack: [["Frontend", "Next.js, React, TypeScript, Tailwind CSS"], ["Visualization", "Recharts"], ["Deployment", "Vercel"]],
    demo: "https://maqis-admin.vercel.app/"
  },
  testing: {
    title: "SetupHub E-commerce Test Automation",
    owner: "Khairunnisa Khan",
    date: "2025",
    type: "Quality Engineering Project",
    artClass: "testing-art",
    tags: [["Playwright", "blue"], ["Node.js", "green"], ["GitHub Actions", "gold"], ["Accessibility", "red"]],
    summary:
      "Built an automated test suite for a Node and Express e-commerce app, covering UI, API, regression, accessibility, and mocked failure scenarios.",
    introTitle: "SetupHub E-commerce Test Automation",
    overview:
      "A Playwright automation suite for a Node and Express e-commerce application, covering core user flows, API checks, regression scenarios, accessibility checks, and mocked network failures.",
    features: [
      ["UI flow coverage", "Automated key e-commerce journeys to verify that users can browse, interact, and complete expected flows."],
      ["API validation", "Added tests for backend behavior so the suite checks more than just visual page interactions."],
      ["Regression scenarios", "Covered repeated checks for important flows to catch changes that could break existing behavior."],
      ["Accessibility checks", "Included accessibility-oriented checks to improve confidence in the usability of the app."],
      ["CI reporting", "Integrated GitHub Actions and Playwright HTML reporting for repeatable test runs and clearer debugging."]
    ],
    stack: [["Testing", "Playwright"], ["Application", "Node.js, Express"], ["Automation", "GitHub Actions, Playwright HTML reports"]],
    github: "https://github.com/nisakhantalib/testing"
  },
  nlp: {
    title: "Evidence Detection with NLP",
    owner: "Khairunnisa Khan",
    date: "2024",
    type: "Machine Learning Coursework",
    artClass: "nlp-art",
    tags: [["Python", "blue"], ["BERT", "violet"], ["Bi-LSTM", "green"], ["PyTorch", "red"]],
    summary:
      "Trained and evaluated Bi-LSTM and BERT models for evidence detection, achieving strong model performance on the evaluated dataset.",
    introTitle: "Evidence Detection with Bi-LSTM and BERT",
    overview:
      "A natural language processing project that trained and evaluated Bi-LSTM and BERT models for evidence detection, achieving strong performance on the evaluated dataset.",
    features: [
      ["Model comparison", "Compared Bi-LSTM and BERT approaches to understand performance differences across NLP architectures."],
      ["Text preprocessing", "Prepared text data for model training and evaluation using a repeatable workflow."],
      ["Evaluation", "Measured model performance and used the results to compare the effectiveness of both approaches."],
      ["NLP focus", "Explored evidence detection as a practical natural language understanding problem."]
    ],
    stack: [["Language", "Python"], ["Models", "Bi-LSTM, BERT"], ["ML tools", "PyTorch, NLP preprocessing tools"]],
    github: "https://github.com/nisakhantalib/evidence_detection"
  },
  database: {
    title: "Database Design",
    owner: "Khairunnisa Khan",
    date: "2024",
    type: "Database Coursework",
    artClass: "database-art",
    tags: [["SQL", "blue"], ["Oracle DBMS", "green"], ["Schema Design", "gold"]],
    summary:
      "Applied conceptual design methodologies, relational modelling, normalization, and SQL querying using Oracle DBMS.",
    introTitle: "Database Design and SQL Querying",
    overview:
      "A database coursework project focused on conceptual design methodologies, relational modelling, normalization, and SQL querying using Oracle DBMS.",
    features: [
      ["Conceptual design", "Applied database design methods to move from requirements into structured data models."],
      ["Relational modelling", "Designed relational schemas and considered how entities, relationships, and constraints should be represented."],
      ["Normalization", "Normalized schemas to reduce redundancy and improve data integrity."],
      ["SQL querying", "Used SQL in Oracle DBMS to retrieve, filter, and work with structured data."]
    ],
    stack: [["Database", "Oracle DBMS"], ["Query language", "SQL"], ["Design", "Relational model, normalization, schema design"]],
    github: "https://github.com/nisakhantalib/database_system"
  }
};

window.projectOrder = ["bangkit", "maqis", "testing", "paws", "nlp", "database"];

window.renderProjectArt = function renderProjectArt(project) {
  const art = {
    "bangkit-art": '<span class="bk-node one"></span><span class="bk-node two"></span><span class="bk-node three"></span><span class="bk-spark"></span>',
    "paw-art": '<span class="paw-circle">Paws</span><span class="swipe-card left-card"></span><span class="swipe-card right-card"></span>',
    "maqis-art": '<span class="dashboard-bar"></span><span class="dashboard-panel"></span><span class="dashboard-chart"></span>',
    "testing-art": '<span class="test-window"></span><span class="test-check one"></span><span class="test-check two"></span><span class="test-check three"></span>',
    "nlp-art": '<span class="nlp-node large"></span><span class="nlp-node medium"></span><span class="nlp-node small"></span><span class="nlp-line"></span>',
    "database-art": '<span class="db-cylinder top"></span><span class="db-cylinder middle"></span><span class="db-cylinder bottom"></span>'
  };

  return `<div class="project-art ${project.artClass}" aria-hidden="true">${art[project.artClass]}</div>`;
};
