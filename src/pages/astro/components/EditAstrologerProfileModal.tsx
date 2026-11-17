import { FormEvent, useEffect, useMemo, useState } from 'react';
import { ApiError } from '../../../services/api/base';
import {
  astroAPI,
  AstrologerDetail,
  UpdateAstrologerBody,
} from '../../../services/api/astro';
import {
  astroBtn,
  astroBtnOutline,
  astroCard,
  AstroAvatar,
} from './astroUi';
import {
  astroFieldClass,
  astroLabelClass,
  fileToDataUrl,
  pickDirtyFields,
} from '../utils/astroProfileUtils';

type FormState = {
  fullName: string;
  username: string;
  email: string;
  mobileNo: string;
  bio: string;
  astrologerStatus: string;
  yearsOfExperience: string;
  callRate: string;
  chatRate: string;
  panNo: string;
  kycStatus: string;
  rejectedRemark: string;
  profileImage: string | null;
  assessmentCertificate: string | null;
  qualificationProof: string | null;
  specialityIds: number[];
  isTestAstrologer: boolean;
  testViewerUserIdsText: string;
};

function parseUserIds(raw: string): number[] {
  const parts = raw.split(/[\s,;]+/).map((s) => s.trim()).filter(Boolean);
  const ids: number[] = [];
  const seen = new Set<number>();
  for (const part of parts) {
    const n = Number.parseInt(part, 10);
    if (!Number.isFinite(n) || n <= 0 || seen.has(n)) continue;
    seen.add(n);
    ids.push(n);
  }
  return ids;
}

function toFormState(astro: AstrologerDetail): FormState {
  return {
    fullName: astro.fullName ?? '',
    username: astro.username ?? '',
    email: astro.email ?? '',
    mobileNo: astro.mobileNo ?? '',
    bio: astro.bio ?? '',
    astrologerStatus: String(astro.status ?? 1),
    yearsOfExperience:
      astro.yearsOfExperience != null ? String(astro.yearsOfExperience) : '',
    callRate: astro.callRate != null ? String(astro.callRate) : '',
    chatRate: astro.chatRate != null ? String(astro.chatRate) : '',
    panNo: astro.documents?.panNo ?? '',
    kycStatus:
      astro.documents?.kycStatus != null ? String(astro.documents.kycStatus) : '',
    rejectedRemark: astro.documents?.rejectedRemark ?? '',
    profileImage: null,
    assessmentCertificate: null,
    qualificationProof: null,
    specialityIds: astro.specialities?.map((s) => s.id) ?? [],
    isTestAstrologer: Boolean(astro.isTestAstrologer),
    testViewerUserIdsText: (astro.testViewerUserIds ?? []).join(', '),
  };
}

function parseOptionalNumber(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

function arraysEqual(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort((x, y) => x - y);
  const sortedB = [...b].sort((x, y) => x - y);
  return sortedA.every((v, i) => v === sortedB[i]);
}

function toPatch(current: FormState, initial: FormState): UpdateAstrologerBody {
  const dirty = pickDirtyFields(current, initial);
  const body: UpdateAstrologerBody = {};

  if ('fullName' in dirty) body.fullName = current.fullName.trim() || null;
  if ('username' in dirty) body.username = current.username.trim() || null;
  if ('email' in dirty) body.email = current.email.trim() || null;
  if ('mobileNo' in dirty) body.mobileNo = current.mobileNo.trim() || null;
  if ('bio' in dirty) body.bio = current.bio.trim() || null;
  if ('astrologerStatus' in dirty) body.astrologerStatus = Number(current.astrologerStatus);
  if ('yearsOfExperience' in dirty) {
    body.yearsOfExperience = parseOptionalNumber(current.yearsOfExperience);
  }
  if ('callRate' in dirty) body.callRate = parseOptionalNumber(current.callRate);
  if ('chatRate' in dirty) body.chatRate = parseOptionalNumber(current.chatRate);
  if ('panNo' in dirty) body.panNo = current.panNo.trim() || null;
  if ('kycStatus' in dirty && current.kycStatus !== '') {
    body.kycStatus = Number(current.kycStatus) as 0 | 1 | 2;
  }
  if ('rejectedRemark' in dirty) body.rejectedRemark = current.rejectedRemark.trim() || null;
  if (!arraysEqual(current.specialityIds, initial.specialityIds)) {
    body.specialityIds = current.specialityIds;
  }
  if (current.profileImage) body.profileImage = current.profileImage;
  if (current.assessmentCertificate) {
    body.assessmentCertificate = current.assessmentCertificate;
  }
  if (current.qualificationProof) body.qualificationProof = current.qualificationProof;

  if ('isTestAstrologer' in dirty) {
    body.isTestAstrologer = current.isTestAstrologer;
  }

  const currentViewerIds = parseUserIds(current.testViewerUserIdsText);
  const initialViewerIds = parseUserIds(initial.testViewerUserIdsText);
  if (
    'testViewerUserIdsText' in dirty ||
    !arraysEqual(currentViewerIds, initialViewerIds)
  ) {
    body.testViewerUserIds = currentViewerIds;
  }

  // Clearing test mode: only need the flag; viewers optional
  if (body.isTestAstrologer === false) {
    body.testViewerUserIds = undefined;
  }

  return body;
}

type Props = {
  open: boolean;
  astro: AstrologerDetail;
  onClose: () => void;
  onSaved: (astro: AstrologerDetail, message: string) => void;
  onError: (message: string) => void;
};

export default function EditAstrologerProfileModal({
  open,
  astro,
  onClose,
  onSaved,
  onError,
}: Props) {
  const [form, setForm] = useState<FormState>(() => toFormState(astro));
  const [initial, setInitial] = useState<FormState>(() => toFormState(astro));
  const [photoPreview, setPhotoPreview] = useState<string | null>(astro.profilePhoto);
  const [specialityOptions, setSpecialityOptions] = useState<
    { id: number; name: string }[]
  >([]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const next = toFormState(astro);
    setForm(next);
    setInitial(next);
    setPhotoPreview(astro.profilePhoto);

    void (async () => {
      try {
        const res = await astroAPI.listAstrologers({ limit: 100 });
        const map = new Map<number, string>();
        for (const item of res.data) {
          for (const s of item.specialities ?? []) {
            map.set(s.id, s.name);
          }
        }
        for (const s of astro.specialities ?? []) {
          map.set(s.id, s.name);
        }
        setSpecialityOptions(
          [...map.entries()]
            .map(([id, name]) => ({ id, name }))
            .sort((a, b) => a.name.localeCompare(b.name))
        );
      } catch {
        setSpecialityOptions(astro.specialities?.map((s) => ({ id: s.id, name: s.name })) ?? []);
      }
    })();
  }, [open, astro]);

  const selectedSpecialities = useMemo(
    () => specialityOptions.filter((s) => form.specialityIds.includes(s.id)),
    [form.specialityIds, specialityOptions]
  );

  if (!open) return null;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onFile = async (
    file: File | undefined,
    key: 'profileImage' | 'assessmentCertificate' | 'qualificationProof',
    preview?: (url: string) => void
  ) => {
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      set(key, dataUrl);
      preview?.(dataUrl);
    } catch {
      onError('Failed to read file');
    }
  };

  const toggleSpeciality = (id: number) => {
    setForm((prev) => ({
      ...prev,
      specialityIds: prev.specialityIds.includes(id)
        ? prev.specialityIds.filter((x) => x !== id)
        : [...prev.specialityIds, id],
    }));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const body = toPatch(form, initial);
    if (Object.keys(body).length === 0) {
      onError('No changes to save');
      return;
    }

    try {
      setSubmitting(true);
      const res = await astroAPI.updateAstrologer(astro.userId, body);
      onSaved(res.data, res.message ?? 'Astrologer profile updated');
      onClose();
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'Failed to update profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
      <form
        onSubmit={submit}
        className={`${astroCard} flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden`}
      >
        <div className="border-b border-brand-100 px-6 py-4 dark:border-brand-900/40">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Edit astrologer profile
          </h3>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            User #{astro.userId} · verification uses separate approve/reject actions
          </p>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div className="flex items-center gap-4">
            <AstroAvatar name={form.fullName || astro.fullName} photo={photoPreview} size="lg" />
            <div>
              <label className={astroLabelClass}>Profile photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) =>
                  void onFile(e.target.files?.[0], 'profileImage', setPhotoPreview)
                }
                className="text-sm text-gray-600 dark:text-gray-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className={astroLabelClass}>Full name</label>
              <input
                value={form.fullName}
                onChange={(e) => set('fullName', e.target.value)}
                className={astroFieldClass}
              />
            </div>
            <div>
              <label className={astroLabelClass}>Username</label>
              <input
                value={form.username}
                onChange={(e) => set('username', e.target.value)}
                className={astroFieldClass}
              />
            </div>
            <div>
              <label className={astroLabelClass}>Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                className={astroFieldClass}
              />
            </div>
            <div>
              <label className={astroLabelClass}>Mobile</label>
              <input
                value={form.mobileNo}
                onChange={(e) => set('mobileNo', e.target.value)}
                className={astroFieldClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className={astroLabelClass}>Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => set('bio', e.target.value)}
                rows={3}
                className={astroFieldClass}
              />
            </div>
            <div>
              <label className={astroLabelClass}>Bookable status</label>
              <select
                value={form.astrologerStatus}
                onChange={(e) => set('astrologerStatus', e.target.value)}
                className={astroFieldClass}
              >
                <option value="1">Active / bookable</option>
                <option value="0">Inactive</option>
              </select>
            </div>
            <div>
              <label className={astroLabelClass}>Years of experience</label>
              <input
                type="number"
                min={0}
                value={form.yearsOfExperience}
                onChange={(e) => set('yearsOfExperience', e.target.value)}
                className={astroFieldClass}
              />
            </div>
            <div>
              <label className={astroLabelClass}>Call rate (₹/min)</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.callRate}
                onChange={(e) => set('callRate', e.target.value)}
                className={astroFieldClass}
              />
            </div>
            <div>
              <label className={astroLabelClass}>Chat rate (₹/min)</label>
              <input
                type="number"
                min={0}
                step="0.01"
                value={form.chatRate}
                onChange={(e) => set('chatRate', e.target.value)}
                className={astroFieldClass}
              />
            </div>
          </div>

          <div className="rounded-xl border border-brand-100 p-4 dark:border-brand-900/40">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Specialities</h4>
            {specialityOptions.length > 0 ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {specialityOptions.map((s) => {
                  const checked = form.specialityIds.includes(s.id);
                  return (
                    <label
                      key={s.id}
                      className={`inline-flex cursor-pointer items-center gap-2 rounded-full border px-3 py-1.5 text-sm transition-colors ${
                        checked
                          ? 'border-brand-500 bg-brand-50 text-brand-800 dark:border-brand-600 dark:bg-brand-950/40 dark:text-brand-300'
                          : 'border-gray-200 text-gray-600 hover:border-brand-300 dark:border-gray-700 dark:text-gray-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        className="sr-only"
                        checked={checked}
                        onChange={() => toggleSpeciality(s.id)}
                      />
                      {s.name}
                    </label>
                  );
                })}
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-500">No speciality catalogue loaded</p>
            )}
            {selectedSpecialities.length > 0 && (
              <p className="mt-2 text-xs text-gray-500">
                Selected: {selectedSpecialities.map((s) => s.name).join(', ')}
              </p>
            )}
          </div>

          <div className="rounded-xl border border-violet-100 bg-violet-50/40 p-4 dark:border-violet-900/40 dark:bg-violet-950/20">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
              Test astrologer
            </h4>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Hidden from public app lists. Only the viewer user IDs below can see this profile.
            </p>
            <label className="mt-3 flex items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                checked={form.isTestAstrologer}
                onChange={(e) => set('isTestAstrologer', e.target.checked)}
              />
              Mark as test astrologer
            </label>
            {form.isTestAstrologer && (
              <div className="mt-3">
                <label className={astroLabelClass}>
                  Viewer user IDs (comma or space separated)
                </label>
                <textarea
                  value={form.testViewerUserIdsText}
                  onChange={(e) => set('testViewerUserIdsText', e.target.value)}
                  rows={2}
                  placeholder="e.g. 1001, 1002, 24009"
                  className={astroFieldClass}
                />
                <p className="mt-1 text-xs text-gray-500">
                  {parseUserIds(form.testViewerUserIdsText).length} viewer
                  {parseUserIds(form.testViewerUserIdsText).length === 1 ? '' : 's'} parsed
                </p>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-amber-100 bg-amber-50/30 p-4 dark:border-amber-900/40 dark:bg-amber-950/20">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">KYC documents</h4>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className={astroLabelClass}>PAN</label>
                <input
                  value={form.panNo}
                  onChange={(e) => set('panNo', e.target.value)}
                  className={astroFieldClass}
                />
              </div>
              <div>
                <label className={astroLabelClass}>KYC status</label>
                <select
                  value={form.kycStatus}
                  onChange={(e) => set('kycStatus', e.target.value)}
                  className={astroFieldClass}
                >
                  <option value="">—</option>
                  <option value="0">Pending</option>
                  <option value="1">Approved</option>
                  <option value="2">Rejected</option>
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className={astroLabelClass}>Rejected remark</label>
                <input
                  value={form.rejectedRemark}
                  onChange={(e) => set('rejectedRemark', e.target.value)}
                  className={astroFieldClass}
                />
              </div>
              <div>
                <label className={astroLabelClass}>Assessment certificate</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => void onFile(e.target.files?.[0], 'assessmentCertificate')}
                  className="text-sm text-gray-600 dark:text-gray-400"
                />
              </div>
              <div>
                <label className={astroLabelClass}>Qualification proof</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => void onFile(e.target.files?.[0], 'qualificationProof')}
                  className="text-sm text-gray-600 dark:text-gray-400"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-brand-100 px-6 py-4 dark:border-brand-900/40">
          <button type="button" onClick={onClose} disabled={submitting} className={astroBtnOutline}>
            Cancel
          </button>
          <button type="submit" disabled={submitting} className={astroBtn}>
            {submitting ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
