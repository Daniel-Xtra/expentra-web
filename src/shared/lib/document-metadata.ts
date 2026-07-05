import { formatPageTitle } from './site-metadata';

type DocumentMetadataInput = {
  title: string;
  description: string;
  noIndex?: boolean;
};

function setMetaContent(
  selector: string,
  content: string,
  createAttributes: Record<string, string>,
): void {
  let element = document.head.querySelector<HTMLMetaElement>(selector);

  if (!element) {
    element = document.createElement('meta');
    for (const [key, value] of Object.entries(createAttributes)) {
      element.setAttribute(key, value);
    }
    document.head.appendChild(element);
  }

  element.content = content;
}

export function applyDocumentMetadata({
  title,
  description,
  noIndex = false,
}: DocumentMetadataInput): void {
  const pageTitle = formatPageTitle(title);

  document.title = pageTitle;

  setMetaContent('meta[name="description"]', description, { name: 'description' });
  setMetaContent('meta[property="og:title"]', pageTitle, { property: 'og:title' });
  setMetaContent('meta[property="og:description"]', description, {
    property: 'og:description',
  });
  setMetaContent('meta[name="twitter:title"]', pageTitle, { name: 'twitter:title' });
  setMetaContent('meta[name="twitter:description"]', description, {
    name: 'twitter:description',
  });
  setMetaContent(
    'meta[name="robots"]',
    noIndex ? 'noindex, nofollow' : 'index, follow',
    { name: 'robots' },
  );
}
