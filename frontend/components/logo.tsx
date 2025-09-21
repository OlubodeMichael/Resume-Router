import Image from "next/image";


export default function Logo() {
  return (
    <div className="flex items-center space-x-2">
      <Image src="/symbol.svg" alt="ResumeRouter" width={36} height={36} />
      <span className="text-lg font-semibold tracking-tight text-slate-900 font-sans">ResumeRouter</span>
    </div>
  )
}