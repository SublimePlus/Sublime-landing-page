/**
 * Checks edited website content against the shape the site was built with.
 *
 * The components read fixed fields from content/site.json, so an edit may
 * change any text and add or remove list items, but must not add, drop or
 * retype a field — a missing field would render as blank and a wrong type
 * could fail the build. `reference` is the content bundled with this deploy.
 */
export function validateSiteContent(value: unknown, reference: unknown, path = "content"): string | null {
  if (typeof reference === "string") {
    if (typeof value !== "string") return `${path} must be text.`;
    if (value.length > 5000) return `${path} is too long.`;
    return null;
  }
  if (typeof reference === "boolean") {
    return typeof value === "boolean" ? null : `${path} must be on or off.`;
  }
  if (Array.isArray(reference)) {
    if (!Array.isArray(value)) return `${path} must be a list.`;
    if (value.length > 50) return `${path} has too many items.`;
    const template = reference[0];
    if (template === undefined) return null;
    for (let i = 0; i < value.length; i++) {
      const problem = validateSiteContent(value[i], template, `${path}[${i + 1}]`);
      if (problem) return problem;
    }
    return null;
  }
  if (reference && typeof reference === "object") {
    if (!value || typeof value !== "object" || Array.isArray(value)) return `${path} is malformed.`;
    const refKeys = Object.keys(reference);
    const keys = Object.keys(value);
    if (keys.length !== refKeys.length || !refKeys.every((k) => k in value)) {
      return `${path} has missing or unexpected fields.`;
    }
    for (const key of refKeys) {
      const problem = validateSiteContent(
        (value as Record<string, unknown>)[key],
        (reference as Record<string, unknown>)[key],
        `${path}.${key}`
      );
      if (problem) return problem;
    }
    return null;
  }
  return `${path} has an unsupported value.`;
}
