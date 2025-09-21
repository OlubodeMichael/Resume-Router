// lib/templates/html/ryan.ts
export const ryanTemplate = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>{{fullName}} — Resume</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <!-- Optional: same Computer Modern font the original uses -->
  <link rel="stylesheet" href="https://www.resume.lol/fonts/cm/fonts.css" />
  <style>
    /* Page + base */
    @page { size: A4; margin: 20mm 18mm; }
    body { font-family: "Computer Modern Serif", serif; font-size: 11pt; font-weight: 500; color: #000; }
    .spacer { margin: 0 auto; }

    /* Headings & text */
    h1, h2, h3, h4, p, a, li { color: #000; }
    h1 { text-align: center; font-size: 26pt; margin: 0; margin-top: -0.1in; }
    h2 { margin: 5pt 0; padding: 0; border-bottom: 1px solid #000; text-transform: uppercase; font-size: 11pt; font-weight: 400; }
    h2::first-letter { font-size: 14pt; }
    h3, h4 { display: flex; justify-content: space-between; margin: 0; margin-left: 0.15in; font-size: 11pt; }
    h4 { font-style: italic; font-weight: 400; }
    p { margin: 0; padding: 0; }
    a { color: #000; text-underline-offset: 4px; }

    /* Lists */
    ul { margin: 1pt 0; margin-left: 0.3in; padding-left: 24px; padding-right: 24px; font-size: 11pt; }
    ul > li { margin-bottom: 1pt; }
    ul > li:last-child { margin-bottom: 5pt; }

    /* Header info line */
    .headerInfo > ul { display: flex; justify-content: center; gap: 8px; margin: 0; padding: 0; list-style: none; }
    .headerInfo > ul > li { white-space: pre; }
    .headerInfo > ul > li:not(:last-child)::after { content: "|"; margin-left: 8px; }

    /* Helpers */
    .indent { margin-left: 0.15in; }
    .tech-stack { font-style: normal; font-weight: 400; }

    /* Tiny spacing helpers */
    .mb6 { margin-bottom: 6pt; }
    .mb8 { margin-bottom: 8pt; }
    .mt6 { margin-top: 6pt; }
  </style>
</head>
<body>
  <!-- NAME -->
  <h1>{{fullName}}</h1>

  <!-- HEADER CONTACT LINE -->
  <div class="section headerInfo mb8">
    <ul>
      {{#email}}<li><a href="mailto:{{email}}">{{email}}</a></li>{{/email}}
      {{#phone}}<li>{{phone}}</li>{{/phone}}
      {{#links}}
        <li><a href="{{url}}">{{label}}</a></li>
      {{/links}}
    </ul>
  </div>

  <!-- EDUCATION -->
  {{#education}}
  <section class="mb6">
    <h2>Education</h2>
    {{#education}}
      <h3>
        <span>{{school}}</span>
        <span class="normal">{{start}} – {{end}}</span>
      </h3>
      <h4>
        <span>{{degree}}</span>
        <span>{{location}}</span>
      </h4>
    {{/education}}
  </section>
  {{/education}}

  <!-- EXPERIENCE -->
  {{#experiences}}
  <section class="mb6">
    <h2>Experience</h2>
    {{#experiences}}
      <h3>
        <span>{{role}}</span>
        <span class="normal">{{start}} – {{end}}</span>
      </h3>
      <h4>
        <span>{{company}}</span>
        <span>{{location}}</span>
      </h4>
      <ul>
        {{#bullets}}<li>{{item}}</li>{{/bullets}}
      </ul>
    {{/experiences}}
  </section>
  {{/experiences}}

  <!-- PROJECTS -->
  {{#projects}}
  <section class="mb6">
    <h2>Projects</h2>
    {{#projects}}
      <h3>
        <span>
          {{#url}}<a href="{{url}}">{{name}}</a>{{/url}}
          {{^url}}{{name}}{{/url}}
          {{#stack}}<span class="tech-stack">&nbsp;| <em>{{stack}}</em></span>{{/stack}}
        </span>
        <span class="normal">{{start}} – {{end}}</span>
      </h3>
      <ul>
        {{#bullets}}<li>{{item}}</li>{{/bullets}}
      </ul>
    {{/projects}}
  </section>
  {{/projects}}

  <!-- SKILLS -->
  {{#skills}}
  <section>
    <h2>Technical Skills</h2>
    <p class="indent"><strong>Languages</strong>: {{skills.languages}}</p>
    <p class="indent"><strong>Frameworks</strong>: {{skills.frameworks}}</p>
    <p class="indent"><strong>Developer Tools</strong>: {{skills.tools}}</p>
    <p class="indent"><strong>Libraries</strong>: {{skills.libraries}}</p>
  </section>
  {{/skills}}
</body>
</html>`;
