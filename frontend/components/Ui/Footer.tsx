import Logo from "@/components/logo";


export default function Footer() {
    return (
      <footer className="bg-slate-100 text-white py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <div className="flex justify-center items-center space-x-2">
            <Logo />
          </div>
  
          <div className="flex justify-center space-x-6 text-slate-700 text-sm font-medium font-sans">
            <a href="/privacy" className="hover:text-slate-900 transition">Privacy</a>
            <a href="#" className="hover:text-slate-900 transition">Terms</a>
            <a href="#" className="hover:text-slate-900 transition">Contact</a>
          </div>
  
          <p className="text-xs text-slate-700">&copy; {new Date().getFullYear()} ResumeRouter. All rights reserved.</p>
        </div>
      </footer>
    );
  }