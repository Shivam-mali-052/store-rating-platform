export function validateEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePassword(password: string): boolean {
  if (password.length < 8 || password.length > 16) return false;
  const hasUpper = /[A-Z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  return hasUpper && hasSpecial;
}

export function validateName(name: string): boolean {
  return name.length >= 20 && name.length <= 60;
}

export function validateAddress(address: string): boolean {
  return address.length <= 400;
}
