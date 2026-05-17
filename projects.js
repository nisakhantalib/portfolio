window.portfolioProjects = {
  paws: {
    title: "Paws Preferences",
    owner: "Khairunnisa Khan",
    date: "2024",
    type: "Interactive Web Application",
    artClass: "paw-art",
    tags: [["React", "blue"], ["Tailwind CSS", "cyan"], ["API", "gold"]],
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

window.projectOrder = ["paws", "maqis", "testing", "nlp", "database"];

window.renderProjectArt = function renderProjectArt(project) {
  const art = {
    "paw-art": '<span class="paw-circle">Paws</span><span class="swipe-card left-card"></span><span class="swipe-card right-card"></span>',
    "maqis-art": '<span class="dashboard-bar"></span><span class="dashboard-panel"></span><span class="dashboard-chart"></span>',
    "testing-art": '<span class="test-window"></span><span class="test-check one"></span><span class="test-check two"></span><span class="test-check three"></span>',
    "nlp-art": '<span class="nlp-node large"></span><span class="nlp-node medium"></span><span class="nlp-node small"></span><span class="nlp-line"></span>',
    "database-art": '<span class="db-cylinder top"></span><span class="db-cylinder middle"></span><span class="db-cylinder bottom"></span>'
  };

  return `<div class="project-art ${project.artClass}" aria-hidden="true">${art[project.artClass]}</div>`;
};
