import { buildPermissionsPolicyHeader } from '../lib/headers/permissionsPolicy.js';

export function setPermissionsPolicyHeader(req, res) {
  const header = buildPermissionsPolicyHeader();
  res.setHeader('Permissions-Policy', header);
}
