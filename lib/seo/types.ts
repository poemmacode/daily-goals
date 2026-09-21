export interface SEOContentPage {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  status: "draft" | "published" | "archived";
  meta_title: string | null;
  meta_description: string | null;
  canonical_url: string | null;
  featured_image: string | null;
  featured_image_alt: string | null;
  category: string | null;
  focus_keyword: string | null;
  secondary_keywords: string[] | null;
  author: string | null;
  indexable: boolean;
  follow_links: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SEOContentFormData {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  status: "draft" | "published" | "archived";
  meta_title: string;
  meta_description: string;
  canonical_url: string;
  featured_image: string;
  featured_image_alt: string;
  category: string;
  focus_keyword: string;
  secondary_keywords: string[];
  author: string;
  indexable: boolean;
  follow_links: boolean;
}

export const SEO_CATEGORIES = [
  "Goal Setting",
  "Productivity",
  "Habits",
  "Learning",
  "Career",
  "Fitness",
  "Personal Development",
  "Time Management",
  "Goal Tracking",
];

/**
 * Generate a URL-friendly slug from a title.
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Calculate SEO content health score.
 */
export function calculateSEOHealth(page: Partial<SEOContentPage>): {
  score: number;
  checks: { label: string; passed: boolean; message?: string }[];
} {
  const checks: { label: string; passed: boolean; message?: string }[] = [];

  // Meta title
  const hasMetaTitle = Boolean(page.meta_title);
  checks.push({
    label: "Meta title",
    passed: hasMetaTitle,
    message: hasMetaTitle
      ? `${page.meta_title!.length}/60 chars`
      : "Add a meta title",
  });

  // Meta description
  const hasMetaDesc = Boolean(page.meta_description);
  checks.push({
    label: "Meta description",
    passed: hasMetaDesc,
    message: hasMetaDesc
      ? `${page.meta_description!.length}/160 chars`
      : "Add a meta description",
  });

  // Title exists
  checks.push({
    label: "Page title",
    passed: Boolean(page.title),
  });

  // Slug quality
  const slugOk = Boolean(page.slug) && page.slug!.length > 3 && !page.slug!.includes(" ");
  checks.push({
    label: "URL slug",
    passed: slugOk,
    message: slugOk ? `/${page.slug}` : "Use a short, readable slug",
  });

  // Focus keyword
  const hasKeyword = Boolean(page.focus_keyword);
  checks.push({
    label: "Focus keyword",
    passed: hasKeyword,
  });

  // Focus keyword in title
  if (hasKeyword && page.title) {
    const inTitle = page.title.toLowerCase().includes(page.focus_keyword!.toLowerCase());
    checks.push({
      label: "Keyword in title",
      passed: inTitle,
    });
  }

  // Content length
  const contentLen = page.content?.length ?? 0;
  checks.push({
    label: "Content length",
    passed: contentLen > 300,
    message: `${contentLen} chars`,
  });

  // Featured image
  checks.push({
    label: "Featured image",
    passed: Boolean(page.featured_image),
  });

  // Image alt text
  if (page.featured_image) {
    checks.push({
      label: "Image alt text",
      passed: Boolean(page.featured_image_alt),
    });
  }

  // Canonical URL
  checks.push({
    label: "Canonical URL",
    passed: Boolean(page.canonical_url),
  });

  // Category
  checks.push({
    label: "Category",
    passed: Boolean(page.category),
  });

  const passed = checks.filter((c) => c.passed).length;
  const score = Math.round((passed / checks.length) * 100);

  return { score, checks };
}

/**
 * Generate JSON-LD structured data for an article.
 */
export function generateArticleJsonLd(page: SEOContentPage, baseUrl: string): Record<string, unknown> {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: page.meta_title ?? page.title,
    description: page.meta_description ?? page.excerpt ?? "",
    image: page.featured_image ?? undefined,
    author: page.author ? { "@type": "Person", name: page.author } : undefined,
    datePublished: page.published_at ?? page.created_at,
    dateModified: page.updated_at,
    mainEntityOfPage: `${baseUrl}/blog/${page.slug}`,
  };
}

/**
 * Generate robots meta tag content.
 */
export function generateRobotsMeta(page: SEOContentPage): string {
  const parts: string[] = [];
  parts.push(page.indexable ? "index" : "noindex");
  parts.push(page.follow_links ? "follow" : "nofollow");
  return parts.join(", ");
}
