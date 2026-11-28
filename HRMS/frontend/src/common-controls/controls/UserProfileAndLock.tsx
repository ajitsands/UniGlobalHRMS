import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  CheckCircle2,
  ChevronDown,
  Clock,
  Eye,
  EyeOff,
  KeyRound,
  Lock,
  LogOut,
  Mail,
  Moon,
  RefreshCw,
  ShieldCheck,
  Sun,
  Trash2,
  Unlock,
  Upload,
} from 'lucide-react';
import { PromptLogo } from './BrandAndLoader';
import { Modal } from './ContainersAndPopups';
import { Alert, Badge, Button, Tooltip } from './HelpAndFeedback';
import { useToast } from './ToastSystem';
import { useTheme } from '../tokens/ThemeContext';

export interface UserProfileInfo {
  userId: string;
  displayName: string;
  roleTitle: string;
  role: string;
  companyCr: string;
  companyLabel: string;
  email?: string;
}

interface StoredUserProfileRecord {
  avatarDataUrl?: string;
  email: string;
  password: string;
  updatedAtUtc?: string;
}

const USER_PROFILES_STORAGE_KEY = 'prompt_hrms_user_profiles_v1';
const DEMO_RESET_OTP = '482910';

function defaultEmailForUser(userId: string, displayName?: string): string {
  const cleanId = userId.trim().toUpperCase();
  if (cleanId === 'ADMIN-01') return 'ajit@uniglobal.bh';
  if (cleanId === 'HR-102') return 'amina@uniglobal.bh';
  if (cleanId === 'PAY-204') return 'khalid@uniglobal.bh';
  if (cleanId === 'EMP-1012') return 'fatima@uniglobal.bh';
  if (displayName) {
    const first = displayName.trim().split(/\s+/)[0]?.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (first) return `${first}@uniglobal.bh`;
  }
  return `${userId.trim().toLowerCase().replace(/[^a-z0-9._-]/g, '') || 'user'}@uniglobal.bh`;
}

function readAllProfiles(): Record<string, StoredUserProfileRecord> {
  try {
    const raw = localStorage.getItem(USER_PROFILES_STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, StoredUserProfileRecord>;
  } catch {
    return {};
  }
}

function writeAllProfiles(map: Record<string, StoredUserProfileRecord>): void {
  try {
    localStorage.setItem(USER_PROFILES_STORAGE_KEY, JSON.stringify(map));
    window.dispatchEvent(new CustomEvent('prompt-hrms-profile-updated'));
  } catch {
    // ignore storage quota errors
  }
}

export function getStoredUserProfile(
  userId: string,
  displayName?: string,
  fallbackEmail?: string
): StoredUserProfileRecord {
  const key = userId.trim().toUpperCase() || 'DEFAULT';
  const map = readAllProfiles();
  const existing = map[key];
  if (existing) return existing;
  return {
    email: fallbackEmail || defaultEmailForUser(userId, displayName),
    password: 'Prompt@2026',
  };
}

export function verifyStoredUserPassword(userId: string, candidatePassword: string): boolean {
  const rec = getStoredUserProfile(userId);
  return candidatePassword === rec.password;
}

export function saveStoredUserPassword(
  userId: string,
  newPassword: string,
  displayName?: string,
  emailOverride?: string
): StoredUserProfileRecord {
  const key = userId.trim().toUpperCase() || 'DEFAULT';
  const map = readAllProfiles();
  const current = getStoredUserProfile(userId, displayName, emailOverride);
  const updated: StoredUserProfileRecord = {
    ...current,
    email: emailOverride?.trim() || current.email,
    password: newPassword,
    updatedAtUtc: new Date().toISOString(),
  };
  map[key] = updated;
  writeAllProfiles(map);
  return updated;
}

export function saveStoredUserAvatar(
  userId: string,
  avatarDataUrl: string | undefined,
  displayName?: string
): StoredUserProfileRecord {
  const key = userId.trim().toUpperCase() || 'DEFAULT';
  const map = readAllProfiles();
  const current = getStoredUserProfile(userId, displayName);
  const updated: StoredUserProfileRecord = {
    ...current,
    avatarDataUrl,
    updatedAtUtc: new Date().toISOString(),
  };
  map[key] = updated;
  writeAllProfiles(map);
  return updated;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

function resizeImageFileToDataUrl(file: File, maxPx = 240): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Invalid image file'));
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = maxPx;
        canvas.height = maxPx;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(String(reader.result));
          return;
        }
        // Center-crop square
        const minSide = Math.min(img.width, img.height);
        const sx = Math.max(0, (img.width - minSide) / 2);
        const sy = Math.max(0, (img.height - minSide) / 2);
        ctx.drawImage(img, sx, sy, minSide, minSide, 0, 0, maxPx, maxPx);
        resolve(canvas.toDataURL('image/jpeg', 0.88));
      };
      img.src = String(reader.result);
    };
    reader.readAsDataURL(file);
  });
}

function computePasswordStrength(pw: string): { score: number; label: string; color: string } {
  if (!pw) return { score: 0, label: 'Enter password', color: 'var(--ug-muted)' };
  let score = 0;
  if (pw.length >= 6) score += 1;
  if (pw.length >= 10) score += 1;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score += 1;
  if (/\d/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score += 1;

  if (score <= 1) return { score: 1, label: 'Weak', color: 'var(--ug-danger)' };
  if (score === 2) return { score: 2, label: 'Fair', color: 'var(--ug-warning)' };
  if (score === 3) return { score: 3, label: 'Good', color: 'var(--ug-info)' };
  return { score: 4, label: 'Strong', color: 'var(--ug-success)' };
}

export interface UserAvatarBadgeProps {
  displayName: string;
  avatarDataUrl?: string;
  size?: number;
  statusColor?: string;
}

export const UserAvatarBadge: React.FC<UserAvatarBadgeProps> = ({
  displayName,
  avatarDataUrl,
  size = 30,
  statusColor,
}) => {
  return (
    <span
      style={{
        position: 'relative',
        width: size,
        height: size,
        borderRadius: '50%',
        display: 'inline-grid',
        placeItems: 'center',
        background: avatarDataUrl ? 'var(--ug-surface-alt)' : 'var(--ug-active-bg)',
        color: '#ffffff',
        fontWeight: 800,
        fontSize: Math.max(10, Math.round(size * 0.38)),
        letterSpacing: '0.4px',
        flexShrink: 0,
        boxShadow: '0 0 0 2px var(--ug-surface)',
        overflow: 'visible',
      }}
    >
      {avatarDataUrl ? (
        <img
          src={avatarDataUrl}
          alt={displayName}
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            objectFit: 'cover',
            display: 'block',
          }}
        />
      ) : (
        <span>{getInitials(displayName)}</span>
      )}
      {statusColor && (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: -1,
            insetInlineEnd: -1,
            width: Math.max(8, Math.round(size * 0.28)),
            height: Math.max(8, Math.round(size * 0.28)),
            borderRadius: '50%',
            background: statusColor,
            border: '2px solid var(--ug-surface)',
          }}
        />
      )}
    </span>
  );
};

/* ============================================================================
   3-STEP EMAIL + OTP PASSWORD RESET MODAL (Profile Dropdown & Lock Screen)
   Step 1: Enter Email & Send OTP -> Step 2: Verify 6-Digit OTP -> Step 3: Set New Password
   ============================================================================ */
export interface PasswordResetOtpModalProps {
  open: boolean;
  onClose: () => void;
  userId: string;
  displayName: string;
  initialEmail?: string;
  onPasswordUpdated?: (newPassword: string) => void;
}

export const PasswordResetOtpModal: React.FC<PasswordResetOtpModalProps> = ({
  open,
  onClose,
  userId,
  displayName,
  initialEmail,
  onPasswordUpdated,
}) => {
  const { language } = useTheme();
  const toast = useToast();
  const isAr = language === 'ar';

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [email, setEmail] = useState<string>('');
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState<number>(0);
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [showNewPw, setShowNewPw] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (open) {
      const rec = getStoredUserProfile(userId, displayName, initialEmail);
      setEmail(rec.email);
      setStep(1);
      setOtpDigits(['', '', '', '', '', '']);
      setCountdown(0);
      setNewPassword('');
      setConfirmPassword('');
      setShowNewPw(false);
      setErrorMsg('');
    }
  }, [open, userId, displayName, initialEmail]);

  useEffect(() => {
    if (!open || countdown <= 0) return;
    const t = window.setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => window.clearTimeout(t);
  }, [open, countdown]);

  const handleSendEmailOtp = (e?: React.FormEvent) => {
    e?.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes('@')) {
      setErrorMsg(isAr ? 'يرجى إدخال بريد إلكتروني صحيح.' : 'Please enter a valid corporate email address.');
      return;
    }
    setErrorMsg('');
    setStep(2);
    setOtpDigits(['', '', '', '', '', '']);
    setCountdown(59);
    toast.info(
      isAr ? 'تم إرسال رمز التحقق إلى البريد' : 'Email OTP Verification Sent',
      isAr
        ? `تم إرسال الرمز إلى ${trimmed} (رمز التجربة: ${DEMO_RESET_OTP})`
        : `6-digit OTP sent to ${trimmed} — Demo OTP: ${DEMO_RESET_OTP}`
    );
    window.setTimeout(() => otpRefs.current[0]?.focus(), 80);
  };

  const handleDigitChange = (idx: number, raw: string) => {
    const clean = raw.replace(/\D/g, '');
    if (clean.length > 1) {
      const chars = clean.slice(0, 6).split('');
      const next = [...otpDigits];
      chars.forEach((ch, i) => {
        if (idx + i < 6) next[idx + i] = ch;
      });
      setOtpDigits(next);
      otpRefs.current[Math.min(5, idx + chars.length)]?.focus();
      return;
    }
    const next = [...otpDigits];
    next[idx] = clean;
    setOtpDigits(next);
    if (clean && idx < 5) {
      otpRefs.current[idx + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleVerifyOtp = (e?: React.FormEvent) => {
    e?.preventDefault();
    const code = otpDigits.join('');
    if (code.length < 6) {
      setErrorMsg(isAr ? 'يرجى إدخال الرمز المكون من 6 أرقام.' : 'Please enter all 6 digits of the verification code.');
      return;
    }
    if (code !== DEMO_RESET_OTP) {
      setErrorMsg(
        isAr
          ? `الرمز غير صحيح. للتجربة استخدم الرمز ${DEMO_RESET_OTP}.`
          : `Invalid OTP code. Use ${DEMO_RESET_OTP} for verification.`
      );
      return;
    }
    setErrorMsg('');
    setStep(3);
    toast.success(
      isAr ? 'تم التحقق من الرمز بنجاح' : 'OTP Verified Successfully',
      isAr ? 'يمكنك الآن تعيين كلمة المرور الجديدة.' : 'Identity verified. Please enter your new password.'
    );
  };

  const handleSaveResetPassword = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      setErrorMsg(
        isAr ? 'يجب أن تتكون كلمة المرور من 6 أحرف على الأقل.' : 'New password must be at least 6 characters.'
      );
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg(isAr ? 'كلمتا المرور غير متطابقتين.' : 'New password and confirmation do not match.');
      return;
    }
    saveStoredUserPassword(userId, newPassword, displayName, email.trim());
    toast.success(
      isAr ? 'تم تغيير كلمة المرور بنجاح' : 'Password Reset Complete',
      isAr
        ? `تم تحديث كلمة المرور لحساب ${displayName}.`
        : `Your new password for ${displayName} (${userId}) is now active.`
    );
    onPasswordUpdated?.(newPassword);
    onClose();
  };

  const strength = computePasswordStrength(newPassword);

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title={isAr ? 'طلب إعادة تعيين كلمة المرور عبر البريد ورمز التحقق' : 'Reset Password via Email & OTP'}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Step Progress Indicator */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 8,
            padding: '10px 12px',
            borderRadius: 10,
            background: 'var(--ug-surface-alt)',
            border: '1px solid var(--ug-border)',
          }}
        >
          {[
            { n: 1, label: isAr ? '1. البريد الإلكتروني' : '1. Email Request' },
            { n: 2, label: isAr ? '2. رمز التحقق OTP' : '2. Verify OTP' },
            { n: 3, label: isAr ? '3. كلمة المرور الجديدة' : '3. New Password' },
          ].map((s) => {
            const active = step === s.n;
            const done = step > s.n;
            return (
              <div
                key={s.n}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  fontSize: '0.78rem',
                  fontWeight: active || done ? 700 : 500,
                  color: done ? 'var(--ug-success)' : active ? 'var(--ug-primary)' : 'var(--ug-muted)',
                }}
              >
                <span
                  style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    display: 'inline-grid',
                    placeItems: 'center',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    background: done
                      ? 'var(--ug-success)'
                      : active
                      ? 'var(--ug-active-bg)'
                      : 'var(--ug-border)',
                    color: done || active ? '#ffffff' : 'var(--ug-text-secondary)',
                    flexShrink: 0,
                  }}
                >
                  {done ? '✓' : s.n}
                </span>
                <span>{s.label}</span>
              </div>
            );
          })}
        </div>

        {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

        {step === 1 && (
          <form onSubmit={handleSendEmailOtp} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ fontSize: '0.88rem', color: 'var(--ug-text-secondary)', lineHeight: 1.5 }}>
              {isAr
                ? `أدخل البريد الإلكتروني المسجل لحساب ${displayName} لإرسال رمز التحقق المكون من 6 أرقام.`
                : `Confirm the registered corporate email for ${displayName} (${userId}). We will send a 6-digit one-time verification code.`}
            </div>

            <div className="ug-field">
              <label className="ug-label">
                {isAr ? 'البريد الإلكتروني المؤسسي' : 'Registered Corporate Email'} *
              </label>
              <div className="ug-input-wrap" style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Mail
                  size={16}
                  style={{ position: 'absolute', insetInlineStart: 12, color: 'var(--ug-muted)', pointerEvents: 'none' }}
                />
                <input
                  type="email"
                  className="ug-input"
                  style={{ paddingInlineStart: 36, width: '100%' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@uniglobal.bh"
                  required
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
              <Button type="button" variant="secondary" onClick={onClose}>
                {isAr ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button type="submit" variant="primary" icon={<Mail size={15} />}>
                {isAr ? 'إرسال رمز التحقق (OTP)' : 'Send OTP to Email'}
              </Button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Alert variant="info" title={isAr ? 'تم إرسال الرمز' : `OTP Sent to ${email}`}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                <span>
                  {isAr
                    ? `أدخل الرمز المكون من 6 أرقام (للتجربة: ${DEMO_RESET_OTP})`
                    : `Enter the 6-digit code sent to your inbox (Demo OTP: ${DEMO_RESET_OTP}).`}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setOtpDigits(DEMO_RESET_OTP.split(''));
                    setErrorMsg('');
                  }}
                  style={{
                    border: 'none',
                    borderRadius: 999,
                    padding: '3px 10px',
                    background: 'var(--ug-active-bg)',
                    color: '#ffffff',
                    fontSize: '0.76rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  {isAr ? 'تعبئة الرمز التجريبي' : `Fill Demo OTP (${DEMO_RESET_OTP})`}
                </button>
              </div>
            </Alert>

            <div dir="ltr" style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
              {otpDigits.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    otpRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={digit}
                  onChange={(e) => handleDigitChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  aria-label={`OTP digit ${idx + 1}`}
                  style={{
                    width: 44,
                    height: 50,
                    textAlign: 'center',
                    fontSize: '1.25rem',
                    fontWeight: 800,
                    borderRadius: 10,
                    border: digit ? '2px solid var(--ug-primary)' : '1px solid var(--ug-border-strong)',
                    background: 'var(--ug-surface)',
                    color: 'var(--ug-text)',
                    outline: 'none',
                  }}
                />
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
              <button
                type="button"
                className="ug-btn ug-btn-ghost ug-btn-sm"
                onClick={() => setStep(1)}
              >
                {isAr ? 'تعديل البريد الإلكتروني' : 'Change Email'}
              </button>
              {countdown > 0 ? (
                <span style={{ color: 'var(--ug-muted)' }}>
                  {isAr ? `إعادة الإرسال خلال ${countdown} ثانية` : `Resend available in ${countdown}s`}
                </span>
              ) : (
                <button
                  type="button"
                  className="ug-btn ug-btn-ghost ug-btn-sm"
                  onClick={() => handleSendEmailOtp()}
                >
                  <RefreshCw size={13} /> {isAr ? 'إعادة إرسال الرمز' : 'Resend OTP'}
                </button>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
              <Button type="button" variant="secondary" onClick={onClose}>
                {isAr ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button type="submit" variant="primary" icon={<ShieldCheck size={15} />}>
                {isAr ? 'تحقق ومتابعة' : 'Verify OTP & Continue'}
              </Button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleSaveResetPassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <Alert variant="success">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <CheckCircle2 size={16} />
                <span>
                  {isAr
                    ? `تم التحقق من البريد ${email}. يرجى إدخال كلمة المرور الجديدة.`
                    : `Verified ${email}. Set your new password below.`}
                </span>
              </div>
            </Alert>

            <div className="ug-field">
              <label className="ug-label">
                {isAr ? 'كلمة المرور الجديدة' : 'New Password'} *
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <input
                  type={showNewPw ? 'text' : 'password'}
                  className="ug-input"
                  style={{ width: '100%', paddingInlineEnd: 40 }}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min 6 chars)"
                  autoFocus
                  required
                />
                <button
                  type="button"
                  className="ug-icon-btn"
                  onClick={() => setShowNewPw((s) => !s)}
                  style={{ position: 'absolute', insetInlineEnd: 4 }}
                  aria-label="Toggle password visibility"
                >
                  {showNewPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, flex: 1 }}>
                  {[1, 2, 3, 4].map((bar) => (
                    <span
                      key={bar}
                      style={{
                        height: 4,
                        borderRadius: 999,
                        background: strength.score >= bar ? strength.color : 'var(--ug-border)',
                        transition: 'background 0.2s ease',
                      }}
                    />
                  ))}
                </div>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, color: strength.color }}>
                  {strength.label}
                </span>
              </div>
            </div>

            <div className="ug-field">
              <label className="ug-label">
                {isAr ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'} *
              </label>
              <input
                type={showNewPw ? 'text' : 'password'}
                className="ug-input"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
              />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 4 }}>
              <Button type="button" variant="secondary" onClick={onClose}>
                {isAr ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button type="submit" variant="primary" icon={<KeyRound size={15} />}>
                {isAr ? 'حفظ كلمة المرور الجديدة' : 'Update Password'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
};

/* ============================================================================
   HEADER PROFILE ICON & DROPDOWN MENU
   Includes: Avatar + Name, Change Profile Image, Change Password,
   Reset Password (Email + OTP), Lock Screen / Logoff, and Sign Out
   ============================================================================ */
export interface HeaderProfileMenuProps {
  user: UserProfileInfo;
  onLockScreen: () => void;
  onSignOut: () => void;
}

export const HeaderProfileMenu: React.FC<HeaderProfileMenuProps> = ({
  user,
  onLockScreen,
  onSignOut,
}) => {
  const { language, enableIdleTimeout, idleTimeoutMinutes } = useTheme();
  const toast = useToast();
  const isAr = language === 'ar';

  const [menuOpen, setMenuOpen] = useState<boolean>(false);
  const [profileRecord, setProfileRecord] = useState<StoredUserProfileRecord>(() =>
    getStoredUserProfile(user.userId, user.displayName, user.email)
  );

  // Modals
  const [photoModalOpen, setPhotoModalOpen] = useState<boolean>(false);
  const [draftAvatar, setDraftAvatar] = useState<string | undefined>(undefined);
  const [changePwModalOpen, setChangePwModalOpen] = useState<boolean>(false);
  const [resetOtpModalOpen, setResetOtpModalOpen] = useState<boolean>(false);

  // Direct Change Password Form State
  const [currentPw, setCurrentPw] = useState<string>('');
  const [nextPw, setNextPw] = useState<string>('');
  const [confirmNextPw, setConfirmNextPw] = useState<string>('');
  const [showPwFields, setShowPwFields] = useState<boolean>(false);
  const [pwError, setPwError] = useState<string>('');

  const wrapRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const syncProfile = () => {
      setProfileRecord(getStoredUserProfile(user.userId, user.displayName, user.email));
    };
    syncProfile();
    window.addEventListener('prompt-hrms-profile-updated', syncProfile);
    return () => window.removeEventListener('prompt-hrms-profile-updated', syncProfile);
  }, [user.userId, user.displayName, user.email]);

  useEffect(() => {
    const onDocDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocDown);
    return () => document.removeEventListener('mousedown', onDocDown);
  }, []);

  const openPhotoModal = () => {
    setDraftAvatar(profileRecord.avatarDataUrl);
    setMenuOpen(false);
    setPhotoModalOpen(true);
  };

  const handleFilePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.danger('Invalid File', 'Please select a PNG, JPG, or WebP image file.');
      return;
    }
    try {
      const resized = await resizeImageFileToDataUrl(file, 240);
      setDraftAvatar(resized);
    } catch {
      toast.danger('Image Upload Error', 'Could not process the selected image.');
    } finally {
      e.target.value = '';
    }
  };

  const handleSavePhoto = () => {
    const saved = saveStoredUserAvatar(user.userId, draftAvatar, user.displayName);
    setProfileRecord(saved);
    setPhotoModalOpen(false);
    toast.success(
      isAr ? 'تم تحديث الصورة الشخصية' : 'Profile Image Updated',
      draftAvatar
        ? `${user.displayName}'s profile photo has been saved.`
        : `Reverted ${user.displayName}'s avatar to initials.`
    );
  };

  const openChangePasswordModal = () => {
    setCurrentPw('');
    setNextPw('');
    setConfirmNextPw('');
    setPwError('');
    setShowPwFields(false);
    setMenuOpen(false);
    setChangePwModalOpen(true);
  };

  const handleDirectChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyStoredUserPassword(user.userId, currentPw)) {
      setPwError(
        isAr
          ? 'كلمة المرور الحالية غير صحيحة. يمكنك استخدام خيار إعادة التعيين عبر البريد ورمز OTP.'
          : 'Current password is incorrect. (Default is Prompt@2026, or use Reset via Email OTP).'
      );
      return;
    }
    if (!nextPw || nextPw.length < 6) {
      setPwError(isAr ? 'يجب أن تكون كلمة المرور الجديدة 6 أحرف على الأقل.' : 'New password must be at least 6 characters.');
      return;
    }
    if (nextPw !== confirmNextPw) {
      setPwError(isAr ? 'كلمتا المرور غير متطابقتين.' : 'New password and confirmation do not match.');
      return;
    }
    const updated = saveStoredUserPassword(user.userId, nextPw, user.displayName);
    setProfileRecord(updated);
    setChangePwModalOpen(false);
    toast.success(
      isAr ? 'تم تغيير كلمة المرور' : 'Password Changed Successfully',
      isAr ? 'تم تحديث كلمة المرور الخاصة بك.' : 'Your updated password is active for Login and Lock Screen.'
    );
  };

  const pwStrength = computePasswordStrength(nextPw);

  return (
    <div ref={wrapRef} style={{ position: 'relative', display: 'inline-flex' }}>
      <Tooltip
        content={
          isAr
            ? `${user.displayName} (${user.roleTitle}) — الملف الشخصي، كلمة المرور، قفل الشاشة والخروج`
            : `${user.displayName} (${user.userId} • ${user.companyCr}) — Profile, Password, Lock Screen & Sign Out`
        }
        theme="primary"
        placement="bottom"
      >
        <button
          type="button"
          onClick={() => setMenuOpen((o) => !o)}
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          aria-label="User Profile Menu"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            height: 34,
            padding: '2px 10px 2px 4px',
            borderRadius: 999,
            border: menuOpen ? '1.5px solid var(--ug-primary)' : '1px solid var(--ug-border-strong)',
            background: 'var(--ug-surface)',
            color: 'var(--ug-text)',
            cursor: 'pointer',
            fontFamily: 'inherit',
            fontSize: '0.84rem',
            fontWeight: 700,
            transition: 'all 0.16s ease',
          }}
        >
          <UserAvatarBadge
            displayName={user.displayName}
            avatarDataUrl={profileRecord.avatarDataUrl}
            size={26}
            statusColor="#10b981"
          />
          <span
            className="ug-hide-mobile"
            style={{
              maxWidth: 112,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {user.displayName.split(' ')[0]}
          </span>
          <ChevronDown size={13} style={{ color: 'var(--ug-muted)' }} />
        </button>
      </Tooltip>

      {menuOpen && (
        <div
          role="menu"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            insetInlineEnd: 0,
            width: 308,
            background: 'var(--ug-surface)',
            color: 'var(--ug-text)',
            border: '1px solid var(--ug-border-strong)',
            borderRadius: 14,
            boxShadow: '0 20px 44px rgba(0, 0, 0, 0.22)',
            zIndex: 260,
            overflow: 'hidden',
          }}
        >
          {/* User Identity Card */}
          <div
            style={{
              padding: '14px 16px',
              background: 'var(--ug-surface-alt)',
              borderBottom: '1px solid var(--ug-border)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <button
              type="button"
              onClick={openPhotoModal}
              title={isAr ? 'تغيير الصورة الشخصية' : 'Click to change profile photo'}
              style={{
                position: 'relative',
                border: 'none',
                background: 'transparent',
                padding: 0,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              <UserAvatarBadge
                displayName={user.displayName}
                avatarDataUrl={profileRecord.avatarDataUrl}
                size={48}
                statusColor="#10b981"
              />
              <span
                style={{
                  position: 'absolute',
                  bottom: -2,
                  insetInlineStart: -2,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  background: 'var(--ug-active-bg)',
                  color: '#ffffff',
                  display: 'grid',
                  placeItems: 'center',
                  border: '2px solid var(--ug-surface)',
                }}
              >
                <Camera size={10} />
              </span>
            </button>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <strong
                  style={{
                    fontSize: '0.95rem',
                    color: 'var(--ug-text)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user.displayName}
                </strong>
                <Badge variant="primary">{user.role}</Badge>
              </div>
              <div style={{ fontSize: '0.76rem', color: 'var(--ug-text-secondary)', marginTop: 2 }}>
                {user.userId} • {user.companyCr}
              </div>
              <div
                style={{
                  fontSize: '0.74rem',
                  color: 'var(--ug-muted)',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {profileRecord.email}
              </div>
            </div>
          </div>

          {/* Profile & Security Action Items */}
          <div style={{ padding: 8, display: 'flex', flexDirection: 'column', gap: 3 }}>
            <button
              type="button"
              role="menuitem"
              className="ug-nav-item"
              onClick={openPhotoModal}
              style={{ justifyContent: 'flex-start', padding: '9px 12px', fontSize: '0.86rem' }}
            >
              <Camera size={15} style={{ color: 'var(--ug-primary)', flexShrink: 0 }} />
              <span>{isAr ? 'تغيير الصورة الشخصية' : 'Change Profile Image'}</span>
            </button>

            <button
              type="button"
              role="menuitem"
              className="ug-nav-item"
              onClick={openChangePasswordModal}
              style={{ justifyContent: 'flex-start', padding: '9px 12px', fontSize: '0.86rem' }}
            >
              <KeyRound size={15} style={{ color: 'var(--ug-primary)', flexShrink: 0 }} />
              <span>{isAr ? 'تغيير كلمة المرور' : 'Change Password'}</span>
            </button>

            <button
              type="button"
              role="menuitem"
              className="ug-nav-item"
              onClick={() => {
                setMenuOpen(false);
                setResetOtpModalOpen(true);
              }}
              style={{ justifyContent: 'flex-start', padding: '9px 12px', fontSize: '0.86rem' }}
            >
              <Mail size={15} style={{ color: 'var(--ug-primary)', flexShrink: 0 }} />
              <span>{isAr ? 'طلب إعادة تعيين كلمة المرور (OTP)' : 'Reset Password (Email + OTP)'}</span>
            </button>

            <button
              type="button"
              role="menuitem"
              className="ug-nav-item"
              onClick={() => {
                setMenuOpen(false);
                onLockScreen();
              }}
              style={{ justifyContent: 'space-between', padding: '9px 12px', fontSize: '0.86rem' }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 10 }}>
                <Lock size={15} style={{ color: 'var(--ug-warning)', flexShrink: 0 }} />
                <span>{isAr ? 'قفل الشاشة / إيقاف الجلسة مؤقتاً' : 'Lock Screen / Logoff'}</span>
              </span>
              {enableIdleTimeout && (
                <span
                  style={{
                    fontSize: '0.7rem',
                    padding: '2px 7px',
                    borderRadius: 999,
                    background: 'var(--ug-primary-soft)',
                    color: 'var(--ug-primary)',
                    fontWeight: 700,
                  }}
                >
                  {idleTimeoutMinutes}m auto
                </span>
              )}
            </button>
          </div>

          {/* Danger Sign Out Action */}
          <div
            style={{
              padding: '8px 10px 10px',
              borderTop: '1px solid var(--ug-border)',
              background: 'var(--ug-surface)',
            }}
          >
            <Button
              type="button"
              variant="danger-ghost"
              size="sm"
              icon={<LogOut size={15} />}
              onClick={() => {
                setMenuOpen(false);
                onSignOut();
              }}
              style={{
                width: '100%',
                justifyContent: 'center',
                border: '1px solid color-mix(in srgb, var(--ug-danger) 30%, transparent)',
              }}
            >
              {isAr ? 'تسجيل الخروج الكامل' : 'Sign Out'}
            </Button>
          </div>
        </div>
      )}

      {/* Modal 1: Change Profile Image */}
      <Modal
        open={photoModalOpen}
        onClose={() => setPhotoModalOpen(false)}
        size="sm"
        title={isAr ? 'تحديث الصورة الشخصية' : 'Update Profile Image'}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', gap: 8 }}>
            {draftAvatar ? (
              <Button
                type="button"
                variant="danger-ghost"
                size="sm"
                icon={<Trash2 size={14} />}
                onClick={() => setDraftAvatar(undefined)}
              >
                {isAr ? 'حذف الصورة' : 'Remove Photo'}
              </Button>
            ) : (
              <span />
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <Button type="button" variant="secondary" size="sm" onClick={() => setPhotoModalOpen(false)}>
                {isAr ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button type="button" variant="primary" size="sm" onClick={handleSavePhoto}>
                {isAr ? 'حفظ الصورة' : 'Save Photo'}
              </Button>
            </div>
          </div>
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '6px 0' }}>
          <UserAvatarBadge
            displayName={user.displayName}
            avatarDataUrl={draftAvatar}
            size={96}
            statusColor="#10b981"
          />
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 700, fontSize: '0.96rem' }}>{user.displayName}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--ug-muted)' }}>
              {user.roleTitle} • {user.userId}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={handleFilePicked}
            style={{ display: 'none' }}
          />
          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={<Upload size={15} />}
            onClick={() => fileInputRef.current?.click()}
          >
            {isAr ? 'اختيار صورة من الجهاز (PNG / JPG)' : 'Upload New Photo (PNG / JPG / WebP)'}
          </Button>
        </div>
      </Modal>

      {/* Modal 2: Direct Change Password */}
      <Modal
        open={changePwModalOpen}
        onClose={() => setChangePwModalOpen(false)}
        size="sm"
        title={isAr ? 'تغيير كلمة المرور' : 'Change Password'}
      >
        <form onSubmit={handleDirectChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {pwError && <Alert variant="danger">{pwError}</Alert>}

          <div className="ug-field">
            <label className="ug-label">
              {isAr ? 'كلمة المرور الحالية' : 'Current Password'} *
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <input
                type={showPwFields ? 'text' : 'password'}
                className="ug-input"
                style={{ width: '100%', paddingInlineEnd: 40 }}
                value={currentPw}
                onChange={(e) => setCurrentPw(e.target.value)}
                placeholder="Enter current password"
                required
              />
              <button
                type="button"
                className="ug-icon-btn"
                onClick={() => setShowPwFields((s) => !s)}
                style={{ position: 'absolute', insetInlineEnd: 4 }}
                aria-label="Toggle password visibility"
              >
                {showPwFields ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <div className="ug-field">
            <label className="ug-label">
              {isAr ? 'كلمة المرور الجديدة' : 'New Password'} *
            </label>
            <input
              type={showPwFields ? 'text' : 'password'}
              className="ug-input"
              value={nextPw}
              onChange={(e) => setNextPw(e.target.value)}
              placeholder="Minimum 6 characters"
              required
            />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4, flex: 1 }}>
                {[1, 2, 3, 4].map((bar) => (
                  <span
                    key={bar}
                    style={{
                      height: 4,
                      borderRadius: 999,
                      background: pwStrength.score >= bar ? pwStrength.color : 'var(--ug-border)',
                    }}
                  />
                ))}
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: pwStrength.color }}>
                {pwStrength.label}
              </span>
            </div>
          </div>

          <div className="ug-field">
            <label className="ug-label">
              {isAr ? 'تأكيد كلمة المرور الجديدة' : 'Confirm New Password'} *
            </label>
            <input
              type={showPwFields ? 'text' : 'password'}
              className="ug-input"
              value={confirmNextPw}
              onChange={(e) => setConfirmNextPw(e.target.value)}
              placeholder="Re-enter new password"
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
            <button
              type="button"
              className="ug-btn ug-btn-ghost ug-btn-sm"
              onClick={() => {
                setChangePwModalOpen(false);
                setResetOtpModalOpen(true);
              }}
              style={{ color: 'var(--ug-primary)', padding: '4px 6px' }}
            >
              {isAr ? 'نسيت كلمة المرور؟ أرسل OTP' : 'Forgot? Reset via Email OTP'}
            </button>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button type="button" variant="secondary" size="sm" onClick={() => setChangePwModalOpen(false)}>
                {isAr ? 'إلغاء' : 'Cancel'}
              </Button>
              <Button type="submit" variant="primary" size="sm" icon={<KeyRound size={14} />}>
                {isAr ? 'حفظ' : 'Save Password'}
              </Button>
            </div>
          </div>
        </form>
      </Modal>

      {/* Modal 3: 3-Step Request / Reset Password via Email + OTP */}
      <PasswordResetOtpModal
        open={resetOtpModalOpen}
        onClose={() => setResetOtpModalOpen(false)}
        userId={user.userId}
        displayName={user.displayName}
        initialEmail={profileRecord.email}
      />
    </div>
  );
};

/* ============================================================================
   FULL-SCREEN SESSION LOCK / LOGOFF OVERLAY
   Unlocks with Password and returns immediately to the exact Last-Used Page
   ============================================================================ */
export interface SessionLockScreenProps {
  user: UserProfileInfo;
  lockReason: 'manual' | 'idle';
  lockedAtIso: string;
  lastPageLabel: string;
  idleMinutesConfigured: number;
  onUnlock: () => void;
  onFullSignOut: () => void;
}

export const SessionLockScreen: React.FC<SessionLockScreenProps> = ({
  user,
  lockReason,
  lockedAtIso,
  lastPageLabel,
  idleMinutesConfigured,
  onUnlock,
  onFullSignOut,
}) => {
  const {
    language,
    setLanguage,
    isDarkTheme,
    toggleDarkMode,
    formatDate,
    formatTime,
    formatDateTime,
    timeZone,
  } = useTheme();
  const toast = useToast();
  const isAr = language === 'ar';

  const [password, setPassword] = useState<string>('');
  const [showPw, setShowPw] = useState<boolean>(false);
  const [capsLock, setCapsLock] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [resetModalOpen, setResetModalOpen] = useState<boolean>(false);
  const [now, setNow] = useState<Date>(() => new Date());
  const [profileRecord, setProfileRecord] = useState<StoredUserProfileRecord>(() =>
    getStoredUserProfile(user.userId, user.displayName, user.email)
  );

  useEffect(() => {
    const syncProfile = () => {
      setProfileRecord(getStoredUserProfile(user.userId, user.displayName, user.email));
    };
    window.addEventListener('prompt-hrms-profile-updated', syncProfile);
    return () => window.removeEventListener('prompt-hrms-profile-updated', syncProfile);
  }, [user.userId, user.displayName, user.email]);

  useEffect(() => {
    const t = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const handleUnlockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setErrorMsg(isAr ? 'يرجى إدخال كلمة المرور لفتح الجلسة.' : 'Please enter your password to resume your session.');
      return;
    }
    if (!verifyStoredUserPassword(user.userId, password)) {
      setErrorMsg(
        isAr
          ? 'كلمة المرور غير صحيحة. حاول مرة أخرى أو استخدم إعادة التعيين عبر البريد ورمز OTP.'
          : 'Incorrect password. Try again (default: Prompt@2026) or click Reset Password via Email OTP.'
      );
      return;
    }
    setErrorMsg('');
    setPassword('');
    toast.success(
      isAr ? 'تم فتح الجلسة بنجاح' : 'Session Unlocked',
      isAr ? `تمت العودة إلى صفحة: ${lastPageLabel}` : `Resumed your exact last page: ${lastPageLabel}`
    );
    onUnlock();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Session Locked"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 900,
        background: isDarkTheme
          ? 'radial-gradient(circle at top, color-mix(in srgb, var(--ug-primary) 22%, #0b0f14) 0%, #0b0f14 68%)'
          : 'radial-gradient(circle at top, color-mix(in srgb, var(--ug-primary) 13%, #f6f7f9) 0%, #f6f7f9 68%)',
        color: 'var(--ug-text)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '20px 24px',
        overflowY: 'auto',
      }}
    >
      {/* Top Bar: Prompt Logo + Live Clock + Theme / Language */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <PromptLogo variant={isDarkTheme ? 'white' : 'color'} height={38} badgeText="HRMS" />

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 12px',
              borderRadius: 999,
              background: 'var(--ug-surface)',
              border: '1px solid var(--ug-border)',
              fontSize: '0.8rem',
              fontWeight: 600,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            <Clock size={14} style={{ color: 'var(--ug-primary)' }} />
            {formatDate(now)} • {formatTime(now, true)} ({timeZone})
          </span>

          <Button
            type="button"
            variant="secondary"
            size="sm"
            icon={isDarkTheme ? <Sun size={14} style={{ color: '#f59e0b' }} /> : <Moon size={14} />}
            onClick={toggleDarkMode}
            aria-label="Toggle Light or Dark Mode"
          />

          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setLanguage(isAr ? 'en' : 'ar')}
          >
            {isAr ? 'English' : 'العربية'}
          </Button>
        </div>
      </div>

      {/* Center Session Lock Card */}
      <div
        style={{
          width: '100%',
          maxWidth: 440,
          margin: '24px auto',
          background: 'var(--ug-surface)',
          border: '1px solid var(--ug-border-strong)',
          borderRadius: 20,
          padding: '28px 26px',
          boxShadow: '0 24px 56px rgba(0, 0, 0, 0.22)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 16,
        }}
      >
        <Badge variant={lockReason === 'idle' ? 'warning' : 'primary'}>
          <Lock size={12} />
          {lockReason === 'idle'
            ? isAr
              ? `تم إيقاف الجلسة تلقائياً بعد خمول ${idleMinutesConfigured} دقيقة`
              : `Auto-Logoff after ${idleMinutesConfigured} min Inactivity`
            : isAr
            ? 'الشاشة مقفلة مؤقتاً'
            : 'Session Locked by User'}
        </Badge>

        <UserAvatarBadge
          displayName={user.displayName}
          avatarDataUrl={profileRecord.avatarDataUrl}
          size={80}
          statusColor="#f59e0b"
        />

        <div style={{ textAlign: 'center' }}>
          <h2 style={{ margin: 0, fontSize: '1.28rem', fontWeight: 800, color: 'var(--ug-text)' }}>
            {user.displayName}
          </h2>
          <div style={{ fontSize: '0.84rem', color: 'var(--ug-text-secondary)', marginTop: 3 }}>
            {user.roleTitle} • {user.userId} ({user.companyCr})
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--ug-muted)', marginTop: 3 }}>
            {isAr ? 'وقت القفل:' : 'Locked at:'} {formatDateTime(lockedAtIso)}
          </div>
        </div>

        {/* Last Used Page Indicator */}
        <div
          style={{
            width: '100%',
            padding: '9px 12px',
            borderRadius: 10,
            background: 'var(--ug-primary-soft)',
            border: '1px solid color-mix(in srgb, var(--ug-primary) 28%, transparent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            fontSize: '0.82rem',
          }}
        >
          <span style={{ color: 'var(--ug-text-secondary)', fontWeight: 600 }}>
            {isAr ? 'العودة إلى آخر صفحة:' : 'Resume Last Page:'}
          </span>
          <strong style={{ color: 'var(--ug-primary)' }}>{lastPageLabel}</strong>
        </div>

        {errorMsg && (
          <div style={{ width: '100%' }}>
            <Alert variant="danger">{errorMsg}</Alert>
          </div>
        )}

        <form
          onSubmit={handleUnlockSubmit}
          style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 12 }}
        >
          <div className="ug-field">
            <label className="ug-label">
              {isAr ? 'أدخل كلمة المرور للمتابعة' : 'Enter Password to Resume'}
            </label>
            <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
              <KeyRound
                size={16}
                style={{ position: 'absolute', insetInlineStart: 12, color: 'var(--ug-muted)', pointerEvents: 'none' }}
              />
              <input
                type={showPw ? 'text' : 'password'}
                className="ug-input"
                style={{ width: '100%', paddingInlineStart: 36, paddingInlineEnd: 40, height: 42 }}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyUp={(e) => setCapsLock(e.getModifierState('CapsLock'))}
                placeholder={isAr ? 'كلمة المرور...' : 'Enter your password...'}
                autoFocus
              />
              <button
                type="button"
                className="ug-icon-btn"
                onClick={() => setShowPw((s) => !s)}
                style={{ position: 'absolute', insetInlineEnd: 4 }}
                aria-label="Show or hide password"
              >
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            {capsLock && (
              <span style={{ fontSize: '0.74rem', color: 'var(--ug-warning)', fontWeight: 600, marginTop: 4 }}>
                {isAr ? 'تنبيه: مفتاح الأحرف الكبيرة (Caps Lock) قيد التشغيل' : 'Caps Lock is ON'}
              </span>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            icon={<Unlock size={16} />}
            style={{ width: '100%', justifyContent: 'center' }}
          >
            {isAr ? `فتح والعودة إلى (${lastPageLabel})` : `Unlock & Resume ${lastPageLabel}`}
          </Button>
        </form>

        <div
          style={{
            width: '100%',
            paddingTop: 10,
            borderTop: '1px solid var(--ug-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 8,
            flexWrap: 'wrap',
          }}
        >
          <button
            type="button"
            className="ug-btn ug-btn-ghost ug-btn-sm"
            onClick={() => setResetModalOpen(true)}
            style={{ color: 'var(--ug-primary)', padding: '4px 8px' }}
          >
            <Mail size={14} />
            {isAr ? 'إعادة تعيين كلمة المرور (OTP)' : 'Reset Password (OTP)'}
          </button>

          <Button
            type="button"
            variant="danger-ghost"
            size="sm"
            icon={<LogOut size={14} />}
            onClick={onFullSignOut}
          >
            {isAr ? 'تبديل المستخدم / خروج' : 'Switch User / Sign Out'}
          </Button>
        </div>
      </div>

      {/* Footer Credits */}
      <div style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--ug-muted)' }}>
        © {new Date().getFullYear()} <strong>UniGlobal Consultancy Services W.L.L.</strong> • Engineered by{' '}
        <strong>SaNDS Lab Middle East W.L.L.</strong>
      </div>

      <PasswordResetOtpModal
        open={resetModalOpen}
        onClose={() => setResetModalOpen(false)}
        userId={user.userId}
        displayName={user.displayName}
        initialEmail={profileRecord.email}
        onPasswordUpdated={(updatedPw) => {
          setPassword(updatedPw);
          setErrorMsg('');
        }}
      />
    </div>
  );
};
