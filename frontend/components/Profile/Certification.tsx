import { Plus } from "lucide-react";
import CertificationCard from "../Cards/CertificationCard";

interface Certification {
  name?: string;
  issuer?: string;
  date: string;
  expirationDate?: string;
  credentialId?: string;
  url?: string;
}

interface Profile {
  certifications?: Certification[];
}

interface CertificationProps {
  profile: Profile | null;
  setShowCertificationForm: (show: boolean) => void;
  handleEditCertification: (index: number) => void;
  handleDeleteCertification: (index: number) => void;
}

export default function CertificationSection({
  profile,
  setShowCertificationForm,
  handleEditCertification,
  handleDeleteCertification,
}: CertificationProps) {
  const certifications = profile?.certifications || [];

  return (
    <section className="mb-8">
      <div className="bg-white rounded-xl border-[1px] p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-6">
          <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Certifications</h2>
          <button
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto"
            onClick={() => setShowCertificationForm(true)}
          >
            <Plus className="w-4 h-4" />
            Add
          </button>
        </div>

        <div className="space-y-4">
          {certifications.length > 0 ? (
            certifications.map((cert, idx) => (
              <CertificationCard
                key={idx}
                name={cert.name}
                issuer={cert.issuer}
                date={cert.date}
                expirationDate={cert.expirationDate}
                credentialId={cert.credentialId}
                url={cert.url}
                onEdit={() => handleEditCertification(idx)}
                onDelete={() => handleDeleteCertification(idx)}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-3 text-sm sm:text-base">No certifications added yet</p>
              <button
                onClick={() => setShowCertificationForm(true)}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Add your first certification →
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

