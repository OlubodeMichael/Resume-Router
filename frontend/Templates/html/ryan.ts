  // @/lib/templates/jakeRyan.ts
  export const ryanTemplateSpec = {
  html: `
    <!-- NAME -->
    <h1>{{{fullName}}}</h1>

    <!-- HEADER CONTACT LINE -->
    <div class="section headerInfo">
      <ul>
        {{#if phone}}<li>{{{phone}}}</li>{{/if}}
        {{#if email}}<li><a href="mailto:{{email}}">{{{email}}}</a></li>{{/if}}
        {{#if linkedIn}}<li><a href="{{linkedIn}}">{{{linkedInDisplay}}}</a></li>{{/if}}
        {{#if portfolio}}<li><a href="{{portfolio}}">{{{portfolioDisplay}}}</a></li>{{/if}}
      </ul>
    </div>

    <!-- EDUCATION -->
    <section class="mb6">
      <h2>Education</h2>
      {{#if education}}
        {{#each education}}
          <h3>
            <span>{{{school}}}</span>
            <span class="normal">{{{start}}} &ndash; {{{end}}}</span>
          </h3>
          <h4>
            <span>{{{degree}}}</span>
            <span>{{{location}}}</span>
          </h4>
        {{/each}}
      {{else}}
        <p class="indent">Add your education details here</p>
      {{/if}}
    </section>

    <!-- EXPERIENCE -->
    <section class="mb6">
      <h2>Experience</h2>
      {{#if experiences}}
        {{#each experiences}}
          <h3>
            <span>{{{role}}}</span>
            <span class="normal">{{{start}}} &ndash; {{{end}}}</span>
          </h3>
          <h4>
            <span>{{{company}}}</span>
            <span>{{{location}}}</span>
          </h4>
          <ul>
            {{#each bullets}}<li>{{{item}}}</li>{{/each}}
          </ul>
        {{/each}}
      {{else}}
        <p class="indent">Add your work experience here</p>
      {{/if}}
    </section>

    <!-- PROJECTS -->
    <section class="mb6">
      <h2>Projects</h2>
      {{#if projects}}
        {{#each projects}}
          <h3>
            <span>
              {{#if url}}<a href="{{url}}">{{{name}}}</a>{{else}}{{{name}}}{{/if}}
              {{#if stack}}<span class="tech-stack">&nbsp;| <em>{{{stack}}}</em></span>{{/if}}
            </span>
            {{#if start}}<span class="normal">{{{start}}} &ndash; {{{end}}}</span>{{/if}}
          </h3>
          <ul>
            {{#each bullets}}<li>{{{item}}}</li>{{/each}}
          </ul>
        {{/each}}
      {{else}}
        <p class="indent">Add your projects here</p>
      {{/if}}
    </section>

    <!-- SKILLS -->
    <section>
      <h2>Technical Skills</h2>
      {{#if skills.languages}}
        <p class="indent"><strong>Languages</strong>: {{{skills.languages}}}</p>
      {{else}}
        <p class="indent"><strong>Languages</strong>: Add your programming languages here</p>
      {{/if}}
      {{#if skills.tools}}
        <p class="indent"><strong>Developer Tools</strong>: {{{skills.tools}}}</p>
      {{else}}
        <p class="indent"><strong>Developer Tools</strong>: Add your tools here</p>
      {{/if}}
      {{#if skills.libraries}}
        <p class="indent"><strong>Libraries/Frameworks</strong>: {{{skills.libraries}}}</p>
      {{else}}
        <p class="indent"><strong>Libraries/Frameworks</strong>: Add your libraries here</p>
      {{/if}}
    </section>
  `,
  css: `
    @import url('https://www.resume.lol/fonts/cm/fonts.css');

    /* Page + base */
    @page { 
      size: letter; 
      margin: 0.25in 0.75in 0.1in 0.75in; 
    }
    
    body { 
      font-family: "Computer Modern Serif", serif; 
      font-size: 11pt; 
      font-weight: 500; 
      color: #000; 
      margin: 0;
      padding: 0;
      line-height: 1.2;
    }
    
    .spacer { margin: 0 auto; }

    /* Print-specific styles */
    @media print {
      body {
        font-size: 11pt;
        line-height: 1.2;
      }
      @page { 
        size: letter; 
        margin: 0.25in 0.75in 0.1in 0.75in; 
      }
      
      h1, h2, h3, h4, p, a, li, .normal {
        color: black !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .normal {
        font-weight: bold !important;
      }
      
      .headerInfo > ul > li:not(:last-child)::after {
        content: "|" !important;
      }
    }

    /* Headings & text */
    h1, h2, h3, h4, p, a, li { 
      color: black; 
      margin: 0;
      padding: 0;
    }
    
    h1 { 
      text-align: center; 
      font-size: 22pt; 
      margin: 0 0 2pt 0; 
      font-weight: bold;
    }
    
    h2 { 
      margin: 6pt 0 3pt 0; 
      padding: 0; 
      border-bottom: 1px solid #000; 
      text-transform: uppercase; 
      font-size: 12pt; 
      font-weight: bold;
    }
    
    h2::first-letter { font-size: 14pt; }
    
    h3, h4 { 
      display: flex; 
      justify-content: space-between; 
      margin: 4pt 0 1pt 0; 
      font-size: 11pt; 
      font-weight: bold;
    }
    
    h4 { 
      font-style: italic; 
      font-weight: normal; 
      margin-top: 1pt;
    }
    
    p { 
      margin: 0; 
      padding: 0; 
      font-size: 10pt;
    }
    
    a { 
      color: black; 
      text-decoration: underline;
    }

    /* Lists */
    ul { 
      margin: 2pt 0; 
      padding-left: 0.3in; 
      font-size: 10pt; 
      list-style-type: disc;
    }
    
    ul > li { 
      margin-bottom: 1pt; 
      line-height: 1.2;
      list-style-type: disc;
    }
    
    ul > li:last-child { 
      margin-bottom: 3pt; 
    }

    /* Header info line */
    .headerInfo { 
      margin-bottom: 3pt;
    }
    
    .headerInfo > ul { 
      display: flex; 
      justify-content: center; 
      margin: 0; 
      padding: 0; 
      list-style: none !important; 
      flex-wrap: wrap;
    }
    
    .headerInfo > ul > li { 
      white-space: nowrap;
      font-size: 10pt;
      list-style: none !important;
    }
    
    .headerInfo > ul > li:not(:last-child) { 
      margin-right: 8px; 
    }
    
    .headerInfo > ul > li:not(:last-child)::after { 
      content: "|"; 
      margin-left: 8px; 
    }

    /* Helpers */
    .indent { 
      margin-left: 0.15in; 
    }
    
    .tech-stack { 
      font-style: normal; 
      font-weight: normal; 
    }
    
    .mb6 { 
      margin-bottom: 4pt; 
    }
    
    .normal {
      font-weight: bold;

    }
  `,
  page: { size: 'letter', margin: '0.25in 0.75in 0.1in 0.75in' },
  fonts: [],
  baseUrl: '',
};