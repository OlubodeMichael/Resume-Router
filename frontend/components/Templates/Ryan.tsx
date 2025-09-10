// components/templates/Ryan.tsx
'use client'

import type { ResumeData } from '@/types/resume'
import clsx from 'clsx'
import formatDate from '@/lib/formateDate'

type Props = {
  data: ResumeData
  className?: string
  editorRef: React.RefObject<HTMLDivElement | null>
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="section-title">
      {children}
    </h2>
  )
}

function RowLine({
  left,
  right,
}: {
  left: React.ReactNode
  right?: React.ReactNode
}) {
  return (
    <h3 className="row-line">
      <span>{left}</span>
      {right && <span className="normal">{right}</span>}
    </h3>
  )
}

function SubRowLine({
  left,
  right,
}: {
  left: React.ReactNode
  right?: React.ReactNode
}) {
  return (
    <h4 className="sub-row-line">
      <span>{left}</span>
      {right && <span>{right}</span>}
    </h4>
  )
}

export default function Ryan({ data, className, editorRef }: Props) {
  const {
    name,
    contacts = [],
    summaryHTML,
    education = [],
    experience = [],
    projects = [],
    skills = [],
  } = data

  return (
    <div
      className={clsx(
        'resume-template mx-auto w-[816px] max-w-full bg-white p-8',
        className
      )}
      ref={editorRef}
      contentEditable
      suppressContentEditableWarning={true}
    >
      {/* Header */}
      <header>
        <h1>{name}</h1>
        {contacts.length > 0 && (
          <div className="section headerInfo">
            <ul>
              {contacts.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        )}
      </header>

      {/* Education */}
      {education.length > 0 && (
        <>
          <SectionTitle>Education</SectionTitle>
          {education.map((ed, i) => (
            <div key={i}>
              <RowLine
                left={ed.school}
                right={
                  ed.start || ed.end ? (
                    <>
                      {ed.start ? `${formatDate(ed.start)}` : ''}{ed.start && ed.end ? ' – ' : ''}{ed.end || ''}
                    </>
                  ) : undefined
                }
              />
              <SubRowLine
                left={ed.degree}
                right={ed.location}
              />
            </div>
          ))}
        </>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <>
          <SectionTitle>Experience</SectionTitle>
          {experience.map((ex, i) => (
            <div key={i}>
              <RowLine
                left={ex.title}
                right={`${ex.start} – ${ex.end}`}
              />
              <SubRowLine
                left={ex.company}
                right={ex.location}
              />
              {ex.bullets && ex.bullets.length > 0 && (
                <ul>
                  {ex.bullets.map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <>
          <SectionTitle>Projects</SectionTitle>
          {projects.map((p, i) => (
            <div key={i}>
              <RowLine
                left={
                  <>
                    {p.name}
                    {p.stack && <span className="tech-stack"> | *{p.stack}*</span>}
                  </>
                }
                right={
                  p.start || p.end ? (
                    <>
                      {p.start ? `${p.start}` : ''}{p.start && p.end ? ' – ' : ''}{p.end || ''}
                    </>
                  ) : undefined
                }
              />
              {p.bullets && p.bullets.length > 0 && (
                <ul>
                  {p.bullets.map((b, j) => (
                    <li key={j}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </>
      )}

      {/* Summary (optional, renders AI HTML) */}
      {summaryHTML && (
        <>
          <SectionTitle>Professional Summary</SectionTitle>
          <div
            className="summary-content"
            dangerouslySetInnerHTML={{ __html: summaryHTML }}
          />
        </>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <>
          <SectionTitle>Technical Skills</SectionTitle>
          <div className="skills-content">
            {skills.map((s, i) => (
              <div key={i} className="indent">
                <strong>{s}</strong>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
