import 'cookie';
import 'kleur/colors';
import { N as NOOP_MIDDLEWARE_FN } from './chunks/astro-designed-error-pages_Ch-XyrWS.mjs';
import 'es-module-lexer';
import { j as decodeKey } from './chunks/astro/server_BqEMwVHP.mjs';
import 'clsx';

function sanitizeParams(params) {
  return Object.fromEntries(
    Object.entries(params).map(([key, value]) => {
      if (typeof value === "string") {
        return [key, value.normalize().replace(/#/g, "%23").replace(/\?/g, "%3F")];
      }
      return [key, value];
    })
  );
}
function getParameter(part, params) {
  if (part.spread) {
    return params[part.content.slice(3)] || "";
  }
  if (part.dynamic) {
    if (!params[part.content]) {
      throw new TypeError(`Missing parameter: ${part.content}`);
    }
    return params[part.content];
  }
  return part.content.normalize().replace(/\?/g, "%3F").replace(/#/g, "%23").replace(/%5B/g, "[").replace(/%5D/g, "]");
}
function getSegment(segment, params) {
  const segmentPath = segment.map((part) => getParameter(part, params)).join("");
  return segmentPath ? "/" + segmentPath : "";
}
function getRouteGenerator(segments, addTrailingSlash) {
  return (params) => {
    const sanitizedParams = sanitizeParams(params);
    let trailing = "";
    if (addTrailingSlash === "always" && segments.length) {
      trailing = "/";
    }
    const path = segments.map((segment) => getSegment(segment, sanitizedParams)).join("") + trailing;
    return path || "/";
  };
}

function deserializeRouteData(rawRouteData) {
  return {
    route: rawRouteData.route,
    type: rawRouteData.type,
    pattern: new RegExp(rawRouteData.pattern),
    params: rawRouteData.params,
    component: rawRouteData.component,
    generate: getRouteGenerator(rawRouteData.segments, rawRouteData._meta.trailingSlash),
    pathname: rawRouteData.pathname || void 0,
    segments: rawRouteData.segments,
    prerender: rawRouteData.prerender,
    redirect: rawRouteData.redirect,
    redirectRoute: rawRouteData.redirectRoute ? deserializeRouteData(rawRouteData.redirectRoute) : void 0,
    fallbackRoutes: rawRouteData.fallbackRoutes.map((fallback) => {
      return deserializeRouteData(fallback);
    }),
    isIndex: rawRouteData.isIndex
  };
}

function deserializeManifest(serializedManifest) {
  const routes = [];
  for (const serializedRoute of serializedManifest.routes) {
    routes.push({
      ...serializedRoute,
      routeData: deserializeRouteData(serializedRoute.routeData)
    });
    const route = serializedRoute;
    route.routeData = deserializeRouteData(serializedRoute.routeData);
  }
  const assets = new Set(serializedManifest.assets);
  const componentMetadata = new Map(serializedManifest.componentMetadata);
  const inlinedScripts = new Map(serializedManifest.inlinedScripts);
  const clientDirectives = new Map(serializedManifest.clientDirectives);
  const serverIslandNameMap = new Map(serializedManifest.serverIslandNameMap);
  const key = decodeKey(serializedManifest.key);
  return {
    // in case user middleware exists, this no-op middleware will be reassigned (see plugin-ssr.ts)
    middleware() {
      return { onRequest: NOOP_MIDDLEWARE_FN };
    },
    ...serializedManifest,
    assets,
    componentMetadata,
    inlinedScripts,
    clientDirectives,
    routes,
    serverIslandNameMap,
    key
  };
}

const manifest = deserializeManifest({"hrefRoot":"file:///Users/mertcansezan/Documents/01_Mertcan/WorkFlow/01_Projeler/25_TheSolo/","adapterName":"@astrojs/vercel","routes":[{"file":"about/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/about","isIndex":false,"type":"page","pattern":"^\\/about\\/?$","segments":[[{"content":"about","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/about.astro","pathname":"/about","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"blog/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/blog","isIndex":true,"type":"page","pattern":"^\\/blog\\/?$","segments":[[{"content":"blog","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/blog/index.astro","pathname":"/blog","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"contact/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/contact","isIndex":false,"type":"page","pattern":"^\\/contact\\/?$","segments":[[{"content":"contact","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/contact.astro","pathname":"/contact","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"gallery/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/gallery","isIndex":false,"type":"page","pattern":"^\\/gallery\\/?$","segments":[[{"content":"gallery","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/gallery.astro","pathname":"/gallery","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"menu/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/menu","isIndex":false,"type":"page","pattern":"^\\/menu\\/?$","segments":[[{"content":"menu","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/menu.astro","pathname":"/menu","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"reservation/index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/reservation","isIndex":false,"type":"page","pattern":"^\\/reservation\\/?$","segments":[[{"content":"reservation","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/reservation.astro","pathname":"/reservation","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"index.html","links":[],"scripts":[],"styles":[],"routeData":{"route":"/","isIndex":true,"type":"page","pattern":"^\\/$","segments":[],"params":[],"component":"src/pages/index.astro","pathname":"/","prerender":true,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/page.DTIbhfSr.js"},{"stage":"head-inline","children":"window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };\n\t\tvar script = document.createElement('script');\n\t\tscript.defer = true;\n\t\tscript.src = '/_vercel/insights/script.js';\n\t\tvar head = document.querySelector('head');\n\t\thead.appendChild(script);\n\t"}],"styles":[{"type":"external","src":"/_astro/style.BCOUEhJ_.css"}],"routeData":{"type":"endpoint","isIndex":false,"route":"/_image","pattern":"^\\/_image$","segments":[[{"content":"_image","dynamic":false,"spread":false}]],"params":[],"component":"node_modules/astro/dist/assets/endpoint/generic.js","pathname":"/_image","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}},{"file":"","links":[],"scripts":[{"type":"external","value":"/_astro/page.DTIbhfSr.js"},{"stage":"head-inline","children":"window.va = window.va || function () { (window.vaq = window.vaq || []).push(arguments); };\n\t\tvar script = document.createElement('script');\n\t\tscript.defer = true;\n\t\tscript.src = '/_vercel/insights/script.js';\n\t\tvar head = document.querySelector('head');\n\t\thead.appendChild(script);\n\t"}],"styles":[{"type":"external","src":"/_astro/style.BCOUEhJ_.css"}],"routeData":{"route":"/api/send-email","isIndex":false,"type":"endpoint","pattern":"^\\/api\\/send-email\\/?$","segments":[[{"content":"api","dynamic":false,"spread":false}],[{"content":"send-email","dynamic":false,"spread":false}]],"params":[],"component":"src/pages/api/send-email.ts","pathname":"/api/send-email","prerender":false,"fallbackRoutes":[],"_meta":{"trailingSlash":"ignore"}}}],"site":"https://thesolo.co.uk","base":"/","trailingSlash":"ignore","compressHTML":true,"componentMetadata":[["/Users/mertcansezan/Documents/01_Mertcan/WorkFlow/01_Projeler/25_TheSolo/src/pages/blog/[slug].astro",{"propagation":"in-tree","containsHead":true}],["/Users/mertcansezan/Documents/01_Mertcan/WorkFlow/01_Projeler/25_TheSolo/src/pages/about.astro",{"propagation":"none","containsHead":true}],["/Users/mertcansezan/Documents/01_Mertcan/WorkFlow/01_Projeler/25_TheSolo/src/pages/blog/index.astro",{"propagation":"in-tree","containsHead":true}],["/Users/mertcansezan/Documents/01_Mertcan/WorkFlow/01_Projeler/25_TheSolo/src/pages/contact.astro",{"propagation":"none","containsHead":true}],["/Users/mertcansezan/Documents/01_Mertcan/WorkFlow/01_Projeler/25_TheSolo/src/pages/gallery.astro",{"propagation":"none","containsHead":true}],["/Users/mertcansezan/Documents/01_Mertcan/WorkFlow/01_Projeler/25_TheSolo/src/pages/index.astro",{"propagation":"in-tree","containsHead":true}],["/Users/mertcansezan/Documents/01_Mertcan/WorkFlow/01_Projeler/25_TheSolo/src/pages/menu.astro",{"propagation":"none","containsHead":true}],["/Users/mertcansezan/Documents/01_Mertcan/WorkFlow/01_Projeler/25_TheSolo/src/pages/reservation.astro",{"propagation":"none","containsHead":true}],["\u0000astro:content",{"propagation":"in-tree","containsHead":false}],["/Users/mertcansezan/Documents/01_Mertcan/WorkFlow/01_Projeler/25_TheSolo/src/components/BlogSection.astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/index@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astrojs-ssr-virtual-entry",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/blog/[slug]@_@astro",{"propagation":"in-tree","containsHead":false}],["\u0000@astro-page:src/pages/blog/index@_@astro",{"propagation":"in-tree","containsHead":false}]],"renderers":[],"clientDirectives":[["idle","(()=>{var l=(o,t)=>{let i=async()=>{await(await o())()},e=typeof t.value==\"object\"?t.value:void 0,s={timeout:e==null?void 0:e.timeout};\"requestIdleCallback\"in window?window.requestIdleCallback(i,s):setTimeout(i,s.timeout||200)};(self.Astro||(self.Astro={})).idle=l;window.dispatchEvent(new Event(\"astro:idle\"));})();"],["load","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).load=e;window.dispatchEvent(new Event(\"astro:load\"));})();"],["media","(()=>{var s=(i,t)=>{let a=async()=>{await(await i())()};if(t.value){let e=matchMedia(t.value);e.matches?a():e.addEventListener(\"change\",a,{once:!0})}};(self.Astro||(self.Astro={})).media=s;window.dispatchEvent(new Event(\"astro:media\"));})();"],["only","(()=>{var e=async t=>{await(await t())()};(self.Astro||(self.Astro={})).only=e;window.dispatchEvent(new Event(\"astro:only\"));})();"],["visible","(()=>{var l=(s,i,o)=>{let r=async()=>{await(await s())()},t=typeof i.value==\"object\"?i.value:void 0,c={rootMargin:t==null?void 0:t.rootMargin},n=new IntersectionObserver(e=>{for(let a of e)if(a.isIntersecting){n.disconnect(),r();break}},c);for(let e of o.children)n.observe(e)};(self.Astro||(self.Astro={})).visible=l;window.dispatchEvent(new Event(\"astro:visible\"));})();"]],"entryModules":{"\u0000@astrojs-ssr-adapter":"_@astrojs-ssr-adapter.mjs","\u0000noop-middleware":"_noop-middleware.mjs","\u0000@astrojs-ssr-virtual-entry":"entry.mjs","\u0000@astro-page:src/pages/about@_@astro":"pages/about.astro.mjs","\u0000@astro-page:src/pages/api/send-email@_@ts":"pages/api/send-email.astro.mjs","\u0000@astro-page:src/pages/blog/index@_@astro":"pages/blog.astro.mjs","\u0000@astro-page:src/pages/contact@_@astro":"pages/contact.astro.mjs","\u0000@astro-page:src/pages/gallery@_@astro":"pages/gallery.astro.mjs","\u0000@astro-page:src/pages/menu@_@astro":"pages/menu.astro.mjs","\u0000@astro-page:src/pages/reservation@_@astro":"pages/reservation.astro.mjs","\u0000@astro-renderers":"renderers.mjs","\u0000@astro-page:node_modules/astro/dist/assets/endpoint/generic@_@js":"pages/_image.astro.mjs","\u0000@astro-page:src/pages/blog/[slug]@_@astro":"pages/blog/_slug_.astro.mjs","\u0000@astro-page:src/pages/index@_@astro":"pages/index.astro.mjs","/Users/mertcansezan/Documents/01_Mertcan/WorkFlow/01_Projeler/25_TheSolo/src/content/blog/mediterranean-oasis-bethnal-green.mdx?astroContentCollectionEntry=true":"chunks/mediterranean-oasis-bethnal-green_NSfa6cYr.mjs","/Users/mertcansezan/Documents/01_Mertcan/WorkFlow/01_Projeler/25_TheSolo/src/content/blog/rooftop-experience-signature-cocktails.mdx?astroContentCollectionEntry=true":"chunks/rooftop-experience-signature-cocktails_BG_pGCYv.mjs","/Users/mertcansezan/Documents/01_Mertcan/WorkFlow/01_Projeler/25_TheSolo/src/content/blog/weekend-brunch-family-dining.mdx?astroContentCollectionEntry=true":"chunks/weekend-brunch-family-dining_BLRPY8dp.mjs","/Users/mertcansezan/Documents/01_Mertcan/WorkFlow/01_Projeler/25_TheSolo/src/content/blog/mediterranean-oasis-bethnal-green.mdx?astroPropagatedAssets":"chunks/mediterranean-oasis-bethnal-green_9fEtYCm9.mjs","/Users/mertcansezan/Documents/01_Mertcan/WorkFlow/01_Projeler/25_TheSolo/src/content/blog/rooftop-experience-signature-cocktails.mdx?astroPropagatedAssets":"chunks/rooftop-experience-signature-cocktails_DL49UC98.mjs","/Users/mertcansezan/Documents/01_Mertcan/WorkFlow/01_Projeler/25_TheSolo/src/content/blog/weekend-brunch-family-dining.mdx?astroPropagatedAssets":"chunks/weekend-brunch-family-dining_B_CDQTUe.mjs","\u0000astro:asset-imports":"chunks/_astro_asset-imports_D9aVaOQr.mjs","\u0000astro:data-layer-content":"chunks/_astro_data-layer-content_BcEe_9wP.mjs","/Users/mertcansezan/Documents/01_Mertcan/WorkFlow/01_Projeler/25_TheSolo/src/content/blog/mediterranean-oasis-bethnal-green.mdx":"chunks/mediterranean-oasis-bethnal-green_D9EYZIMn.mjs","/Users/mertcansezan/Documents/01_Mertcan/WorkFlow/01_Projeler/25_TheSolo/src/content/blog/rooftop-experience-signature-cocktails.mdx":"chunks/rooftop-experience-signature-cocktails_Mkb1dSQu.mjs","/Users/mertcansezan/Documents/01_Mertcan/WorkFlow/01_Projeler/25_TheSolo/src/content/blog/weekend-brunch-family-dining.mdx":"chunks/weekend-brunch-family-dining__aereqEI.mjs","\u0000@astrojs-manifest":"manifest_DhkRMZJ5.mjs","/astro/hoisted.js?q=0":"_astro/hoisted.Yxh9su-I.js","/astro/hoisted.js?q=1":"_astro/hoisted.BEmFx1J5.js","/astro/hoisted.js?q=2":"_astro/hoisted.CgihVqgQ.js","/astro/hoisted.js?q=3":"_astro/hoisted.BnPRU0AO.js","astro:scripts/page.js":"_astro/page.DTIbhfSr.js","/astro/hoisted.js?q=5":"_astro/hoisted.DzPSVzoi.js","/astro/hoisted.js?q=4":"_astro/hoisted.DJSF2pdw.js","/astro/hoisted.js?q=6":"_astro/hoisted.Di9jcxFP.js","astro:scripts/before-hydration.js":""},"inlinedScripts":[],"assets":["/_astro/style.BCOUEhJ_.css","/robots.txt","/_astro/hoisted.BEmFx1J5.js","/_astro/hoisted.BnPRU0AO.js","/_astro/hoisted.CgihVqgQ.js","/_astro/hoisted.DJSF2pdw.js","/_astro/hoisted.Di9jcxFP.js","/_astro/hoisted.DzPSVzoi.js","/_astro/hoisted.Yxh9su-I.js","/_astro/page.DTIbhfSr.js","/fonts/Flaticon.ttf","/fonts/Flaticon.woff","/fonts/README.md","/fonts/fa-brands-400.eot","/fonts/fa-brands-400.ttf","/fonts/fa-brands-400.woff","/fonts/fa-brands-400.woff2","/fonts/fa-regular-400.eot","/fonts/fa-regular-400.ttf","/fonts/fa-regular-400.woff","/fonts/fa-regular-400.woff2","/fonts/fa-solid-900.eot","/fonts/fa-solid-900.ttf","/fonts/fa-solid-900.woff","/fonts/fa-solid-900.woff2","/pdfs/README.md","/pdfs/a-la-carte.pdf","/pdfs/bbq.pdf","/pdfs/breakfast-and-brunch.pdf","/pdfs/christmas-party.pdf","/pdfs/drinks-package.pdf","/pdfs/drinks.pdf","/pdfs/events.pdf","/pdfs/party-platters.pdf","/images/README.md","/images/Vector157.png","/images/about-secondary.jpg","/images/about-tertiary.jpg","/images/blog-1.jpg","/images/blog-2.jpg","/images/blog-3.jpg","/images/breakfast-lunch.jpg","/images/cocktail-bar.jpg","/images/hero-left.jpg","/images/hero-right.jpg","/images/live-music.jpg","/images/logo.png","/images/menu-1.jpg","/images/menu-2.jpg","/images/menu-3.jpg","/images/menu-4.jpg","/images/menu-5.jpg","/images/menu-6.jpg","/images/menu-7.jpg","/images/nhs-discount-offer.jpg","/images/opentable-logo.svg","/images/private-dining-event.jpg","/images/private-dining.jpg","/images/reservation-hero.jpg","/images/restaurant-1.jpg","/images/restaurant-3.jpg","/images/restaurant-5.jpg","/images/gallery/gallery1-1.jpg","/images/gallery/gallery1-2.jpg","/images/gallery/gallery1-3.jpg","/images/gallery/gallery1-4.jpg","/images/gallery/gallery1-5.jpg","/images/gallery/gallery1-6.jpg","/images/gallery/gallery1-7.jpg","/images/gallery/gallery2-1.jpg","/images/gallery/gallery2-10.jpg","/images/gallery/gallery2-11.jpg","/images/gallery/gallery2-12.jpg","/images/gallery/gallery2-13.jpg","/images/gallery/gallery2-14.jpg","/images/gallery/gallery2-15.jpg","/images/gallery/gallery2-16.jpg","/images/gallery/gallery2-17.jpg","/images/gallery/gallery2-18.jpg","/images/gallery/gallery2-19.jpg","/images/gallery/gallery2-2.jpg","/images/gallery/gallery2-20.jpg","/images/gallery/gallery2-21.jpg","/images/gallery/gallery2-22.jpg","/images/gallery/gallery2-23.jpg","/images/gallery/gallery2-3.jpg","/images/gallery/gallery2-4.jpg","/images/gallery/gallery2-5.jpg","/images/gallery/gallery2-6.jpg","/images/gallery/gallery2-7.jpg","/images/gallery/gallery2-8.jpg","/images/gallery/gallery2-9.jpg","/images/gallery/gallery3-1.jpg","/images/gallery/gallery3-2.jpg","/_astro/page.DTIbhfSr.js","/about/index.html","/blog/index.html","/contact/index.html","/gallery/index.html","/menu/index.html","/reservation/index.html","/index.html"],"buildFormat":"directory","checkOrigin":false,"serverIslandNameMap":[],"key":"s0HQcqvmYVt/SqU0E7HJIfl6WHXC/4gXTJMYOfGBXAA=","experimentalEnvGetSecretEnabled":false});

export { manifest };
