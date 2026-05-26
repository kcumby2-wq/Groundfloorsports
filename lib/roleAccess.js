export function getRoleFromClaims(sessionClaims) {
  const direct = sessionClaims?.metadata?.role;
  const publicMetadata = sessionClaims?.public_metadata?.role;
  const unsafeMetadata = sessionClaims?.unsafe_metadata?.role;
  const nestedPublic = sessionClaims?.metadata?.publicMetadata?.role;

  const role = direct || publicMetadata || unsafeMetadata || nestedPublic;
  return typeof role === 'string' ? role : 'fan';
}

export function hasRequiredRole(role, allowedRoles) {
  return allowedRoles.includes(role);
}
