// components/templates/ResumeTemplateClassic.tsx
'use client'

import type { ResumeData } from '@/types/resume'
import clsx from 'clsx'

type Props = {
  data: ResumeData
  className?: string
  editorRef: React.RefObject<HTMLDivElement | null>
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6">
      <div className="small-caps text-[13px] font-semibold tracking-wide text-neutral-900">
        {children}
      </div>
      <div className="hr-thin mt-1" />
    </div>
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
    <div className="flex items-baseline justify-between gap-4">
      <div className="font-semibold text-neutral-900">{left}</div>
      {right ? (
        <div className="text-[12px] text-neutral-700 whitespace-nowrap">
          {right}
        </div>
      ) : null}
    </div>
  )
}

export default function ResumeTemplateClassic({ data, className, editorRef }: Props) {
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
        // 816px ≈ US Letter width at ~96dpi; center for on-screen preview
        'print-exact mx-auto w-[816px] max-w-full bg-white p-8 text-[13px] leading-[1.25rem] text-neutral-900',
        className
      )}
      ref={editorRef}
      contentEditable
      suppressContentEditableWarning={true}
    >
      {/* Header */}
      <header className="text-center">
        <h1 className="text-[34px] leading-none font-serif font-semibold">{name}</h1>
        {contacts.length > 0 && (
          <div className="mt-2 text-[12px] text-neutral-700 flex flex-wrap justify-center gap-x-3 gap-y-1">
            {contacts.map((c, i) => (
              <span key={i} className="truncate max-w-[240px]">
                {c}
                {i < contacts.length - 1 ? ' | ' : ''}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Education */}
      {education.length > 0 && (
        <>
          <SectionTitle>Education</SectionTitle>
          <div className="mt-2 space-y-3">
            {education.map((ed, i) => (
              <div key={i}>
                <RowLine
                  left={<span className="uppercase tracking-wide">{ed.school}</span>}
                  right={
                    ed.start || ed.end ? (
                      <>
                        {ed.start ? `${ed.start}` : ''}{ed.start && ed.end ? ' – ' : ''}{ed.end || ''}
                      </>
                    ) : undefined
                  }
                />
                <div className="flex items-baseline justify-between text-[12px] text-neutral-700">
                  <div className="italic">{ed.degree}</div>
                  <div>{ed.location}</div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <>
          <SectionTitle>Experience</SectionTitle>
          <div className="mt-2 space-y-4">
            {experience.map((ex, i) => (
              <div key={i}>
                <RowLine
                  left={
                    <span>
                      <span className="uppercase tracking-wide">{ex.title}</span>
                      {ex.company ? <span className="font-normal">, {ex.company}</span> : null}
                    </span>
                  }
                  right={
                    <>
                      {ex.start} – {ex.end}
                    </>
                  }
                />
                <div className="flex items-baseline justify-between text-[12px] text-neutral-700">
                  <div>{ex.company && !ex.title ? ex.company : ''}</div>
                  <div>{ex.location}</div>
                </div>
                {ex.bullets && ex.bullets.length > 0 && (
                  <ul className="mt-1 list-disc pl-5 space-y-1">
                    {ex.bullets.map((b, j) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <>
          <SectionTitle>Projects</SectionTitle>
          <div className="mt-2 space-y-4">
            {projects.map((p, i) => (
              <div key={i}>
                <RowLine
                  left={
                    <span className="uppercase tracking-wide">
                      {p.name}
                      {p.stack ? <span className="font-normal"> · {p.stack}</span> : null}
                    </span>
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
                  <ul className="mt-1 list-disc pl-5 space-y-1">
                    {p.bullets.map((b, j) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Summary (optional, renders AI HTML) */}
      {summaryHTML && (
        <>
          <SectionTitle>Professional Summary</SectionTitle>
          <div
            className="mt-2 prose prose-neutral max-w-none prose-p:my-2"
            dangerouslySetInnerHTML={{ __html: summaryHTML }}
          />
        </>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <>
          <SectionTitle>Technical Skills</SectionTitle>
          <div className="mt-2">
            <ul className="flex flex-wrap gap-x-3 gap-y-1">
              {skills.map((s, i) => (
                <li key={i} className="before:content-['•'] before:mr-2 before:text-neutral-500">
                  {s}
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  )
}
