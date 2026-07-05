export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_MAX_LENGTH = 20;

/** Keep in sync with expentra/src/core/validators/password-policy.decorator.ts */
export const PASSWORD_SPECIAL_CHARS = String.raw`!@#$%^&*(),.?":{}|<>`;

export function hasPasswordLowercase(value: string): boolean {
  return /[a-z]/.test(value);
}

export function hasPasswordUppercase(value: string): boolean {
  return /[A-Z]/.test(value);
}

export function hasPasswordNumber(value: string): boolean {
  return /\d/.test(value);
}

export function hasPasswordSpecialChar(value: string): boolean {
  return [...PASSWORD_SPECIAL_CHARS].some((char) => value.includes(char));
}

export function isPasswordPolicyMet(value: string): boolean {
  return (
    value.length >= PASSWORD_MIN_LENGTH &&
    value.length <= PASSWORD_MAX_LENGTH &&
    hasPasswordLowercase(value) &&
    hasPasswordUppercase(value) &&
    hasPasswordNumber(value) &&
    hasPasswordSpecialChar(value)
  );
}

export type PasswordCriterion = {
  label: string;
  isMet: boolean;
};

export function passwordCriteria(value: string): PasswordCriterion[] {
  return [
    { label: '8 character', isMet: value.length >= PASSWORD_MIN_LENGTH },
    { label: 'Numbers', isMet: hasPasswordNumber(value) },
    { label: 'One special character', isMet: hasPasswordSpecialChar(value) },
    { label: 'One uppercase', isMet: hasPasswordUppercase(value) },
  ];
}
