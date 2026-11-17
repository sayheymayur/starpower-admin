import { FormEvent, useEffect, useState } from 'react';
import { ApiError } from '../../../services/api/base';
import {
  astroAPI,
  AstroGender,
  AstroUserDetail,
  UpdateAstroUserBody,
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
  GENDER_OPTIONS,
  pickDirtyFields,
} from '../utils/astroProfileUtils';

type FormState = {
  fullName: string;
  username: string;
  email: string;
  mobileNo: string;
  gender: string;
  userStatus: string;
  dob: string;
  birthPlace: string;
  birthTime: string;
  astroProfileStatus: string;
  profileImage: string | null;
};

function toFormState(user: AstroUserDetail): FormState {
  return {
    fullName: user.fullName ?? '',
    username: user.username ?? '',
    email: user.email ?? '',
    mobileNo: user.mobileNo ?? '',
    gender: user.gender ?? '',
    userStatus: String(user.status ?? 1),
    dob: user.astroProfile?.dob ?? '',
    birthPlace: user.astroProfile?.birthPlace ?? '',
    birthTime: user.astroProfile?.birthTime ?? '',
    astroProfileStatus:
      user.astroProfile?.status != null ? String(user.astroProfile.status) : '',
    profileImage: null,
  };
}

function toPatch(current: FormState, initial: FormState): UpdateAstroUserBody {
  const dirty = pickDirtyFields(current, initial);
  const body: UpdateAstroUserBody = {};

  if ('fullName' in dirty) body.fullName = current.fullName.trim() || null;
  if ('username' in dirty) body.username = current.username.trim() || null;
  if ('email' in dirty) body.email = current.email.trim() || null;
  if ('mobileNo' in dirty) body.mobileNo = current.mobileNo.trim() || null;
  if ('gender' in dirty) {
    body.gender = (current.gender || null) as AstroGender | null;
  }
  if ('userStatus' in dirty) body.userStatus = Number(current.userStatus);
  if ('dob' in dirty) body.dob = current.dob.trim() || null;
  if ('birthPlace' in dirty) body.birthPlace = current.birthPlace.trim() || null;
  if ('birthTime' in dirty) body.birthTime = current.birthTime.trim() || null;
  if ('astroProfileStatus' in dirty && current.astroProfileStatus !== '') {
    body.astroProfileStatus = Number(current.astroProfileStatus);
  }
  if (current.profileImage) body.profileImage = current.profileImage;

  return body;
}

type Props = {
  open: boolean;
  user: AstroUserDetail;
  onClose: () => void;
  onSaved: (user: AstroUserDetail, message: string) => void;
  onError: (message: string) => void;
};

export default function EditAstroUserModal({
  open,
  user,
  onClose,
  onSaved,
  onError,
}: Props) {
  const [form, setForm] = useState<FormState>(() => toFormState(user));
  const [initial, setInitial] = useState<FormState>(() => toFormState(user));
  const [photoPreview, setPhotoPreview] = useState<string | null>(user.profilePhoto);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    const next = toFormState(user);
    setForm(next);
    setInitial(next);
    setPhotoPreview(user.profilePhoto);
  }, [open, user]);

  if (!open) return null;

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onPhotoChange = async (file: File | undefined) => {
    if (!file) return;
    try {
      const dataUrl = await fileToDataUrl(file);
      set('profileImage', dataUrl);
      setPhotoPreview(dataUrl);
    } catch {
      onError('Failed to read image file');
    }
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
      const res = await astroAPI.updateUser(user.userId, body);
      onSaved(res.data, res.message ?? 'Astro user profile updated');
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
        className={`${astroCard} flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden`}
      >
        <div className="border-b border-brand-100 px-6 py-4 dark:border-brand-900/40">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Edit user profile</h3>
          <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
            User #{user.userId} · only changed fields are sent
          </p>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-6 py-5">
          <div className="flex items-center gap-4">
            <AstroAvatar name={form.fullName || user.fullName} photo={photoPreview} size="lg" />
            <div>
              <label className={astroLabelClass}>Profile photo</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => void onPhotoChange(e.target.files?.[0])}
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
            <div>
              <label className={astroLabelClass}>Gender</label>
              <select
                value={form.gender}
                onChange={(e) => set('gender', e.target.value)}
                className={astroFieldClass}
              >
                <option value="">—</option>
                {GENDER_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={astroLabelClass}>Account status</label>
              <select
                value={form.userStatus}
                onChange={(e) => set('userStatus', e.target.value)}
                className={astroFieldClass}
              >
                <option value="1">Active</option>
                <option value="0">Deactivated</option>
              </select>
            </div>
          </div>

          <div className="rounded-xl border border-sky-100 bg-sky-50/40 p-4 dark:border-sky-900/40 dark:bg-sky-950/20">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white">Birth profile</h4>
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <label className={astroLabelClass}>Date of birth</label>
                <input
                  type="date"
                  value={form.dob}
                  onChange={(e) => set('dob', e.target.value)}
                  className={astroFieldClass}
                />
              </div>
              <div>
                <label className={astroLabelClass}>Birth place</label>
                <input
                  value={form.birthPlace}
                  onChange={(e) => set('birthPlace', e.target.value)}
                  className={astroFieldClass}
                />
              </div>
              <div>
                <label className={astroLabelClass}>Birth time (HH:mm)</label>
                <input
                  type="time"
                  value={form.birthTime}
                  onChange={(e) => set('birthTime', e.target.value)}
                  className={astroFieldClass}
                />
              </div>
            </div>
            {user.astroProfile && (
              <div className="mt-3">
                <label className={astroLabelClass}>Astro profile row status</label>
                <select
                  value={form.astroProfileStatus}
                  onChange={(e) => set('astroProfileStatus', e.target.value)}
                  className={astroFieldClass}
                >
                  <option value="">—</option>
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </select>
              </div>
            )}
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
