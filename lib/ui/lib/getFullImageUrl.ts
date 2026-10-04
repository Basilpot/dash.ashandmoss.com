export const getFullImageUrl = (url: string): string => {
  if (!url) return "";

  if (url.startsWith("http://") || url.startsWith("https://")) {
    // Stored media URLs point straight at the API host. A dashboard <img> for one
    // of those is a cross-origin request carrying no session, so the API cannot
    // tell which tenant asked and 404s. Re-pointing it at our own /api proxy
    // means the request is same-origin and rides along with the admin cookie.
    //
    // The path is not always rooted at /uploads: production stores absolute URLs
    // that include the API prefix (https://host/api/v1/uploads/...). Match
    // /uploads/ anywhere in the path, not just at the start, or those fall
    // through and next/image rejects the unconfigured host.
    const path = url.replace(/^https?:\/\/[^/]+/, "");
    const uploadsAt = path.indexOf("/uploads/");
    if (uploadsAt !== -1) return `/api${path.slice(uploadsAt)}`;
    return url;
  }

  return `/api${url.startsWith("/") ? "" : "/"}${url}`;
};