"use client";
import { Pencil, Trash2, User, Building, Mail, PhoneCall } from "lucide-react";

interface ReferenceCardProps {
  name: string;
  title?: string;
  company?: string;
  email?: string;
  phone?: string;
  relation?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function ReferenceCard({
  name,
  title,
  company,
  email,
  phone,
  relation,
  onEdit,
  onDelete,
}: ReferenceCardProps) {
  return (
    <div className="group rounded-xl transition-all duration-200 border border-gray-100 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <User className="w-5 h-5 text-sky-600" />
            <h3 className="text-lg font-semibold text-gray-900">{name}</h3>
          </div>
          {relation && <p className="text-sm text-gray-600">{relation}</p>}
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
              title="Edit reference"
            >
              <Pencil className="w-4 h-4 text-gray-600" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-2 hover:bg-red-100 rounded-lg transition-colors"
              title="Delete reference"
            >
              <Trash2 className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
        {title && (
          <div>
            <p className="text-gray-500 uppercase tracking-wide text-xs">Title</p>
            <p>{title}</p>
          </div>
        )}
        {company && (
          <div>
            <p className="text-gray-500 uppercase tracking-wide text-xs">Company</p>
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-gray-400" />
              <span>{company}</span>
            </div>
          </div>
        )}
        {email && (
          <div>
            <p className="text-gray-500 uppercase tracking-wide text-xs">Email</p>
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-gray-400" />
              <a href={`mailto:${email}`} className="text-blue-600 hover:underline break-all">
                {email}
              </a>
            </div>
          </div>
        )}
        {phone && (
          <div>
            <p className="text-gray-500 uppercase tracking-wide text-xs">Phone</p>
            <div className="flex items-center gap-2">
              <PhoneCall className="w-4 h-4 text-gray-400" />
              <a href={`tel:${phone}`} className="text-blue-600 hover:underline">
                {phone}
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

