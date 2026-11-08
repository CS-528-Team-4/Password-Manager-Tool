export const samplePlatforms = [
  {
    name: 'Google',
    host: 'google.com',
    mark: 'G',
    theme: 'google',
    aliases: ['accounts.google.com'],
  },
  {
    name: 'YouTube',
    host: 'youtube.com',
    mark: '▶',
    theme: 'youtube',
    aliases: [],
  },
  {
    name: 'Student Portal',
    host: 'portal.example.com',
    mark: 'S',
    theme: 'school',
    aliases: [],
  },
  {
    name: 'Demo Shop',
    host: 'shop.example.com',
    mark: 'B',
    theme: 'shop',
    aliases: [],
  },
];
export function websiteHost(website) {
  try {
    const value = String(website || '').trim();
    if (!value) return null;
    const url = new URL(
      /^[a-z][a-z0-9+.-]*:/i.test(value) ? value : 'https://' + value,
    );
    if (
      !['https:', 'http:'].includes(url.protocol) ||
      url.username ||
      url.password
    )
      return null;
    return url.hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return null;
  }
}
export function matchesPlatform(item, platform) {
  const host = websiteHost(item.values.Website);
  return (
    item.type === 'Logins' &&
    !!item.values.Username &&
    !!item.values.Password &&
    host !== null &&
    [platform.host, ...(platform.aliases || [])].includes(host)
  );
}
export function platformsFor(items) {
  const result = samplePlatforms.map((p) => ({ ...p }));
  for (const item of items) {
    if (item.type !== 'Logins') continue;
    const host = websiteHost(item.values.Website);
    if (
      host &&
      !result.some((p) => [p.host, ...(p.aliases || [])].includes(host))
    )
      result.push({
        name: item.values.Title || host,
        host,
        mark: host[0].toUpperCase(),
        theme: 'custom',
        aliases: [],
      });
  }
  return result;
}
