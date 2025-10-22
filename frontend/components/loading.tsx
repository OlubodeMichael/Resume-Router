export default function Loading({message, className}: {message: string, className: string}) {
  return (
    <div className={`min-h-scree flex items-center justify-center ${className}`}>
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-600">{message}</p>
    </div>
  </div>
  )
}