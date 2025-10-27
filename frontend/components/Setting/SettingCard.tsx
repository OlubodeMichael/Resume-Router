import { useAuth } from "@/hooks/authProvider";
import Image from "next/image";
import { useRouter } from "next/navigation";


export default function SettingCard({ activeCategory }: { activeCategory: string }) {
    const { user } = useAuth();
    const renderContent = () => {
        switch (activeCategory) {
            case 'profile':
                return <Profile user={user} />;
            case 'notifications':
                return <Notifications />;
            case 'security':
                return <Security />;
            case 'data':
                return <Data />;
            case 'account':
                return <Account />;
            default:
                return <Profile user={user} />;
        }
    };

    return (
        <div className="bg-white p-6 h-full">
            {renderContent()}
        </div>
    )
}


interface User {
    id: string;
    email: string;
    name: string;
    picture?: string;
}

function Profile({ user }: { user: User | null }) {
    const router = useRouter();
    const Initials = user?.name?.split(" ").map((name: string) => name[0]).join("");
    
    const handleManageClick = () => {
        router.push('/profile');
    };
    
    return (
        <div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                    {user?.picture ? (
                        <Image 
                            src={user?.picture} 
                            alt="Profile" 
                            width={48} 
                            height={48} 
                            className="rounded-full"
                        />
                    ) : (
                        <div className="w-12 h-12 rounded-full text-white bg-blue-600 flex items-center justify-center text-sm font-semibold">
                            {Initials}
                        </div>
                    )}
                    <div className="flex flex-col">
                        <h3 className="text-sm font-medium text-gray-900">{user?.name}</h3>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                </div>
                <button 
                    onClick={handleManageClick}
                    className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
                >
                    Manage
                </button>
            </div>
        </div>
    )
}

function Notifications() {
    return (
        <div className="space-y-4">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Notification Preferences</h2>
            <div className="space-y-3">
                <div className="flex items-center justify-between py-2">
                    <div>
                        <p className="text-sm font-medium text-gray-900">Email notifications</p>
                        <p className="text-xs text-gray-500">Receive updates via email</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
                <div className="flex items-center justify-between py-2">
                    <div>
                        <p className="text-sm font-medium text-gray-900">Push notifications</p>
                        <p className="text-xs text-gray-500">Get notified about important updates</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            </div>
        </div>
    )
}

function Security() {
    return (
        <div className="space-y-4">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Security Settings</h2>
            <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                        <p className="text-sm font-medium text-gray-900">Change Password</p>
                        <p className="text-xs text-gray-500">Update your account password</p>
                    </div>
                    <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                        Change
                    </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                        <p className="text-sm font-medium text-gray-900">Two-Factor Authentication</p>
                        <p className="text-xs text-gray-500">Add an extra layer of security</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" />
                        <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            </div>
        </div>
    )
}



function Data() {
    return (
        <div className="space-y-4">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Data Management</h2>
            <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                        <p className="text-sm font-medium text-gray-900">Export Data</p>
                        <p className="text-xs text-gray-500">Download your account data</p>
                    </div>
                    <button className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors">
                        Export
                    </button>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                        <p className="text-sm font-medium text-gray-900">Delete Account</p>
                        <p className="text-xs text-gray-500">Permanently remove your account</p>
                    </div>
                    <button className="px-3 py-1.5 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    )
}

function Account() {
    return (
        <div className="space-y-4">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Account Settings</h2>
            <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                        <p className="text-sm font-medium text-gray-900">Account Status</p>
                        <p className="text-xs text-gray-500">Active since registration</p>
                    </div>
                    <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Active</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                        <p className="text-sm font-medium text-gray-900">Login History</p>
                        <p className="text-xs text-gray-500">View recent login activity</p>
                    </div>
                    <button className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                        View
                    </button>
                </div>
            </div>
        </div>
    )
}