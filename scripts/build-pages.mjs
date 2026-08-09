/**
 * Assembles the four SEO sub-pages around a shared header/footer so the chrome
 * stays identical to the home page without being copy-pasted four times.
 *
 * Run: node scripts/build-pages.mjs
 */
import fs from 'node:fs';
import path from 'node:path';

const WA =
  'https://wa.me/5511940757575?text=Ol%C3%A1%2C%20gostaria%20de%20agendar%20uma%20avalia%C3%A7%C3%A3o%20de%20transplante%20capilar.';

const ICONS = {
  wa: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.2-1.8-.9-2-1s-.5-.1-.7.1-.8 1-.9 1.2-.4.2-.7.1-1.3-.5-2.4-1.5c-.9-.8-1.5-1.8-1.7-2.1s0-.5.1-.6l.5-.5c.1-.2.2-.3.3-.5s0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5H8c-.2 0-.5.1-.8.4s-1 1-1 2.5 1.1 2.9 1.2 3.1 2.1 3.2 5.1 4.5c1.9.8 2.7.9 3.6.8.6-.1 1.8-.7 2-1.4s.2-1.3.2-1.4-.3-.2-.6-.4M12 21.8h-.1a9.9 9.9 0 0 1-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4a9.9 9.9 0 0 1-1.5-5.3C2.1 6.5 6.6 2 12 2c2.6 0 5.1 1 7 2.9a9.8 9.8 0 0 1 2.9 7c0 5.4-4.4 9.9-9.9 9.9m8.4-18.3A11.8 11.8 0 0 0 12 0C5.5 0 .2 5.3.2 11.9c0 2.1.5 4.1 1.6 5.9L0 24l6.3-1.7c1.7 1 3.7 1.4 5.7 1.4 6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.5-8.4"/></svg>`,
  ig: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.2c3.2 0 3.6 0 4.9.1 3.2.1 4.8 1.7 4.9 4.9.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.9c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.6.1-4.9.1s-3.6 0-4.8-.1c-3.3-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.8C2.4 4 4 2.4 7.2 2.3 8.4 2.2 8.8 2.2 12 2.2M12 0C8.7 0 8.3 0 7.1.1 2.7.3.3 2.7.1 7.1 0 8.3 0 8.7 0 12s0 3.7.1 4.9c.2 4.4 2.6 6.8 7 7C8.3 24 8.7 24 12 24s3.7 0 4.9-.1c4.4-.2 6.8-2.6 7-7 .1-1.2.1-1.6.1-4.9s0-3.7-.1-4.9c-.2-4.4-2.6-6.8-7-7C15.7 0 15.3 0 12 0m0 5.8a6.2 6.2 0 1 0 0 12.4 6.2 6.2 0 0 0 0-12.4M12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8m6.4-11.8a1.4 1.4 0 1 0 0 2.9 1.4 1.4 0 0 0 0-2.9"/></svg>`,
  arrow: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="14" height="14" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`,
};

function navLink(href, label, current) {
  const aria = current ? ' aria-current="page"' : '';
  return `<a href="${href}"${aria}>${label}</a>`;
}

function shell(page) {
  const {
    title,
    description,
    canonical,
    path: pagePath,
    crumbs,
    schema,
    heroEyebrow,
    heroTitle,
    heroLede,
    body,
    ogImage = 'https://www.drgabrielgaleb.com.br/assets/img/og-cover.jpg',
  } = page;

  const current = {
    sobre: pagePath.startsWith('/sobre'),
    fue: pagePath.startsWith('/transplante-capilar-fue'),
    mmp: pagePath.startsWith('/mmp-capilar'),
    resultados: pagePath.startsWith('/resultados'),
  };

  const crumbHtml = crumbs
    .map((c, i) =>
      i < crumbs.length - 1
        ? `<li><a href="${c.href}">${c.label}</a></li>`
        : `<li aria-current="page">${c.label}</li>`,
    )
    .join('\n          ');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title>
<meta name="description" content="${description}">
<link rel="canonical" href="${canonical}">
<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1">
<meta name="author" content="Dr. Gabriel Galeb">
<meta name="theme-color" content="#0A0D18">
<meta name="color-scheme" content="dark light">
<meta name="geo.region" content="BR-SP">
<meta name="geo.placename" content="Alphaville, Barueri — Grande São Paulo">

<meta property="og:type" content="article">
<meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="Dr. Gabriel Galeb — Transplante Capilar">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${description}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${ogImage}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="${description}">
<meta name="twitter:image" content="${ogImage}">

<link rel="icon" href="/assets/img/favicon-32.png" sizes="32x32" type="image/png">
<link rel="icon" href="/assets/img/favicon-192.png" sizes="192x192" type="image/png">
<link rel="apple-touch-icon" href="/assets/img/favicon-180.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/assets/fonts/cormorant-garamond-normal-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/inter-normal-latin.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/styles.css">
<link rel="stylesheet" href="/assets/css/tricks.css">
<script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>
<body>
<div class="progress" aria-hidden="true"></div>
<a class="skip" href="#main">Ir para o conteúdo</a>

<div class="topbar">
  <div class="shell">
    <div class="topbar__group topbar__group--meta">
      <span>Alphaville &middot; Grande São Paulo</span>
      <span class="topbar__sep" aria-hidden="true"></span>
      <span>Seg&ndash;Sex 9h&ndash;19h</span>
    </div>
    <div class="topbar__group">
      <a href="${WA}" target="_blank" rel="noopener">${ICONS.wa} (11) 94075-7575</a>
      <span class="topbar__sep" aria-hidden="true"></span>
      <a href="https://www.instagram.com/dr.gabrielgaleb" target="_blank" rel="noopener">${ICONS.ig} @dr.gabrielgaleb</a>
    </div>
  </div>
</div>

<header class="masthead" id="masthead">
  <div class="shell">
    <a class="masthead__brand" href="/" aria-label="Dr. Gabriel Galeb — página inicial">
      <span class="lockup">
        <span class="lockup__word">GAL<span class="lockup__flip">E</span>B</span>
        <span class="lockup__rule" aria-hidden="true"><span></span></span>
        <span class="lockup__sub">Transplante Capilar</span>
      </span>
    </a>
    <nav class="nav" id="nav" aria-label="Navegação principal">
      ${navLink('/sobre/', 'O médico', current.sobre)}
      ${navLink('/transplante-capilar-fue/', 'Transplante FUE', current.fue)}
      ${navLink('/mmp-capilar/', 'MMP capilar', current.mmp)}
      ${navLink('/resultados/', 'Resultados', current.resultados)}
      <a href="/#jornada">Jornada</a>
      <a href="/#contato">Contato</a>
    </nav>
    <a class="btn" href="${WA}" target="_blank" rel="noopener">Agendar avaliação</a>
    <button class="burger" id="burger" type="button" aria-expanded="false" aria-controls="nav" aria-label="Abrir menu">
      <svg class="burger__open" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
      <svg class="burger__close" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
    </button>
  </div>
</header>

<main id="main">
  <section class="hero" style="padding-block:clamp(3rem,2rem + 4vw,5rem) clamp(2.5rem,1.5rem + 3vw,4rem)">
    <div class="shell">
      <nav aria-label="Breadcrumb">
        <ol class="crumbs">
          ${crumbHtml}
        </ol>
      </nav>
      <div style="max-width:48rem;margin-top:2rem">
        <span class="eyebrow">${heroEyebrow}</span>
        <h1 style="margin-top:1.25rem">${heroTitle}</h1>
        <p class="hero__sub">${heroLede}</p>
        <div class="btn-row" style="margin-top:2rem">
          <a class="btn" href="${WA}" target="_blank" rel="noopener">Agendar avaliação</a>
          <a class="btn btn--ghost" href="/#contato">Ver endereço</a>
        </div>
      </div>
    </div>
  </section>
${body}
</main>

<footer class="footer">
  <div class="shell">
    <div class="footer__grid">
      <div class="footer__brand">
        <span class="lockup">
          <span class="lockup__word">GAL<span class="lockup__flip">E</span>B</span>
          <span class="lockup__rule" aria-hidden="true"><span></span></span>
          <span class="lockup__sub">Transplante Capilar</span>
        </span>
        <p>Clínica de transplante capilar dirigida pelo Dr. Gabriel Galeb. Técnica FUE, MMP capilar e avaliação individual em Alphaville, atendendo toda a Grande São Paulo.</p>
        <div class="social">
          <a href="https://www.instagram.com/dr.gabrielgaleb" target="_blank" rel="noopener" aria-label="Instagram">${ICONS.ig}</a>
          <a href="${WA}" target="_blank" rel="noopener" aria-label="WhatsApp">${ICONS.wa}</a>
        </div>
      </div>
      <div>
        <h4>Tratamentos</h4>
        <ul>
          <li><a href="/transplante-capilar-fue/">Transplante capilar FUE</a></li>
          <li><a href="/mmp-capilar/">MMP capilar</a></li>
          <li><a href="/transplante-capilar-fue/#sem-raspagem">FUE sem raspagem</a></li>
          <li><a href="/mmp-capilar/#feminina">Alopecia feminina</a></li>
        </ul>
      </div>
      <div>
        <h4>A clínica</h4>
        <ul>
          <li><a href="/sobre/">Dr. Gabriel Galeb</a></li>
          <li><a href="/resultados/">Antes e depois</a></li>
          <li><a href="/#jornada">A jornada</a></li>
          <li><a href="/#duvidas">Dúvidas frequentes</a></li>
        </ul>
      </div>
      <div>
        <h4>Atendimento</h4>
        <ul>
          <li>Alameda Rio Negro, 1084<br>Sala M24 &middot; Alphaville<br>Barueri &ndash; SP</li>
          <li><a href="tel:+5511940757575">(11) 94075-7575</a></li>
          <li>Seg&ndash;Sex 9h&ndash;19h<br>Sáb 9h&ndash;13h</li>
        </ul>
      </div>
    </div>
    <div class="footer__legal">
      <p>Este site tem caráter informativo e não substitui a consulta médica. Nenhum conteúdo aqui publicado garante resultado: a resposta ao transplante capilar varia conforme características individuais.</p>
      <p>Imagens de pacientes divulgadas com autorização expressa, em conformidade com a Resolução CFM nº 2.336/2023.</p>
      <p>Responsável técnico: Dr. Gabriel Galeb &middot; CRM-SP</p>
    </div>
    <div class="footer__bottom">
      <span>&copy; 2026 Clínica Dr. Gabriel Galeb</span>
      <span>Transplante capilar &middot; Alphaville, Grande São Paulo</span>
    </div>
  </div>
</footer>

<a class="fab" href="${WA}" target="_blank" rel="noopener" aria-label="Agendar avaliação pelo WhatsApp">
  ${ICONS.wa}
  <span>Agendar</span>
</a>

<dialog class="lightbox" id="lightbox" aria-label="Imagem ampliada">
  <button class="lightbox__close" type="button" data-close aria-label="Fechar">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
  </button>
  <figure>
    <img id="lightbox-img" src="" alt="">
    <figcaption id="lightbox-caption"></figcaption>
  </figure>
</dialog>

<script src="/assets/js/main.js" defer></script>
</body>
</html>
`;
}

function picture(base, widths, sizes, alt, { w, h, loading = 'lazy' } = {}) {
  const avif = widths.map((x) => `/assets/img/${base}-${x}.avif ${x}w`).join(', ');
  const webp = widths.map((x) => `/assets/img/${base}-${x}.webp ${x}w`).join(', ');
  const mid = widths.includes(960) ? 960 : widths[Math.min(1, widths.length - 1)];
  const jpg = `/assets/img/${base}-${mid}.jpg`;
  return `<picture>
              <source type="image/avif" srcset="${avif}" sizes="${sizes}">
              <source type="image/webp" srcset="${webp}" sizes="${sizes}">
              <img src="${jpg}" width="${w}" height="${h}" alt="${alt}" loading="${loading}" decoding="async">
            </picture>`;
}

function coverflowCard({ id, i, pos, before, after, title, subtitle, loading = 'lazy', hero = false }) {
  const sizes = '(max-width: 900px) 78vw, 28rem';
  const widths = [640, 960, 1440];
  const num = String(i + 1).padStart(2, '0');
  return `
            <article class="coverflow__card${hero ? ' is-hero' : ''}" id="${id}" data-index="${i}">
              <div class="coverflow__face">
                <span class="coverflow__index" aria-hidden="true">${num}</span>
                <div class="compare" style="--pos: ${pos}%" data-compare>
                  <div class="compare__layer compare__after">
                    ${picture(after.base, widths, sizes, after.alt, { w: 960, h: 540, loading })}
                  </div>
                  <div class="compare__layer compare__before">
                    ${picture(before.base, widths, sizes, before.alt, { w: 960, h: 540, loading })}
                  </div>
                  <span class="compare__tag compare__tag--before">Antes</span>
                  <span class="compare__tag compare__tag--after">Depois</span>
                  <div class="compare__handle" aria-hidden="true"></div>
                  <input class="compare__range" type="range" min="0" max="100" value="${pos}" aria-label="Arraste para comparar antes e depois do ${id}">
                </div>
                <div class="coverflow__meta">
                  <h3>${title}</h3>
                  <p>${subtitle}</p>
                </div>
              </div>
            </article>`;
}

const pages = [];

/* ─── SOBRE ─────────────────────────────────────────────────────────────── */
pages.push({
  out: 'sobre/index.html',
  title: 'Dr. Gabriel Galeb — Cirurgião de Transplante Capilar em São Paulo',
  description:
    'Conheça o Dr. Gabriel Galeb, médico cirurgião membro da ASAHRS e da Sociedade Brasileira de Cirurgia de Transplante Capilar. MBA Albert Einstein, Fellow em restauração capilar.',
  canonical: 'https://www.drgabrielgaleb.com.br/sobre/',
  path: '/sobre/',
  crumbs: [
    { href: '/', label: 'Início' },
    { href: '/sobre/', label: 'O médico' },
  ],
  heroEyebrow: 'O médico',
  heroTitle: 'Dr. Gabriel Galeb',
  heroLede:
    'Médico cirurgião dedicado à restauração capilar. Membro da American Society of Aesthetic and Hair Restoration Surgeons (ASAHRS) e da Sociedade Brasileira de Cirurgia de Transplante Capilar.',
  schema: {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Physician',
        '@id': 'https://www.drgabrielgaleb.com.br/sobre/#physician',
        name: 'Dr. Gabriel Galeb',
        givenName: 'Gabriel',
        familyName: 'Galeb',
        honorificPrefix: 'Dr.',
        jobTitle: 'Médico cirurgião — restauração capilar',
        url: 'https://www.drgabrielgaleb.com.br/sobre/',
        image: 'https://www.drgabrielgaleb.com.br/assets/img/dr-portrait-760.jpg',
        worksFor: { '@id': 'https://www.drgabrielgaleb.com.br/#clinic' },
        medicalSpecialty: ['Dermatology', 'PlasticSurgery'],
        knowsAbout: [
          'Transplante capilar FUE',
          'Alopecia androgenética',
          'Tricologia',
          'MMP capilar',
          'Desenho de linha frontal',
        ],
        alumniOf: {
          '@type': 'CollegeOrUniversity',
          name: 'Faculdade Israelita de Ciências da Saúde Albert Einstein',
        },
        memberOf: [
          {
            '@type': 'MedicalOrganization',
            name: 'American Society of Aesthetic and Hair Restoration Surgeons (ASAHRS)',
          },
          {
            '@type': 'MedicalOrganization',
            name: 'Sociedade Brasileira de Cirurgia de Transplante Capilar',
          },
        ],
        hasCredential: [
          {
            '@type': 'EducationalOccupationalCredential',
            credentialCategory: 'degree',
            name: 'MBA em Gestão em Saúde — Faculdade Israelita Albert Einstein',
          },
          {
            '@type': 'EducationalOccupationalCredential',
            credentialCategory: 'certificate',
            name: 'Fellow em Restauração Capilar — ASAHRS',
          },
        ],
        sameAs: ['https://www.instagram.com/dr.gabrielgaleb'],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://www.drgabrielgaleb.com.br/' },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'O médico',
            item: 'https://www.drgabrielgaleb.com.br/sobre/',
          },
        ],
      },
      {
        '@type': 'WebPage',
        '@id': 'https://www.drgabrielgaleb.com.br/sobre/#webpage',
        url: 'https://www.drgabrielgaleb.com.br/sobre/',
        name: 'Dr. Gabriel Galeb — Cirurgião de Transplante Capilar em São Paulo',
        isPartOf: { '@id': 'https://www.drgabrielgaleb.com.br/#website' },
        about: { '@id': 'https://www.drgabrielgaleb.com.br/sobre/#physician' },
        inLanguage: 'pt-BR',
        lastReviewed: '2026-08-02',
        reviewedBy: { '@id': 'https://www.drgabrielgaleb.com.br/sobre/#physician' },
      },
    ],
  },
  body: `
  <section class="section">
    <div class="shell">
      <div class="split">
        <div class="split__media">
          ${picture('dr-portrait', [560, 760, 1120], '(max-width:1080px) 32rem, 36vw', 'Dr. Gabriel Galeb, médico cirurgião especialista em transplante capilar', { w: 1120, h: 1456, loading: 'eager' })}
        </div>
        <div class="split__body prose">
          <span class="eyebrow">Trajetória</span>
          <h2>Ciência, arte e precisão na <em>restauração capilar</em>.</h2>
          <p>O Dr. Gabriel Galeb dedica sua carreira à cirurgia capilar. São mais de dez anos e mais de mil procedimentos com uma constante: tratar o transplante como um trabalho de arquitetura — ângulo, direção e densidade de cada unidade folicular definidos em função da anatomia de quem está na cadeira.</p>
          <p>A formação combina o rigor técnico internacional da ASAHRS com a realidade clínica brasileira: tipos capilares variados, exposição solar intensa e pacientes que precisam voltar ao trabalho rápido. O resultado buscado não é o cabelo mais volumoso possível, e sim o cabelo que ninguém percebe que foi transplantado.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="section section--tint">
    <div class="shell">
      <div class="section-head">
        <span class="eyebrow">Formação</span>
        <h2>Titulação e <em>sociedades</em>.</h2>
      </div>
      <ul class="creds">
        <li>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M12 2 4 6v6c0 5.5 3.8 10.7 8 12 4.2-1.3 8-6.5 8-12V6l-8-4Z"/><path d="m9 12 2 2 4-4"/></svg>
          <div><small>ASAHRS</small><p>Membro da American Society of Aesthetic and Hair Restoration Surgeons — sociedade internacional de referência em restauração capilar estética.</p></div>
        </li>
        <li>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 1 0-16 0"/></svg>
          <div><small>SBCTC</small><p>Membro da Sociedade Brasileira de Cirurgia de Transplante Capilar.</p></div>
        </li>
        <li>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M22 10v6M2 10l10-5 10 5-10 5Z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>
          <div><small>Albert Einstein</small><p>MBA em Gestão em Saúde pela Faculdade Israelita de Ciências da Saúde Albert Einstein.</p></div>
        </li>
        <li>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6"/></svg>
          <div><small>Fellowship</small><p>Fellow em Restauração Capilar pela ASAHRS — formação prática avançada em técnicas de extração e implante.</p></div>
        </li>
      </ul>
    </div>
  </section>

  <section class="section">
    <div class="shell">
      <div class="split split--flip">
        <div class="split__body prose">
          <span class="eyebrow">Método</span>
          <h2>Como o Dr. Gabriel <em>trabalha</em>.</h2>
          <p>Cada caso começa com tricoscopia digital e classificação do padrão de calvície. Só depois vem o desenho da linha frontal — feito à mão, sobre o próprio paciente, considerando proporções do rosto, idade e expectativa de evolução da alopecia.</p>
          <p>Na cirurgia, a extração e o implante são conduzidos pelo médico. A equipe assistente apoia; não substitui. A área doadora é tratada como recurso finito: a distribuição da extração preserva a possibilidade de uma segunda sessão, se o plano a prever.</p>
          <ul>
            <li>Avaliação com tricoscopia e plano por escrito</li>
            <li>Desenho de linha frontal individualizado</li>
            <li>Cirurgia FUE conduzida pelo médico</li>
            <li>Acompanhamento fotográfico por 12 meses</li>
          </ul>
          <p><a class="textlink" href="/transplante-capilar-fue/">Ver a técnica FUE em detalhe ${ICONS.arrow}</a></p>
        </div>
        <div class="split__media">
          ${picture('dr-planning', [560, 840, 1120], '(max-width:1080px) 32rem, 36vw', 'Dr. Gabriel Galeb medindo a linha frontal de um paciente com paquímetro durante o planejamento cirúrgico', { w: 1120, h: 1456 })}
        </div>
      </div>
    </div>
  </section>

  <section class="section section--dark" id="contato">
    <div class="shell" style="text-align:center;max-width:40rem;margin-inline:auto">
      <span class="eyebrow">Consulta</span>
      <h2 style="margin-top:1.1rem">Agende uma avaliação com o <em>Dr. Gabriel</em>.</h2>
      <p class="lede" style="margin:1.35rem auto 0">Atendimento em Alphaville, Grande São Paulo. Triagem inicial também pelo WhatsApp.</p>
      <div class="btn-row" style="margin-top:2.25rem;justify-content:center">
        <a class="btn" href="${WA}" target="_blank" rel="noopener">Agendar pelo WhatsApp</a>
        <a class="btn btn--ghost" href="/resultados/">Ver resultados</a>
      </div>
    </div>
  </section>
`,
});

/* ─── FUE ───────────────────────────────────────────────────────────────── */
pages.push({
  out: 'transplante-capilar-fue/index.html',
  title: 'Transplante Capilar FUE em São Paulo | Dr. Gabriel Galeb',
  description:
    'Transplante capilar pela técnica FUE em São Paulo: extração folicular individual, sem cicatriz linear, linha frontal desenhada sob medida. Opção sem raspagem em casos selecionados.',
  canonical: 'https://www.drgabrielgaleb.com.br/transplante-capilar-fue/',
  path: '/transplante-capilar-fue/',
  crumbs: [
    { href: '/', label: 'Início' },
    { href: '/transplante-capilar-fue/', label: 'Transplante FUE' },
  ],
  heroEyebrow: 'Técnica cirúrgica',
  heroTitle: 'Transplante capilar FUE em <em>São Paulo</em>',
  heroLede:
    'Follicular Unit Extraction: cada unidade folicular é retirada e implantada individualmente. Sem cicatriz linear, com desenho de linha frontal feito sob medida para o seu rosto.',
  schema: {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'MedicalProcedure',
        '@id': 'https://www.drgabrielgaleb.com.br/transplante-capilar-fue/#procedure',
        name: 'Transplante Capilar FUE',
        alternateName: ['Follicular Unit Extraction', 'Implante capilar FUE', 'Transplante capilar sem cicatriz linear'],
        description:
          'Cirurgia de restauração capilar pela técnica FUE (Follicular Unit Extraction), com extração individual de unidades foliculares da área doadora occipital e implante na região rarefeita. Realizada pelo Dr. Gabriel Galeb em Alphaville, Grande São Paulo.',
        procedureType: 'Surgical',
        bodyLocation: 'Scalp',
        howPerformed:
          'Sob anestesia local. Extração de unidades foliculares uma a uma na área doadora, preparo sob microscopia e implante respeitando ângulo e direção naturais do cabelo. Duração de 6 a 8 horas. Alta no mesmo dia.',
        preparation:
          'Avaliação com tricoscopia, exames laboratoriais pré-operatórios quando indicados, suspensão de anticoagulantes e orientações de higiene do couro cabeludo.',
        followup:
          'Lavagem orientada a partir do segundo dia, retornos programados e acompanhamento fotográfico até 12 a 15 meses.',
        status: 'https://schema.org/ActiveActionStatus',
        provider: { '@id': 'https://www.drgabrielgaleb.com.br/sobre/#physician' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'O que é a técnica FUE de transplante capilar?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'FUE (Follicular Unit Extraction) é a extração de unidades foliculares uma a uma da área doadora occipital, sem remover uma faixa de couro cabeludo. Não deixa cicatriz linear; as microcicatrizes pontuais ficam escondidas sob o cabelo remanescente.',
            },
          },
          {
            '@type': 'Question',
            name: 'Qual a diferença entre FUE e FUT?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Na FUT (ou strip), remove-se uma faixa de couro cabeludo da área doadora, o que deixa uma cicatriz linear. Na FUE, cada unidade é retirada individualmente. A FUE costuma ter recuperação mais rápida da área doadora e permite cortes de cabelo mais curtos no futuro.',
            },
          },
          {
            '@type': 'Question',
            name: 'Dá para fazer FUE sem raspar a cabeça?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Sim, em casos selecionados. A técnica sem raspagem (no-shave FUE) exige áreas menores e mais tempo por unidade folicular. A indicação depende do número de enxertos e das características da área doadora.',
            },
          },
          {
            '@type': 'Question',
            name: 'Quantas unidades foliculares um transplante FUE precisa?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Depende do grau de calvície, da densidade da área doadora e do objetivo estético. Casos de reconstrução frontal costumam ficar entre 2.000 e 3.500 unidades foliculares, definidas na tricoscopia da avaliação.',
            },
          },
        ],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://www.drgabrielgaleb.com.br/' },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Transplante FUE',
            item: 'https://www.drgabrielgaleb.com.br/transplante-capilar-fue/',
          },
        ],
      },
      {
        '@type': 'WebPage',
        '@id': 'https://www.drgabrielgaleb.com.br/transplante-capilar-fue/#webpage',
        url: 'https://www.drgabrielgaleb.com.br/transplante-capilar-fue/',
        name: 'Transplante Capilar FUE em São Paulo | Dr. Gabriel Galeb',
        isPartOf: { '@id': 'https://www.drgabrielgaleb.com.br/#website' },
        about: { '@id': 'https://www.drgabrielgaleb.com.br/transplante-capilar-fue/#procedure' },
        inLanguage: 'pt-BR',
        lastReviewed: '2026-08-02',
        reviewedBy: { '@id': 'https://www.drgabrielgaleb.com.br/sobre/#physician' },
      },
    ],
  },
  body: `
  <section class="section">
    <div class="shell">
      <div class="split">
        <div class="split__media">
          ${picture('result-frontal', [640, 960, 1440], '(max-width:1080px) 100vw, 42vw', 'Linha frontal reconstruída por transplante capilar FUE', { w: 960, h: 540, loading: 'eager' })}
        </div>
        <div class="split__body prose">
          <span class="eyebrow">O que é</span>
          <h2>Extração folicular <em>individual</em>.</h2>
          <p>Na técnica FUE, cada unidade folicular — o agrupamento natural de um a quatro fios — é retirada da área doadora occipital com um punch de diâmetro milimétrico e implantada na região rarefeita. Não se remove uma faixa de couro cabeludo; não há cicatriz linear.</p>
          <p>O que define o resultado não é só o número de enxertos, e sim a distribuição: densidade por centímetro quadrado, ângulo de saída, direção e a irregularidade natural da linha frontal. É isso que separa um cabelo transplantado de um cabelo que simplesmente parece seu.</p>
        </div>
      </div>
    </div>
  </section>

  <section class="section section--tint">
    <div class="shell">
      <div class="section-head">
        <span class="eyebrow">Indicações</span>
        <h2>Para quem o FUE <em>está indicado</em>.</h2>
      </div>
      <div class="prose" style="max-width:54rem">
        <p>A técnica FUE é a escolha padrão para a maioria dos pacientes com alopecia androgenética (calvície masculina ou feminina padrão) que tenham área doadora suficiente. Também é usada em correção de cicatrizes, densificação de entradas e reconstrução de barba ou sobrancelha em casos selecionados.</p>
        <table class="spec">
          <tbody>
            <tr><th>Indicado quando</th><td>Há rarefação frontal, de meio ou de coroa com área doadora occipital adequada e expectativa realista de resultado.</td></tr>
            <tr><th>Pode não ser indicado quando</th><td>A área doadora está comprometida, a calvície ainda está em evolução rápida sem tratamento clínico, ou há condições clínicas que contraindicam cirurgia eletiva.</td></tr>
            <tr><th>Duração</th><td>6 a 8 horas, ambulatorial, com alta no mesmo dia.</td></tr>
            <tr><th>Anestesia</th><td>Local. O paciente permanece acordado.</td></tr>
            <tr><th>Cicatriz</th><td>Microcicatrizes pontuais na doadora, imperceptíveis com cabelo curto a partir de cerca de 1 cm.</td></tr>
            <tr><th>Resultado final</th><td>Entre 12 e 15 meses, com ganhos progressivos a partir do 3º mês.</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <section class="section" id="sem-raspagem">
    <div class="shell">
      <div class="split split--flip">
        <div class="split__body prose">
          <span class="eyebrow">Sem raspagem</span>
          <h2>FUE <em>no-shave</em> em casos selecionados.</h2>
          <p>Nem todo paciente pode — ou quer — raspar a cabeça. A técnica sem raspagem mantém o comprimento do cabelo na área receptora e, em alguns protocolos, também na doadora. O custo é tempo: cada unidade exige mais manipulação, então o número de enxertos por sessão é menor.</p>
          <p>A indicação depende do planejamento. Em reconstruções grandes, a raspagem parcial ou total da doadora ainda é a via mais eficiente. Na avaliação, apresentamos as opções com o número de unidades foliculares e o tempo cirúrgico de cada uma.</p>
          <div class="callout">
            <p>A decisão entre FUE com raspagem e sem raspagem é clínica, não cosmética. O que prevalece é a qualidade do resultado a longo prazo.</p>
          </div>
        </div>
        <div class="split__media">
          ${picture('case-01-depois', [640, 960, 1440], '(max-width:1080px) 100vw, 42vw', 'Resultado de reconstrução da linha frontal por FUE', { w: 960, h: 540 })}
        </div>
      </div>
    </div>
  </section>

  <section class="section section--dark">
    <div class="shell">
      <div class="section-head">
        <span class="eyebrow">Etapas</span>
        <h2>Como a cirurgia <em>acontece</em>.</h2>
      </div>
      <ol class="journey" style="color:#dfe2ea">
        <li><div><h4 style="color:var(--bone)">Marcação e anestesia</h4><p style="color:#a3a9ba">Desenho final da linha frontal, demarcação das zonas de densidade e anestesia local da doadora e da receptora.</p><span class="journey__when" style="color:var(--gold)">Início</span></div></li>
        <li><div><h4 style="color:var(--bone)">Extração</h4><p style="color:#a3a9ba">Retirada individual das unidades foliculares com punch calibrado, distribuída para preservar a densidade da doadora.</p><span class="journey__when" style="color:var(--gold)">Fase 1</span></div></li>
        <li><div><h4 style="color:var(--bone)">Preparo dos enxertos</h4><p style="color:#a3a9ba">Seleção e classificação sob microscopia, mantidos em solução refrigerada até o implante.</p><span class="journey__when" style="color:var(--gold)">Fase 2</span></div></li>
        <li><div><h4 style="color:var(--bone)">Implante</h4><p style="color:#a3a9ba">Abertura dos canais e colocação dos enxertos respeitando ângulo, direção e densidade planejados.</p><span class="journey__when" style="color:var(--gold)">Fase 3</span></div></li>
        <li><div><h4 style="color:var(--bone)">Alta e orientações</h4><p style="color:#a3a9ba">Curativo da doadora, kit de pós-operatório, canal direto no WhatsApp e data do primeiro retorno.</p><span class="journey__when" style="color:var(--gold)">Mesmo dia</span></div></li>
      </ol>
    </div>
  </section>

  <section class="section section--tint">
    <div class="shell">
      <div class="section-head">
        <span class="eyebrow">Recuperação</span>
        <h2>O que esperar nos <em>primeiros meses</em>.</h2>
      </div>
      <div class="prose">
        <ul>
          <li><strong>Dias 1 a 5:</strong> edema leve possível na testa, crostas na receptora, lavagem orientada a partir do 2º dia. Trabalho administrativo costuma ser retomado entre o 3º e o 5º dia.</li>
          <li><strong>Semanas 2 a 6:</strong> queda dos fios transplantados (shock loss) — esperada e temporária. O folículo permanece.</li>
          <li><strong>Mês 3 ao 6:</strong> início do crescimento novo, ainda fino.</li>
          <li><strong>Mês 6 ao 9:</strong> ganho visível de densidade e calibre.</li>
          <li><strong>Mês 12 ao 15:</strong> maturação da haste e resultado final.</li>
        </ul>
        <p>O acompanhamento fotográfico padronizado em cada retorno permite comparar evolução real, não impressão.</p>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="shell">
      <div class="section-head">
        <span class="eyebrow">Dúvidas</span>
        <h2>Perguntas sobre <em>FUE</em>.</h2>
      </div>
      <div class="faq">
        <details><summary>O que é a técnica FUE de transplante capilar?</summary><p>FUE (Follicular Unit Extraction) é a extração de unidades foliculares uma a uma da área doadora occipital, sem remover uma faixa de couro cabeludo. Não deixa cicatriz linear; as microcicatrizes pontuais ficam escondidas sob o cabelo remanescente.</p></details>
        <details><summary>Qual a diferença entre FUE e FUT?</summary><p>Na FUT (ou strip), remove-se uma faixa de couro cabeludo da área doadora, o que deixa uma cicatriz linear. Na FUE, cada unidade é retirada individualmente. A FUE costuma ter recuperação mais rápida da área doadora e permite cortes de cabelo mais curtos no futuro.</p></details>
        <details><summary>Dá para fazer FUE sem raspar a cabeça?</summary><p>Sim, em casos selecionados. A técnica sem raspagem exige áreas menores e mais tempo por unidade folicular. A indicação depende do número de enxertos e das características da área doadora — definida na avaliação.</p></details>
        <details><summary>Quantas unidades foliculares um transplante FUE precisa?</summary><p>Depende do grau de calvície, da densidade da área doadora e do objetivo estético. Casos de reconstrução frontal costumam ficar entre 2.000 e 3.500 unidades foliculares, definidas na tricoscopia.</p></details>
        <details><summary>Quanto custa um transplante FUE em São Paulo?</summary><p>O valor depende do número de unidades foliculares e do tempo cirúrgico. O orçamento é fechado após a avaliação e apresentado por escrito, com o que está incluído.</p></details>
      </div>
      <p style="margin-top:2.5rem"><a class="btn" href="${WA}" target="_blank" rel="noopener">Agendar avaliação FUE</a></p>
    </div>
  </section>
`,
});

/* ─── MMP ───────────────────────────────────────────────────────────────── */
pages.push({
  out: 'mmp-capilar/index.html',
  title: 'MMP Capilar em São Paulo — Microinfusão Capilar | Dr. Gabriel Galeb',
  description:
    'MMP capilar (microinfusão de medicamentos no couro cabeludo) em São Paulo. Tratamento para queda ativa, afinamento e manutenção do cabelo nativo antes ou depois do transplante.',
  canonical: 'https://www.drgabrielgaleb.com.br/mmp-capilar/',
  path: '/mmp-capilar/',
  crumbs: [
    { href: '/', label: 'Início' },
    { href: '/mmp-capilar/', label: 'MMP capilar' },
  ],
  heroEyebrow: 'Tratamento clínico',
  heroTitle: 'MMP capilar em <em>São Paulo</em>',
  heroLede:
    'Microinfusão de medicamentos pelo próprio couro cabeludo. Indicada para queda ativa, afinamento difuso e para preservar o cabelo nativo — sozinha ou junto com o transplante.',
  schema: {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'MedicalProcedure',
        '@id': 'https://www.drgabrielgaleb.com.br/mmp-capilar/#procedure',
        name: 'MMP Capilar',
        alternateName: [
          'Microinfusão de medicamentos no couro cabeludo',
          'Microinfusão capilar',
          'MMP Hair',
        ],
        description:
          'Protocolo de microinfusão de medicamentos personalizados no couro cabeludo, indicado para alopecia androgenética em fase ativa, afinamento difuso e manutenção do cabelo nativo. Realizado pelo Dr. Gabriel Galeb em Alphaville, Grande São Paulo.',
        procedureType: 'PercutaneousProcedure',
        bodyLocation: 'Scalp',
        howPerformed:
          'Aplicação de ativos selecionados por microagulhas de precisão no couro cabeludo, em sessão ambulatorial. Sem afastamento do trabalho.',
        provider: { '@id': 'https://www.drgabrielgaleb.com.br/sobre/#physician' },
      },
      {
        '@type': 'FAQPage',
        mainEntity: [
          {
            '@type': 'Question',
            name: 'O que é MMP capilar?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'MMP (Microinfusão de Medicamentos na Pele) capilar é a entrega de ativos diretamente no couro cabeludo por microagulhas. Permite concentrar o medicamento na região do folículo com pouca dispersão sistêmica.',
            },
          },
          {
            '@type': 'Question',
            name: 'MMP capilar substitui o transplante?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Não. O MMP trata e preserva o cabelo que ainda existe; o transplante redistribui folículos para áreas já rarefeitas. Em muitos casos os dois se combinam: o MMP segura o nativo enquanto o FUE reconstrói o que já se perdeu.',
            },
          },
          {
            '@type': 'Question',
            name: 'MMP capilar dói?',
            acceptedAnswer: {
              '@type': 'Answer',
              text: 'Há desconforto leve a moderado durante a aplicação. A sessão dura em média 30 a 45 minutos e o paciente retoma a rotina no mesmo dia.',
            },
          },
        ],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://www.drgabrielgaleb.com.br/' },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'MMP capilar',
            item: 'https://www.drgabrielgaleb.com.br/mmp-capilar/',
          },
        ],
      },
      {
        '@type': 'WebPage',
        '@id': 'https://www.drgabrielgaleb.com.br/mmp-capilar/#webpage',
        url: 'https://www.drgabrielgaleb.com.br/mmp-capilar/',
        name: 'MMP Capilar em São Paulo — Microinfusão Capilar | Dr. Gabriel Galeb',
        isPartOf: { '@id': 'https://www.drgabrielgaleb.com.br/#website' },
        about: { '@id': 'https://www.drgabrielgaleb.com.br/mmp-capilar/#procedure' },
        inLanguage: 'pt-BR',
        lastReviewed: '2026-08-02',
        reviewedBy: { '@id': 'https://www.drgabrielgaleb.com.br/sobre/#physician' },
      },
    ],
  },
  body: `
  <section class="section">
    <div class="shell">
      <div class="split">
        <div class="split__media">
          ${picture('eval-feminina', [640, 960, 1440], '(max-width:1080px) 100vw, 38vw', 'Rarefação difusa do topo da cabeça, indicação clássica de avaliação para MMP capilar', { w: 960, h: 540, loading: 'eager' })}
        </div>
        <div class="split__body prose">
          <span class="eyebrow">O protocolo</span>
          <h2>Ativos onde o folículo <em>está</em>.</h2>
          <p>A microinfusão leva o medicamento ao couro cabeludo por microagulhas, em profundidade controlada. A ideia é simples: concentrar o ativo na região do folículo, com menos dispersão sistêmica do que a via oral e com penetração maior do que um tópico comum.</p>
          <p>Os ativos são escolhidos caso a caso — não existe um frasco padrão para todo paciente. A composição considera o tipo de alopecia, exames, medicações em uso e o objetivo (frear a queda, engrossar o fio ou preparar o terreno para a cirurgia).</p>
        </div>
      </div>
    </div>
  </section>

  <section class="section section--tint">
    <div class="shell">
      <div class="section-head">
        <span class="eyebrow">Quando indicar</span>
        <h2>Queda ativa, afinamento e <em>manutenção</em>.</h2>
      </div>
      <div class="prose">
        <table class="spec">
          <tbody>
            <tr><th>Queda em atividade</th><td>Quando o teste de tração e a tricoscopia mostram miniaturização e eflúvio em curso.</td></tr>
            <tr><th>Afinamento difuso</th><td>Especialmente no padrão feminino (Ludwig) e no vértice masculino em estágios iniciais.</td></tr>
            <tr><th>Pré-transplante</th><td>Para estabilizar o cabelo nativo antes da cirurgia e melhorar o terreno receptor.</td></tr>
            <tr><th>Pós-transplante</th><td>Para proteger o cabelo que não foi transplantado e que continua sujeito à DHT.</td></tr>
            <tr><th>Sessão</th><td>30 a 45 minutos, ambulatorial, sem afastamento do trabalho.</td></tr>
            <tr><th>Intervalo</th><td>Definido na avaliação — em geral sessões mensais no início, depois manutenção.</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </section>

  <section class="section" id="feminina">
    <div class="shell">
      <div class="split split--flip">
        <div class="split__body prose">
          <span class="eyebrow">Alopecia feminina</span>
          <h2>Quando a prioridade é <em>fechar a risca</em>.</h2>
          <p>Na mulher, a rarefação costuma ser difusa — a risca alarga, o topo afina, a linha frontal em geral se mantém. Nem sempre a cirurgia é o primeiro passo. O MMP capilar, associado ao tratamento clínico, pode recuperar densidade perceptível antes de se discutir enxertos.</p>
          <p>Quando o transplante entra no plano, o desenho muda: a prioridade é densificar a região central e fechar a risca, não recriar uma linha frontal masculina. A avaliação define a ordem — clínico, MMP, cirurgia, ou a combinação dos três.</p>
          <p><a class="textlink" href="/resultados/">Ver caso de densificação feminina ${ICONS.arrow}</a></p>
        </div>
        <div class="split__media">
          ${picture('case-03-antes', [640, 960, 1440], '(max-width:1080px) 100vw, 42vw', 'Rarefação central e risca alargada em paciente feminina antes do tratamento', { w: 960, h: 540 })}
        </div>
      </div>
    </div>
  </section>

  <section class="section section--dark">
    <div class="shell">
      <div class="section-head">
        <span class="eyebrow">Combinação</span>
        <h2>MMP e transplante <em>juntos</em>.</h2>
        <p class="lede">O MMP não substitui o FUE. Em muitos planos, os dois se completam.</p>
      </div>
      <div class="inclusions">
        <div class="inclusion">
          <h4>O que o MMP faz</h4>
          <ul>
            <li>Frea a miniaturização do fio nativo</li>
            <li>Melhora calibre e densidade residual</li>
            <li>Prepara o couro cabeludo para a cirurgia</li>
            <li>Mantém o resultado depois do transplante</li>
          </ul>
        </div>
        <div class="inclusion">
          <h4>O que só o FUE faz</h4>
          <ul>
            <li>Redistribui folículos para áreas vazias</li>
            <li>Reconstrói a linha frontal</li>
            <li>Cobre regiões sem fio viável</li>
            <li>Entrega densidade onde não há mais reserva local</li>
          </ul>
        </div>
      </div>
    </div>
  </section>

  <section class="section">
    <div class="shell">
      <div class="section-head">
        <span class="eyebrow">Dúvidas</span>
        <h2>Perguntas sobre <em>MMP</em>.</h2>
      </div>
      <div class="faq">
        <details><summary>O que é MMP capilar?</summary><p>MMP (Microinfusão de Medicamentos na Pele) capilar é a entrega de ativos diretamente no couro cabeludo por microagulhas. Permite concentrar o medicamento na região do folículo com pouca dispersão sistêmica.</p></details>
        <details><summary>MMP capilar substitui o transplante?</summary><p>Não. O MMP trata e preserva o cabelo que ainda existe; o transplante redistribui folículos para áreas já rarefeitas. Em muitos casos os dois se combinam.</p></details>
        <details><summary>MMP capilar dói?</summary><p>Há desconforto leve a moderado durante a aplicação. A sessão dura em média 30 a 45 minutos e o paciente retoma a rotina no mesmo dia.</p></details>
        <details><summary>Quantas sessões são necessárias?</summary><p>O protocolo inicial costuma incluir um ciclo mensal, seguido de manutenção. O número exato depende da resposta observada na tricoscopia de controle.</p></details>
      </div>
      <p style="margin-top:2.5rem"><a class="btn" href="${WA}" target="_blank" rel="noopener">Agendar avaliação</a></p>
    </div>
  </section>
`,
});

/* ─── RESULTADOS ────────────────────────────────────────────────────────── */
pages.push({
  out: 'resultados/index.html',
  title: 'Antes e Depois — Resultados de Transplante Capilar | Dr. Gabriel Galeb',
  description:
    'Galeria de antes e depois de transplante capilar e tratamentos do Dr. Gabriel Galeb em São Paulo. Casos reais, mesmo enquadramento, sem retoque de densidade.',
  canonical: 'https://www.drgabrielgaleb.com.br/resultados/',
  path: '/resultados/',
  crumbs: [
    { href: '/', label: 'Início' },
    { href: '/resultados/', label: 'Resultados' },
  ],
  heroEyebrow: 'Galeria clínica',
  heroTitle: 'Antes e depois — <em>casos reais</em>',
  heroLede:
    'Imagens de pacientes do Dr. Gabriel Galeb, com o mesmo enquadramento antes e depois. Sem retoque de densidade. Publicadas com autorização, conforme a Resolução CFM nº 2.336/2023.',
  schema: {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': 'https://www.drgabrielgaleb.com.br/resultados/#webpage',
        url: 'https://www.drgabrielgaleb.com.br/resultados/',
        name: 'Antes e Depois — Resultados de Transplante Capilar | Dr. Gabriel Galeb',
        description:
          'Galeria de resultados reais de transplante capilar FUE e tratamentos capilares do Dr. Gabriel Galeb.',
        isPartOf: { '@id': 'https://www.drgabrielgaleb.com.br/#website' },
        about: { '@id': 'https://www.drgabrielgaleb.com.br/#clinic' },
        inLanguage: 'pt-BR',
        lastReviewed: '2026-08-02',
        reviewedBy: { '@id': 'https://www.drgabrielgaleb.com.br/sobre/#physician' },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Início', item: 'https://www.drgabrielgaleb.com.br/' },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Resultados',
            item: 'https://www.drgabrielgaleb.com.br/resultados/',
          },
        ],
      },
      {
        '@type': 'ImageGallery',
        name: 'Resultados de transplante capilar — Dr. Gabriel Galeb',
        associatedMedia: [
          {
            '@type': 'ImageObject',
            contentUrl: 'https://www.drgabrielgaleb.com.br/assets/img/case-01-depois-1440.jpg',
            name: 'Caso 01 — depois: reconstrução da linha frontal',
          },
          {
            '@type': 'ImageObject',
            contentUrl: 'https://www.drgabrielgaleb.com.br/assets/img/case-02-depois-1440.jpg',
            name: 'Caso 02 — depois: calvície avançada, pós-operatório inicial',
          },
          {
            '@type': 'ImageObject',
            contentUrl: 'https://www.drgabrielgaleb.com.br/assets/img/case-03-depois-1440.jpg',
            name: 'Caso 03 — depois: densificação feminina',
          },
        ],
      },
    ],
  },
  body: `
  <section class="section section--dark">
    <div class="shell">
      <div class="coverflow-stage">
        <div class="coverflow" data-coverflow tabindex="0" aria-roledescription="carrossel" aria-label="Galeria coverflow de casos antes e depois">
          <div class="coverflow__deck">
          ${coverflowCard({
            id: 'caso-01', i: 0, pos: 52, loading: 'eager', hero: true,
            before: { base: 'case-01-antes', alt: 'Antes: linha frontal recuada e fios miniaturizados' },
            after: { base: 'case-01-depois', alt: 'Depois: linha frontal reconstruída com densidade natural' },
            title: 'Reconstrução da linha frontal',
            subtitle: 'Homem &middot; FUE &middot; Resultado consolidado',
          })}
          ${coverflowCard({
            id: 'caso-02', i: 1, pos: 50,
            before: { base: 'case-02-antes', alt: 'Antes: calvície avançada sem fios na região frontal' },
            after: { base: 'case-02-depois', alt: 'Depois: nova linha frontal implantada em fase inicial' },
            title: 'Calvície avançada',
            subtitle: 'Homem &middot; FUE área extensa &middot; Pós-operatório inicial',
          })}
          ${coverflowCard({
            id: 'caso-03', i: 2, pos: 48,
            before: { base: 'case-03-antes', alt: 'Antes: risca alargada e rarefação central' },
            after: { base: 'case-03-depois', alt: 'Depois: risca fechada e maior densidade' },
            title: 'Densificação feminina',
            subtitle: 'Mulher &middot; Protocolo capilar &middot; Mesma risca',
          })}
          </div>
          <div class="coverflow__controls">
            <button class="ba-carousel__btn" type="button" data-coverflow-prev aria-label="Caso anterior">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>
            </button>
            <div class="ba-carousel__dots" data-coverflow-dots role="tablist" aria-label="Ir para o caso">
              <button type="button" aria-label="Caso 01" aria-current="true"></button>
              <button type="button" aria-label="Caso 02"></button>
              <button type="button" aria-label="Caso 03"></button>
            </div>
            <button class="ba-carousel__btn" type="button" data-coverflow-next aria-label="Próximo caso">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M9 6l6 6-6 6"/></svg>
            </button>
          </div>
          <p class="coverflow__hint">Arraste o controle dourado para comparar &middot; Clique nas laterais ou use as setas</p>
        </div>
      </div>

      <p class="disclaimer">
        Imagens de pacientes reais, publicadas com autorização expressa e finalidade educativa, conforme a
        Resolução CFM nº 2.336/2023. Resultados variam conforme a densidade da área doadora, o grau de
        calvície, a resposta individual e a adesão ao pós-operatório. Nenhuma imagem constitui promessa ou
        garantia de resultado. Arraste o controle no centro da foto em destaque para comparar.
      </p>
    </div>
  </section>

  <section class="section section--tint">
    <div class="shell">
      <div class="section-head">
        <span class="eyebrow">Documentação clínica</span>
        <h2>Outros registros da <em>avaliação</em>.</h2>
        <p class="lede">Imagens de consulta e planejamento — não são pares antes/depois.</p>
      </div>
      <div class="cards" style="grid-template-columns:repeat(auto-fit,minmax(16rem,1fr))">
        <article class="card" style="background:var(--ink-2)">
          <div class="card__media">
            ${picture('eval-vertice', [640, 960, 1440], '(max-width:780px) 92vw, 30vw', 'Avaliação do vértice: rarefação no topo da cabeça documentada na consulta', { w: 960, h: 540 })}
          </div>
          <div class="card__body">
            <h3 style="font-size:1.25rem">Avaliação do vértice</h3>
            <p>Documentação da rarefação no topo — ponto de partida do planejamento de densidade.</p>
          </div>
        </article>
        <article class="card" style="background:var(--ink-2)">
          <div class="card__media">
            ${picture('dr-planning', [560, 840], '(max-width:780px) 92vw, 30vw', 'Planejamento da linha frontal com paquímetro', { w: 840, h: 1092 })}
          </div>
          <div class="card__body">
            <h3 style="font-size:1.25rem">Desenho da linha frontal</h3>
            <p>Medição e marcação sobre o paciente antes de qualquer incisão.</p>
          </div>
        </article>
        <article class="card" style="background:var(--ink-2)">
          <div class="card__media">
            ${picture('result-frontal', [640, 960, 1440], '(max-width:780px) 92vw, 30vw', 'Linha frontal densa após maturação do transplante', { w: 960, h: 540 })}
          </div>
          <div class="card__body">
            <h3 style="font-size:1.25rem">Linha frontal madura</h3>
            <p>Registro de densidade e transição natural após a maturação dos enxertos.</p>
          </div>
        </article>
      </div>
    </div>
  </section>

  <section class="section section--dark">
    <div class="shell" style="text-align:center;max-width:40rem;margin-inline:auto">
      <span class="eyebrow">Próximo passo</span>
      <h2 style="margin-top:1.1rem">Quer ver o que é possível no <em>seu caso</em>?</h2>
      <p class="lede" style="margin:1.35rem auto 0">Na avaliação, projetamos a linha frontal e o número de unidades foliculares sobre as suas fotos — não sobre um caso genérico.</p>
      <div class="btn-row" style="margin-top:2.25rem;justify-content:center">
        <a class="btn" href="${WA}" target="_blank" rel="noopener">Agendar avaliação</a>
        <a class="btn btn--ghost" href="/transplante-capilar-fue/">Entender a técnica FUE</a>
      </div>
    </div>
  </section>
`,
});

for (const page of pages) {
  const html = shell(page);
  const out = path.join(process.cwd(), page.out);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
  console.log('wrote', page.out, `(${(html.length / 1024).toFixed(1)} KB)`);
}
