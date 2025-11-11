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

    <!-- SUMMARY -->
    {{#if summary}}
      <section class="mb6" data-section-type="summary">
        <h2>Summary</h2>
        <div class="indent">{{{summary}}}</div>
      </section>
    {{/if}}

    <!-- OBJECTIVE -->
    {{#if objective}}
      <section class="mb6" data-section-type="objective">
        <h2>Objective</h2>
        <p class="indent">{{{objective}}}</p>
      </section>
    {{/if}}

    <!-- EDUCATION -->
    {{#if education}}
      <section class="mb6" data-section-type="education">
        <h2>Education</h2>
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
      </section>
    {{/if}}

    <!-- EXPERIENCE -->
    {{#if experiences}}
      <section class="mb6" data-section-type="experience">
        <h2>Experience</h2>
        {{#each experiences}}
          <h3>
            <span>{{{role}}}</span>
            <span class="normal">{{{start}}} &ndash; {{{end}}}</span>
          </h3>
          <h4>
            <span>{{{company}}}</span>
            <span>{{{location}}}</span>
          </h4>
          {{#if bullets}}
            <ul>
              {{#each bullets}}<li>{{{item}}}</li>{{/each}}
            </ul>
          {{/if}}
        {{/each}}
      </section>
    {{/if}}

    <!-- PROJECTS -->
    {{#if projects}}
      <section class="mb6" data-section-type="projects">
        <h2>Projects</h2>
        {{#each projects}}
          <h3>
            <span>
              {{#if url}}<a href="{{url}}">{{{name}}}</a>{{else}}{{{name}}}{{/if}}
              {{#if stack}}<span class="tech-stack">&nbsp;| <em>{{{stack}}}</em></span>{{/if}}
            </span>
            {{#if start}}<span class="normal">{{{start}}} &ndash; {{{end}}}</span>{{/if}}
          </h3>
          {{#if bullets}}
            <ul>
              {{#each bullets}}<li>{{{item}}}</li>{{/each}}
            </ul>
          {{/if}}
        {{/each}}
      </section>
    {{/if}}

    <!-- SKILLS -->
    {{#if skills}}
      {{#if skills.languages}}
        <section data-section-type="skills">
          <h2>Technical Skills</h2>
          {{#if skills.languages}}
            <p class="indent"><strong>Languages</strong>: {{{skills.languages}}}</p>
          {{/if}}
          {{#if skills.tools}}
            <p class="indent"><strong>Developer Tools</strong>: {{{skills.tools}}}</p>
          {{/if}}
          {{#if skills.libraries}}
            <p class="indent"><strong>Libraries/Frameworks</strong>: {{{skills.libraries}}}</p>
          {{/if}}
        </section>
      {{/if}}
    {{/if}}

    <!-- CERTIFICATIONS -->
    {{#if certifications}}
      <section class="mb6" data-section-type="certifications">
        <h2>Certifications</h2>
        {{#each certifications}}
          <h3>
            <span>{{{name}}}</span>
            {{#if date}}<span class="normal">{{{date}}}</span>{{/if}}
          </h3>
          {{#if issuer}}<p class="indent">{{{issuer}}}</p>{{/if}}
          {{#if description}}<p class="indent">{{{description}}}</p>{{/if}}
          {{#if bullets}}
            <ul>
              {{#each bullets}}<li>{{{item}}}</li>{{/each}}
            </ul>
          {{/if}}
        {{/each}}
      </section>
    {{/if}}

    <!-- LEADERSHIP -->
    {{#if leadership}}
      <section class="mb6" data-section-type="leadership">
        <h2>Leadership</h2>
        {{#each leadership}}
          <h3>
            <span>{{{role}}}</span>
            {{#if dateRange}}<span class="normal">{{{dateRange}}}</span>{{/if}}
          </h3>
          {{#if company}}
            <h4>
              <span>{{{company}}}</span>
              {{#if location}}<span>{{{location}}}</span>{{/if}}
            </h4>
          {{/if}}
          {{#if bullets}}
            <ul>
              {{#each bullets}}<li>{{{item}}}</li>{{/each}}
            </ul>
          {{/if}}
        {{/each}}
      </section>
    {{/if}}

    <!-- VOLUNTEER -->
    {{#if volunteer}}
      <section class="mb6" data-section-type="volunteer">
        <h2>Volunteer</h2>
        {{#each volunteer}}
          <h3>
            <span>{{{role}}}</span>
            {{#if dateRange}}<span class="normal">{{{dateRange}}}</span>{{/if}}
          </h3>
          {{#if company}}
            <h4>
              <span>{{{company}}}</span>
              {{#if location}}<span>{{{location}}}</span>{{/if}}
            </h4>
          {{/if}}
          {{#if bullets}}
            <ul>
              {{#each bullets}}<li>{{{item}}}</li>{{/each}}
            </ul>
          {{/if}}
        {{/each}}
      </section>
    {{/if}}

    <!-- AWARDS & HONORS -->
    {{#if awardsHonors}}
      <section class="mb6" data-section-type="awardsHonors">
        <h2>Awards &amp; Honors</h2>
        {{#each awardsHonors}}
          <h3>
            <span>{{{title}}}</span>
            {{#if date}}<span class="normal">{{{date}}}</span>{{/if}}
          </h3>
          {{#if issuer}}<p class="indent">{{{issuer}}}</p>{{/if}}
          {{#if description}}<p class="indent">{{{description}}}</p>{{/if}}
          {{#if bullets}}
            <ul>
              {{#each bullets}}<li>{{{item}}}</li>{{/each}}
            </ul>
          {{/if}}
        {{/each}}
      </section>
    {{/if}}

    <!-- PUBLICATIONS -->
    {{#if publications}}
      <section class="mb6" data-section-type="publications">
        <h2>Publications</h2>
        {{#each publications}}
          <h3>
            <span>
              {{#if link}}<a href="{{link}}">{{{title}}}</a>{{else}}{{{title}}}{{/if}}
            </span>
            {{#if date}}<span class="normal">{{{date}}}</span>{{/if}}
          </h3>
          {{#if venue}}<p class="indent"><em>{{{venue}}}</em></p>{{/if}}
          {{#if bullets}}
            <ul>
              {{#each bullets}}<li>{{{item}}}</li>{{/each}}
            </ul>
          {{/if}}
        {{/each}}
      </section>
    {{/if}}

    <!-- REFERENCES -->
    {{#if references}}
      <section class="mb6" data-section-type="references">
        <h2>References</h2>
        <ul class="indent references-list">
          {{#each references}}
            <li>
              <strong>{{{name}}}</strong>
              {{#if relationship}} &mdash; {{{relationship}}}{{/if}}
              {{#if contact}}<br/>{{{contact}}}{{/if}}
              {{#if notes}}<br/><span class="reference-notes">{{{notes}}}</span>{{/if}}
            </li>
          {{/each}}
        </ul>
      </section>
    {{/if}}
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

    .references-list {
      list-style: none;
      padding-left: 0;
    }

    .references-list > li {
      margin-bottom: 4pt;
    }

    .reference-notes {
      font-style: italic;
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