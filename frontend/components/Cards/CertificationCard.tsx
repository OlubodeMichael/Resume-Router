"use client";
import { Pencil, Trash2, Award, Calendar, Link2, Hash } from "lucide-react";
import formatDate from "@/lib/formateDate";

interface CertificationCardProps {
  name?: string;
  issuer?: string;
  date: string;
  expirationDate?: string;
  credentialId?: string;
  url?: string;
  onEdit?: () => void;
  onDelete?: () => void;
}

export default function CertificationCard({
  name,
  issuer,
  date,
  expirationDate,
  credentialId,
  url,
  onEdit,
  onDelete,
}: CertificationCardProps) {
  const issuedOn = formatDate(date);
  const expiresOn = formatDate(expirationDate);

  return (
    <div className="group rounded-xl transition-all duration-200 border border-gray-100 p-4 sm:p-5">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Award className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">{name || "Untitled certification"}</h3>
          </div>
          {issuer && <p className="text-sm text-gray-600">Issued by {issuer}</p>}
        </div>
        <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button
              onClick={onEdit}
              className="p-2 hover:bg-blue-100 rounded-lg transition-colors"
              title="Edit certification"
            >
              <Pencil className="w-4 h-4 text-gray-600" />
            </button>
          )}
          {onDelete && (
            <button
              onClick={onDelete}
              className="p-2 hover:bg-red-100 rounded-lg transition-colors"
              title="Delete certification"
            >
              <Trash2 className="w-4 h-4 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-gray-400" />
          <span>Issued {issuedOn}</span>
        </div>
        {expirationDate && (
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>Expires {expiresOn}</span>
          </div>
        )}
        {credentialId && (
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-gray-400" />
            <span>Credential ID: {credentialId}</span>
          </div>
        )}
        {url && (
          <div className="flex items-center gap-2">
            <Link2 className="w-4 h-4 text-gray-400" />
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline break-all"
            >
              View credential
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

