import Link from "next/link";
import Image from "next/image";

interface NavItem {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  active?: boolean;
}

interface SideBarProps {
  name: string;
  subtitle?: string;
  status?: string;
  statusColor?: string;
  avatarUrl?: string;
  initials?: string;
  navItems: NavItem[];
  onItemClick: (label: string) => void;
  activeTab: string;
}

export default function SideBar({
  name,
  subtitle,
  status,
  statusColor = "bg-emerald-500",
  avatarUrl,
  initials,
  navItems,
  onItemClick,
  activeTab,
}: SideBarProps) {
  return (
    <div className="bg-white rounded-xl border-[1px]  p-6 w-full flex flex-col">
      {/* Dashboard Navigation */}
      <div className="mb-6">
        <Link href="/dashboard" className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="mr-2">
            <path d="M19 12H5" />
            <path d="M12 19l-7-7 7-7" />
          </svg>
          <span className="text-sm font-medium">Back to Dashboard</span>
        </Link>
      </div>

      {/* Avatar Section */}
      <div className="flex flex-col items-center mb-6">
        {avatarUrl ? (
          <div className="relative mb-4">
            <Image
              src={avatarUrl}
              priority
              alt={name}
              width={80}
              height={80}
              className="rounded-full object-cover w-20 h-20 border-4 border-gray-50 shadow-sm"
              unoptimized
            />
          </div>
        ) : (
          <div className="relative mb-4">
            <div className="w-20 h-20 rounded-full flex items-center justify-center text-white font-semibold text-xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm">
              {initials || name?.split(" ").map((n) => n[0]).join("").toUpperCase()}
            </div>
            <button className="absolute -bottom-1 -right-1 bg-white rounded-full p-2 shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
              <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-gray-600">
                <path d="M12 20h9" />
                <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19.5 3 21l1.5-4L16.5 3.5z" />
              </svg>
            </button>
          </div>
        )}
        
        {/* Name and subtitle */}
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-1">{name}</h2>
          {subtitle && <p className="text-gray-500 text-sm">{subtitle}</p>}
        </div>
      </div>

      {/* Status badge */}
      {status && (
        <div className="mb-6 text-center">
          <div className="text-xs font-medium text-gray-500 mb-2">Job Search Status</div>
          <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium text-white ${statusColor} shadow-sm`}>
            <div className="w-2 h-2 bg-white rounded-full mr-2 opacity-80"></div>
            {status}
          </span>
        </div>
      )}

      {/* Divider */}
      <div className="border-t border-gray-100 mb-6" />

      {/* Navigation Section */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-4 uppercase tracking-wide">My Career Hub</h3>
        
        <div className="space-y-2">
          {navItems.map((item) => (
            <button
              key={item.label}
              onClick={() => onItemClick(item.label)}
              className={`w-full flex items-center rounded-lg px-4 py-3 transition-all duration-200 ${
                item.label === activeTab 
                  ? "bg-blue-50 border border-blue-200 text-blue-700 shadow-sm" 
                  : "text-gray-700 hover:bg-gray-50 hover:text-gray-900 border border-transparent"
              }`}
            >
              <span className={`mr-3 flex-shrink-0 ${
                item.label === activeTab ? "text-blue-600" : "text-gray-400"
              }`}>
                {item.icon}
              </span>
              <div className="flex flex-col items-start flex-1">
                <span className={`font-medium text-sm ${
                  item.label === activeTab ? "text-blue-700" : "text-gray-900"
                }`}>
                  {item.label}
                </span>
                {item.subtitle && (
                  <span className={`text-xs ${
                    item.label === activeTab ? "text-blue-600" : "text-gray-500"
                  }`}>
                    {item.subtitle}
                  </span>
                )}
              </div>
              <svg 
                width="16" 
                height="16" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                viewBox="0 0 24 24"
                className={`ml-2 flex-shrink-0 transition-transform ${
                  item.label === activeTab ? "text-blue-600" : "text-gray-400"
                }`}
              >
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* Help Section */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <div className="flex items-start">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center mr-3 mt-0.5">
              <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" className="text-white">
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <path d="M12 17h.01" />
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-medium text-blue-900 mb-1">Need Help?</h4>
              <p className="text-xs text-blue-700">Get support with your job search journey</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}