

interface ResumeWithMetadata {
  id?: string;
  createdAt?: string;
  updatedAt?: string;
  status?: string;
  title?: string;
  [key: string]: unknown;
}

export default function ResumesList({ resumes, handleResumeClick, getStatusBadge, formatDateTime }: { resumes: ResumeWithMetadata[], handleResumeClick: (id: string, status: string) => void, getStatusBadge: (status: string) => React.ReactNode, formatDateTime: (date: string) => string }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {resumes.map((resume) => {
              const resumeWithMeta = resume as ResumeWithMetadata;
              return (
              <div
                key={resume.id}
                onClick={() => handleResumeClick(resume.id || '', resumeWithMeta.status || '')}
                className={`bg-white rounded-lg border border-gray-200 p-6 transition-all duration-200 ${
                  resumeWithMeta.status === 'failed' 
                    ? 'cursor-not-allowed opacity-60' 
                    : 'cursor-pointer hover:border-blue-400 hover:scale-[1.02]'
                }`}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 truncate">
                      {resumeWithMeta.title || 'Untitled Resume'}
                    </h3>
                  </div>
                  <div className="ml-2">
                    {getStatusBadge(resumeWithMeta.status || 'unknown')}
                  </div>
                </div>

                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Created: {formatDateTime(resumeWithMeta.createdAt || '')}</span>
                  </div>
                  
                  {resumeWithMeta.updatedAt !== resumeWithMeta.createdAt && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <span>Updated: {formatDateTime(resumeWithMeta.updatedAt || '')}</span>
                    </div>
                  )}
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center text-sm text-blue-600 font-medium">
                    {resumeWithMeta.status === 'ready' && (
                      <>
                        View Resume
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </>
                    )}
                    {resumeWithMeta.status === 'processing' && (
                      <>
                        View Progress
                        <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </>
                    )}
                    {resumeWithMeta.status === 'failed' && (
                      <span className="text-red-600">Generation Failed</span>
                    )}
                  </div>
                </div>
              </div>
              );
            })}
          </div>
  )
}