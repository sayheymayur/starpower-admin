import { useEffect, useState } from 'react';
import { Modal } from '../ui/modal';
import { ApiError } from '../../services/api/base';
import {
  AdminAadhaarProfile,
  AadhaarUpdateInput,
  AadhaarVerificationStatus,
  aadhaarAPI,
} from '../../services/api/aadhaar';

interface EditAadhaarModalProps {
  isOpen: boolean;
  onClose: () => void;
  record: AdminAadhaarProfile;
  onUpdated: (updated: AdminAadhaarProfile) => void;
}

type FormState = {
  fullName: string;
  maskedAadhaar: string;
  mobileNo: string;
  verificationStatus: AadhaarVerificationStatus;
  verified: boolean;
  careOf: string;
  fatherName: string;
  dob: string;
  yob: string;
  gender: string;
  zipCode: string;
  fullAddress: string;
  digilockerMobile: string;
  digilockerClientId: string;
  isDoctor: boolean;
  isAstrologer: boolean;
  clearProfileImage: boolean;
  clearXmlFile: boolean;
};

const inputClass =
  'w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white';

function toDateInput(value?: string | null): string {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '';
  return d.toISOString().slice(0, 10);
}

function buildForm(record: AdminAadhaarProfile): FormState {
  return {
    fullName: record.fullName ?? '',
    maskedAadhaar: record.maskedAadhaar ?? '',
    mobileNo: record.mobileNo ?? '',
    verificationStatus: record.verificationStatus,
    verified: record.verified,
    careOf: record.careOf ?? '',
    fatherName: record.fatherName ?? '',
    dob: toDateInput(record.dob),
    yob: record.yob ?? '',
    gender: record.gender ?? '',
    zipCode: record.zipCode ?? '',
    fullAddress: record.fullAddress ?? '',
    digilockerMobile: record.digilockerMobile ?? '',
    digilockerClientId: record.digilockerClientId ?? '',
    isDoctor: Boolean(record.isDoctor),
    isAstrologer: Boolean(record.isAstrologer),
    clearProfileImage: false,
    clearXmlFile: false,
  };
}

function nullable(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

export default function EditAadhaarModal({
  isOpen,
  onClose,
  record,
  onUpdated,
}: EditAadhaarModalProps) {
  const [form, setForm] = useState<FormState>(() => buildForm(record));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setForm(buildForm(record));
      setError(null);
    }
  }, [isOpen, record]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const body: AadhaarUpdateInput = {
        fullName: nullable(form.fullName),
        maskedAadhaar: nullable(form.maskedAadhaar),
        mobileNo: nullable(form.mobileNo),
        verificationStatus: form.verificationStatus,
        verified: form.verified,
        careOf: nullable(form.careOf),
        fatherName: nullable(form.fatherName),
        dob: nullable(form.dob),
        yob: nullable(form.yob),
        gender: nullable(form.gender),
        zipCode: nullable(form.zipCode),
        fullAddress: nullable(form.fullAddress),
        digilockerMobile: nullable(form.digilockerMobile),
        digilockerClientId: nullable(form.digilockerClientId),
        isDoctor: form.isDoctor,
        isAstrologer: form.isAstrologer,
      };
      if (form.clearProfileImage) body.clearProfileImage = true;
      if (form.clearXmlFile) body.clearXmlFile = true;

      const updated = await aadhaarAPI.update(record.userId, body);
      onUpdated(updated);
      onClose();
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Failed to update Aadhaar record');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-2xl">
      <div className="max-h-[85vh] overflow-y-auto p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          Edit Aadhaar — User {record.userId}
        </h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Only masked Aadhaar can be stored — never the full 12-digit number.
        </p>

        {error && (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-800 dark:bg-red-950/30 dark:text-red-200">
            {error}
          </div>
        )}

        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full name">
            <input className={inputClass} value={form.fullName} onChange={(e) => set('fullName', e.target.value)} />
          </Field>
          <Field label="Masked Aadhaar">
            <input className={inputClass} value={form.maskedAadhaar} onChange={(e) => set('maskedAadhaar', e.target.value)} placeholder="XXXXXXXX1234" />
          </Field>
          <Field label="Verification status">
            <select
              className={inputClass}
              value={form.verificationStatus}
              onChange={(e) => set('verificationStatus', e.target.value as AadhaarVerificationStatus)}
            >
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="failed">Failed</option>
            </select>
          </Field>
          <Field label="Verified flag">
            <label className="flex items-center gap-2 py-2 text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" checked={form.verified} onChange={(e) => set('verified', e.target.checked)} className="h-4 w-4 rounded border-gray-300" />
              Verified = true
            </label>
          </Field>
          <Field label="Mobile">
            <input className={inputClass} value={form.mobileNo} onChange={(e) => set('mobileNo', e.target.value)} />
          </Field>
          <Field label="DigiLocker mobile">
            <input className={inputClass} value={form.digilockerMobile} onChange={(e) => set('digilockerMobile', e.target.value)} />
          </Field>
          <Field label="Care of">
            <input className={inputClass} value={form.careOf} onChange={(e) => set('careOf', e.target.value)} />
          </Field>
          <Field label="Father / care-of">
            <input className={inputClass} value={form.fatherName} onChange={(e) => set('fatherName', e.target.value)} />
          </Field>
          <Field label="DOB">
            <input type="date" className={inputClass} value={form.dob} onChange={(e) => set('dob', e.target.value)} />
          </Field>
          <Field label="Year of birth">
            <input className={inputClass} value={form.yob} onChange={(e) => set('yob', e.target.value)} />
          </Field>
          <Field label="Gender">
            <select className={inputClass} value={form.gender} onChange={(e) => set('gender', e.target.value)}>
              <option value="">—</option>
              <option value="M">Male</option>
              <option value="F">Female</option>
              <option value="O">Other</option>
            </select>
          </Field>
          <Field label="PIN / zip code">
            <input className={inputClass} value={form.zipCode} onChange={(e) => set('zipCode', e.target.value)} />
          </Field>
          <Field label="Full address" className="sm:col-span-2">
            <textarea className={inputClass} rows={2} value={form.fullAddress} onChange={(e) => set('fullAddress', e.target.value)} />
          </Field>
          <Field label="DigiLocker client ID" className="sm:col-span-2">
            <input className={inputClass} value={form.digilockerClientId} onChange={(e) => set('digilockerClientId', e.target.value)} />
          </Field>
        </div>

        <div className="mt-4 flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input type="checkbox" checked={form.isDoctor} onChange={(e) => set('isDoctor', e.target.checked)} className="h-4 w-4 rounded border-gray-300" />
            Listener
          </label>
          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
            <input type="checkbox" checked={form.isAstrologer} onChange={(e) => set('isAstrologer', e.target.checked)} className="h-4 w-4 rounded border-gray-300" />
            Astrologer
          </label>
        </div>

        <div className="mt-4 space-y-2 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Stored files</p>
          {record.profileImageUrl && (
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" checked={form.clearProfileImage} onChange={(e) => set('clearProfileImage', e.target.checked)} className="h-4 w-4 rounded border-gray-300" />
              Delete stored Aadhaar photo
            </label>
          )}
          {record.xmlUrl && (
            <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
              <input type="checkbox" checked={form.clearXmlFile} onChange={(e) => set('clearXmlFile', e.target.checked)} className="h-4 w-4 rounded border-gray-300" />
              Delete stored XML file
            </label>
          )}
          {!record.profileImageUrl && !record.xmlUrl && (
            <p className="text-sm text-gray-400">No stored files</p>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            onClick={() => void handleSave()}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function Field({
  label,
  children,
  className = '',
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={className}>
      <label className="mb-1 block text-xs font-medium text-gray-600 dark:text-gray-400">{label}</label>
      {children}
    </div>
  );
}
