export const erikTemplateSpec = {
  html: `
    <!-- Heading -->
    <header class="header">
      <h1>{{fullName}}</h1>
      <div class="headerInfo">
        <ul>
          {{#phone}}
            <li><span class="fa-icon">phone</span><a href="tel:{{phone}}">{{phone}}</a></li>
          {{/phone}}
          {{#email}}
            <li><span class="fa-icon">envelope</span><a href="mailto:{{email}}">{{email}}</a></li>
          {{/email}}
          {{#links}}
            <li>
              <span class="fa-icon">{{icon}}</span>
              <a href="{{url}}">{{label}}</a>
            </li>
          {{/links}}
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
            <strong>{{date}}</strong>
          </div>
          <div class="subsubheading-row">
            <em>{{degree}}</em>
            <em>{{location}}</em>
          </div>
          <ul>
            {{#details}}
              <li>{{item}}</li>
            {{/details}}
          </ul>
        </div>
      {{/institutions}}
    </section>
    {{/education}}

    <!-- Work Experience -->
    {{#experiences}}
    <section class="section">
      <h2>Work Experience</h2>
      {{#experiences}}
        <div class="subheading">
          <div class="subheading-row">
            <strong>{{role}}</strong>
            <strong>{{date}}</strong>
          </div>
          <div class="subsubheading-row">
            <em>{{organization}}</em>
            <em>{{location}}</em>
          </div>
          <ul>
            {{#bullets}}
              <li>{{item}}</li>
            {{/bullets}}
          </ul>
        </div>
      {{/experiences}}
    </section>
    {{/experiences}}

    <!-- Projects -->
    {{#projects}}
    <section class="section">
      <h2>Projects</h2>
      {{#projects}}
        <div class="subheading">
          <div class="subheading-row">
            <span>
              <strong>{{name}}</strong>
              {{#links}}
                <em> | <a href="{{url}}">{{label}}</a></em>
              {{/links}}
            </span>
            <strong>{{stack}}</strong>
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

    <!-- Leadership -->
    {{#leadership}}
    <section class="section">
      <h2>Leadership</h2>
      {{#leadership}}
        <div class="subheading">
          <div class="subheading-row">
            <span>
              <strong>{{name}}</strong>
              {{#links}}
                <em> | <a href="{{url}}">{{label}}</a></em>
              {{/links}}
            </span>
            <strong>{{date}}</strong>
          </div>
          <ul>
            {{#bullets}}
              <li>{{item}}</li>
            {{/bullets}}
          </ul>
        </div>
      {{/leadership}}
    </section>
    {{/leadership}}

    <!-- Technical Skills -->
    {{#skills}}
    <section class="section">
      <h2>Technical Skills</h2>
      <p><strong>Languages:</strong> {{languages}}</p>
      <p><strong>Developer Tools:</strong> {{tools}}</p>
      <p><strong>Libraries/Frameworks:</strong> {{frameworks}}</p>
    </section>
    {{/skills}}
  `,
  css: `
    @import url('https://www.resume.lol/fonts/cm/fonts.css');

    /* Page + base */
    @page { size: letter; margin: 0.55in; }
    body {
      font-family: "Computer Modern Serif", serif;
      font-size: 11pt;
      font-weight: 500;
      color: #000;
      margin: 0;
      padding: 0.55in;
      width: 100%;
      max-width: 8.5in;
    }

    /* Headings & text */
    h1, h2, h3, p, a, li {
      color: black;
    }
    h1 {
      text-align: center;
      font-size: 20pt;
      margin: 0;
      padding: 0;
      text-transform: uppercase;
      font-variant: small-caps;
    }
    h2 {
      font-size: 14pt;
      font-variant: small-caps;
      margin: -4pt 0 0 0;
      padding: 0;
      font-weight: bold;
      border-bottom: 1px solid black;
    }
    p {
      margin: 0;
      padding: 0;
      font-size: 10pt;
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
      margin: 2pt 0 0 0;
      padding: 0;
      list-style: none;
      font-size: 9pt;
    }
    .headerInfo > ul > li {
      margin: 0 8pt;
      white-space: nowrap;
    }
    .headerInfo > ul > li:not(:last-child)::after {
      content: "~";
      margin-left: 8pt;
    }
    .fa-icon {
      margin-right: 4pt;
    }
    .fa-icon.phone:before { content: "\f095"; }
    .fa-icon.envelope:before { content: "\f0e0"; }
    .fa-icon.linkedin:before { content: "\f0e1"; }
    .fa-icon.github:before { content: "\f09b"; }
    .fa-icon.briefcase:before { content: "\f0b1"; }

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
      margin-left: 0;
      margin-bottom: -7pt;
    }
    .subsubheading-row {
      display: flex;
      justify-content: space-between;
      margin-left: 0;
      font-style: italic;
      font-size: 9pt;
    }

    /* Lists */
    ul {
      margin: 0 0 0 0.15in;
      padding: 0 0 0 15pt;
      font-size: 9pt;
      list-style-type: none;
    }
    ul > li {
      margin-bottom: -4pt;
      position: relative;
      padding-left: 10pt;
    }
    ul > li:before {
      content: "•";
      position: absolute;
      left: 0;
      font-size: 10px;
      line-height: 9pt;
    }
  `,
  page: { size: 'letter', margin: '0.55in' },
  fonts: ['cm-serif.woff2'],
  baseUrl: 'https://www.resume.lol/fonts/',
};