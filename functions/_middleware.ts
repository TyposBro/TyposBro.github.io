// Serve the English homepage at the site root.
//
// Astro is configured with `prefixDefaultLocale: true`, so every page lives
// under a locale prefix (/en/, /ko/, /ru/, /uz/) and `/en/` is the real
// English homepage. Without this, `/` can only be handled by a meta-refresh
// stub, which means a visible "Redirecting..." flash on every first visit.
//
// Rewriting at the edge keeps the URL as `/` and returns the English page
// directly. It is an internal rewrite, not a redirect: the browser stays on
// the root and nothing flashes. GitHub Pages has no middleware, so the
// fallback there is the instant stub in src/pages/index.astro.
//
// Redirecting to a locale based on Accept-Language was considered and
// rejected: crawlers mostly send English, so it would have made Korean or
// Russian pages the canonical root depending on the visitor.

interface Env {}

const ENGLISH_HOME = '/en/';

export const onRequest: PagesFunction<Env> = async (context) => {
  const url = new URL(context.request.url);

  if (url.pathname === '/' || url.pathname === '') {
    const page = await context.env.ASSETS.fetch(
      new Request(new URL(ENGLISH_HOME, url.origin), context.request)
    );
    // Return the English page under the requested root URL.
    return new Response(page.body, page);
  }

  return context.next();
};
