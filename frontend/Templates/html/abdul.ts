
export const abdullahTemplateSpec = {
  html: `
    <!-- NAME -->
    <h1>{{fullName}}</h1>

    <!-- HEADER CONTACT LINE -->
    <div class="section headerInfo">
      <ul>
        {{#phone}}<li>{{phone}}</li>{{/phone}}
        {{#email}}<li><a href="mailto:{{email}}">{{email}}</a></li>{{/email}}
        {{#links}}
          <li><a href="{{url}}">{{label}}</a></li>
        {{/links}}
      </ul>
    </div>

    <!-- EDUCATION -->
    {{#education}}
    <section class="mb2">
      <h2>Education</h2>
      {{#education}}
        <h3>
          <span>{{school}}</span>
          <span class="normal">{{start}} &ndash; {{end}}</span>
        </h3>
        <h4>
          <span>{{degree}}</span>
          <span>{{location}}</span>
        </h4>
        {{#gpa}}
          <p class="indent"><strong>GPA:</strong> {{gpa}}</p>
        {{/gpa}}
      {{/education}}
    </section>
    {{/education}}

    <!-- PROFESSIONAL EXPERIENCE -->
    {{#experiences}}
    <section class="mb2">
      <h2>Professional Experience</h2>
      {{#experiences}}
        <h3>
          <span>{{role}}</span>
          <span class="normal">{{start}} &ndash; {{end}}</span>
        </h3>
        <h4>
          <span>{{company}}{{#url}} (<a href="{{url}}">{{companyShort}}</a>){{/url}}</span>
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
    <section class="mb2">
      <h2>Projects</h2>
      {{#projects}}
        <h3>
          <span>
            {{#url}}<a href="{{url}}">{{name}}</a>{{/url}}
            {{^url}}{{name}}{{/url}}
            {{#stack}}<span class="tech-stack">&nbsp;| <em>{{stack}}</em></span>{{/stack}}
          </span>
          <span class="normal">{{start}}</span>
        </h3>
        <ul>
          {{#bullets}}<li>{{item}}</li>{{/bullets}}
        </ul>
      {{/projects}}
    </section>
    {{/projects}}

    <!-- TECHNICAL SKILLS -->
    {{#skills}}
    <section>
      <h2>Technical Skills</h2>
      <p class="indent">{{skills}}</p>
    </section>
    {{/skills}}
  `,
  css: `
    @import url('https://www.resume.lol/fonts/cm/fonts.css');

    /* Page + base */
    @page { size: letter; margin: 0.5in; }
    body { font-family: "Computer Modern Serif", serif; font-size: 9pt; font-weight: 500; color: #000; }
    .spacer { margin: 0 auto; }

    /* Headings & text */
    h1, h2, h3, h4, p, a, li { color: black; }
    h1 { text-align: center; font-size: 24pt; margin: 0; margin-top: -0.1in; }
    h2 { margin: 2pt 0; padding: 0; border-bottom: 1px solid #000; text-transform: uppercase; font-size: 9pt; font-weight: normal; }
    h2::first-letter { font-size: 8pt; }
    h3, h4 { display: flex; justify-content: space-between; margin: 0; margin-left: 0.15in; }
    h3 { font-size: 11pt; }
    h4 { font-size: 10pt; font-style: italic; font-weight: normal; }
    p { margin: 0; padding: 0; }
    a { color: black; text-underline-offset: 4px; }

    /* Lists */
    ul { margin: 1pt 0; margin-left: 0.3in; padding-left: 24px; padding-right: 24px; font-size: 10pt; }
    ul > li { margin-bottom: 1pt; }
    ul > li:first-child { padding-top: -4px; }
    ul > li:last-child { margin-bottom: 2pt; }

    /* Header info line */
    .headerInfo > ul { display: flex; text-align: center; justify-content: center; margin: 0 auto -1pt; padding: 0; list-style: none; }
    .headerInfo > ul > li { white-space: pre; }
    .headerInfo > ul > li:not(:last-child) { margin-right: 8px; }
    .headerInfo > ul > li:not(:last-child)::after {  margin-left: 8px; }

    /* Helpers */
    .indent { margin-left: 0.15in; }
    .tech-stack { font-style: normal; font-weight: normal; }
    .mb2 { margin-bottom: 2pt; }
  `,
  page: { size: 'letter', margin: '0.5in' },
  fonts: ['cm-serif.woff2'],
  baseUrl: 'https://www.resume.lol/fonts/',
};
