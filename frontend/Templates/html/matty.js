export const mattyTemplateSpec = {
  html: `
    <!-- Last Updated -->
    <div class="last-updated" style="color: gray; text-align: right;">
      Last Updated on {{lastUpdated}}
    </div>

    <!-- Heading -->
    <header class="header">
      <h1>{{fullName}}</h1>
      <div class="headerInfo">
        <ul>
          {{#links}}
            <li>
              {{#icon}}
                <span class="fa-icon">{{icon}}</span>
              {{/icon}}
              <a href="{{url}}">{{label}}</a>
            </li>
          {{/links}}
          {{#email}}
            <li>
              <span class="fa-icon">envelope</span>
              <a href="mailto:{{email}}">{{email}}</a>
            </li>
          {{/email}}
        </ul>
      </div>
    </header>

    <!-- Education -->
    {{#education}}
    <section class="section">
      <h2>Education</h2>
      {{#institutions}}
        <div class="subheading">
          <div class="subheading-row">
            <strong>{{school}}</strong>
            <span>{{date}}</span>
          </div>
          <div class="subsubheading-row">
            <em>{{degree}}</em>
            <em>{{gpa}}</em>
          </div>
        </div>
      {{/institutions}}
      {{#coursework}}
        <h3>Coursework</h3>
        <p><strong>Courses:</strong> {{courses}}</p>
        <p><strong>Awards:</strong> {{awards}}</p>
      {{/coursework}}
    </section>
    {{/education}}

    <!-- Skills -->
    {{#skills}}
    <section class="section">
      <h2>Skills</h2>
      <p><strong>Languages:</strong> {{languages}}</p>
      <p><strong>Tools:</strong> {{tools}}</p>
    </section>
    {{/skills}}

    <!-- Projects -->
    {{#projects}}
    <section class="section">
      <h2>Projects</h2>
      {{#projects}}
        <div class="subheading">
          <div class="subheading-row">
            <span>
              <strong>{{name}}</strong>
              {{#stack}} | <em>{{stack}}</em>{{/stack}}
            </span>
            <span>{{date}}</span>
          </div>
          <ul>
            {{#bullets}}
              <li>{{item}}</li>
            {{/bullets}}
          </ul>
        </div>
      {{/projects}}
    </section>
    {{/projects}}

    <!-- Experience -->
    {{#experiences}}
    <section class="section">
      <h2>Experience</h2>
      {{#experiences}}
        <div class="subheading">
          <div class="subheading-row">
            <span>
              <strong>{{role}}</strong>
              {{#organization}} | <em>{{organization}}</em>{{/organization}}
            </span>
            <span>{{date}}</span>
          </div>
          <p>{{description}}</p>
        </div>
      {{/experiences}}
      {{#hobbies}}
        <h3>Hobbies</h3>
        {{#hobbies}}
          <div class="subheading">
            <div class="subheading-row">
              <strong>{{name}}</strong>
              <span>{{date}}</span>
            </div>
            <p>{{description}}</p>
          </div>
        {{/hobbies}}
      {{/hobbies}}
    </section>
    {{/experiences}}
  `,
  css: `
    @import url('https://www.resume.lol/fonts/cm/fonts.css');

    /* Page + base */
    @page { size: letter; margin: 0.5in; }
    body {
      font-family: "Computer Modern Serif", serif;
      font-size: 11pt;
      font-weight: 500;
      color: #000;
      margin: 0;
      padding: 0.5in;
      width: 100%;
      max-width: 8.5in;
    }

    /* Headings & text */
    h1, h2, h3, h4, p, a, li {
      color: black;
    }
    h1 {
      text-align: center;
      font-size: 24pt;
      margin: 0;
      padding: 0;
      text-transform: uppercase;
      font-variant: small-caps;
    }
    h2 {
      font-size: 14pt;
      font-variant: small-caps;
      margin: -5pt 0 0 0;
      padding: 0;
      border-bottom: 1px solid black;
    }
    h3 {
      font-size: 12pt;
      font-variant: small-caps;
      margin: -4pt 0 0 -0.15in;
      padding: 0;
    }
    p {
      margin: 0;
      padding: 0;
      font-size: 11pt;
    }
    a {
      color: black;
      text-decoration: none;
      border-bottom: 1px solid black;
    }
    a:hover {
      text-decoration: underline;
    }

    /* Header info */
    .headerInfo > ul {
      display: flex;
      justify-content: center;
      margin: 8pt 0 0 0;
      padding: 0;
      list-style: none;
      font-size: 10pt;
    }
    .headerInfo > ul > li {
      margin: 0 8pt;
      white-space: nowrap;
    }
    .headerInfo > ul > li:not(:last-child)::after {
      content: "$";
      margin-left: 8pt;
    }
    .fa-icon {
      margin-right: 4pt;
    }

    /* Sections */
    .section {
      margin-bottom: 5pt;
    }
    .subheading {
      margin-bottom: -7pt;
    }
    .subheading-row {
      display: flex;
      justify-content: space-between;
      margin-left: 0.15in;
      margin-bottom: -7pt;
    }
    .subsubheading-row {
      display: flex;
      justify-content: space-between;
      margin-left: 0.15in;
      font-style: italic;
      font-size: 10pt;
    }

    /* Lists */
    ul {
      margin: 0 0 0 0.3in;
      padding: 0 24pt;
      font-size: 10pt;
      list-style-type: none;
    }
    ul > li {
      margin-bottom: -4pt;
      position: relative;
      padding-left: 15pt;
    }
    ul > li:before {
      content: "•";
      position: absolute;
      left: 0;
      font-size: 8pt;
      line-height: 10pt;
    }

    /* Last updated */
    .last-updated {
      text-align: right;
      color: gray;
      font-size: 10pt;
      margin-top: -10pt;
      margin-bottom: 5pt;
    }
  `,
  page: { size: "letter", margin: "0.5in" },
  fonts: ["cm-serif.woff2"],
  baseUrl: "https://www.resume.lol/fonts/",
};
