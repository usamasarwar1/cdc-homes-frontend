export const getWebsiteUrl = (input) => {
  if (!input) return "";

  let value = input.trim().toLowerCase();

  // Remove protocol
  value = value.replace(/^https?:\/\//, "");

  // Remove path, query, hash
  value = value.split("/")[0];

  // Remove existing www.
  value = value.replace(/^www\./, "");

  // ❌ Reject IP addresses (e.g. 0.0.0.2)
  const ipRegex = /^(?:\d{1,3}\.){3}\d{1,3}$/;
  if (ipRegex.test(value)) return "";

  // ✅ Allow only valid domains (must contain letters)
  const domainRegex = /^(?=.*[a-z])[a-z0-9-]+\.[a-z]{2,}$/;
  if (!domainRegex.test(value)) return "";

  return `www.${value}`;
};
