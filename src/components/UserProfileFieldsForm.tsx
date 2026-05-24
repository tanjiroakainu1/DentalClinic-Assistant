import type { User, UserGender, UserRole } from '../types';
import { GENDER_OPTIONS, PH_PROVINCES } from '../lib/userProfile';
import { Input, Select, Textarea } from './ui';

export type UserProfileFormState = {
  phone: string;
  address: string;
  city: string;
  province: string;
  zipCode: string;
  dateOfBirth: string;
  gender: UserGender | '';
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
  specialization: string;
  licenseNumber: string;
  yearsExperience: string;
  department: string;
  employeeId: string;
  bio: string;
};

export const emptyUserProfileForm = (): UserProfileFormState => ({
  phone: '',
  address: '',
  city: '',
  province: 'Metro Manila',
  zipCode: '',
  dateOfBirth: '',
  gender: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  emergencyContactRelation: '',
  specialization: '',
  licenseNumber: '',
  yearsExperience: '',
  department: '',
  employeeId: '',
  bio: '',
});

export function userToProfileForm(user: Partial<User>): UserProfileFormState {
  const base = emptyUserProfileForm();
  return {
    ...base,
    phone: user.phone ?? '',
    address: user.address ?? '',
    city: user.city ?? '',
    province: user.province ?? base.province,
    zipCode: user.zipCode ?? '',
    dateOfBirth: user.dateOfBirth ?? '',
    gender: user.gender ?? '',
    emergencyContactName: user.emergencyContactName ?? '',
    emergencyContactPhone: user.emergencyContactPhone ?? '',
    emergencyContactRelation: user.emergencyContactRelation ?? '',
    specialization: user.specialization ?? '',
    licenseNumber: user.licenseNumber ?? '',
    yearsExperience: user.yearsExperience != null ? String(user.yearsExperience) : '',
    department: user.department ?? '',
    employeeId: user.employeeId ?? '',
    bio: user.bio ?? '',
  };
}

export function profileFormToPayload(form: UserProfileFormState) {
  return {
    phone: form.phone,
    address: form.address,
    city: form.city,
    province: form.province,
    zipCode: form.zipCode,
    dateOfBirth: form.dateOfBirth || undefined,
    gender: (form.gender || undefined) as UserGender | undefined,
    emergencyContactName: form.emergencyContactName,
    emergencyContactPhone: form.emergencyContactPhone,
    emergencyContactRelation: form.emergencyContactRelation,
    specialization: form.specialization,
    licenseNumber: form.licenseNumber,
    yearsExperience: form.yearsExperience ? Number(form.yearsExperience) : undefined,
    department: form.department,
    employeeId: form.employeeId,
    bio: form.bio,
  };
}

export function UserProfileFieldsForm({
  role,
  form,
  onChange,
  showEmergency = true,
}: {
  role: UserRole;
  form: UserProfileFormState;
  onChange: (next: UserProfileFormState) => void;
  showEmergency?: boolean;
}) {
  const set = <K extends keyof UserProfileFormState>(key: K, value: UserProfileFormState[K]) => {
    onChange({ ...form, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Phone"
          type="tel"
          value={form.phone}
          onChange={(e) => set('phone', e.target.value)}
          placeholder="09XX XXX XXXX"
        />
        <Input
          label="Date of Birth"
          type="date"
          value={form.dateOfBirth}
          onChange={(e) => set('dateOfBirth', e.target.value)}
        />
      </div>

      {(role === 'patient' || role === 'admin') && (
        <Select label="Gender" value={form.gender} onChange={(e) => set('gender', e.target.value as UserGender | '')}>
          <option value="">Select…</option>
          {GENDER_OPTIONS.map((g) => (
            <option key={g.value} value={g.value ?? ''}>
              {g.label}
            </option>
          ))}
        </Select>
      )}

      <Textarea
        label="Street Address"
        value={form.address}
        onChange={(e) => set('address', e.target.value)}
        rows={2}
      />
      <div className="grid gap-4 sm:grid-cols-3">
        <Input label="City" value={form.city} onChange={(e) => set('city', e.target.value)} />
        <Select label="Province" value={form.province} onChange={(e) => set('province', e.target.value)}>
          {PH_PROVINCES.map((p) => (
            <option key={p} value={p}>
              {p}
            </option>
          ))}
        </Select>
        <Input label="ZIP" value={form.zipCode} onChange={(e) => set('zipCode', e.target.value)} />
      </div>

      {role === 'doctor' && (
        <>
          <Input
            label="Specialization"
            value={form.specialization}
            onChange={(e) => set('specialization', e.target.value)}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="PRC License No."
              value={form.licenseNumber}
              onChange={(e) => set('licenseNumber', e.target.value)}
            />
            <Input
              label="Years of Experience"
              type="number"
              min={0}
              value={form.yearsExperience}
              onChange={(e) => set('yearsExperience', e.target.value)}
            />
          </div>
        </>
      )}

      {role === 'admin' && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Department" value={form.department} onChange={(e) => set('department', e.target.value)} />
          <Input label="Employee ID" value={form.employeeId} onChange={(e) => set('employeeId', e.target.value)} />
        </div>
      )}

      {showEmergency && (role === 'patient' || role === 'doctor' || role === 'admin') && (
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-candy-200/90">Emergency contact</p>
          <Input
            label="Name"
            value={form.emergencyContactName}
            onChange={(e) => set('emergencyContactName', e.target.value)}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Phone"
              type="tel"
              value={form.emergencyContactPhone}
              onChange={(e) => set('emergencyContactPhone', e.target.value)}
            />
            <Input
              label="Relationship"
              value={form.emergencyContactRelation}
              onChange={(e) => set('emergencyContactRelation', e.target.value)}
            />
          </div>
        </div>
      )}

      <Textarea
        label="Bio / Notes"
        value={form.bio}
        onChange={(e) => set('bio', e.target.value)}
        rows={3}
        placeholder="Short profile visible to clinic staff"
      />
    </div>
  );
}
