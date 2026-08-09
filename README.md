# Dr. Gabriel Galeb — Transplante Capilar

Site estático da clínica: técnica FUE, MMP capilar e avaliação individual em Alphaville (Grande São Paulo).

## Estrutura

| Rota | Página |
|------|--------|
| `/` | Home |
| `/sobre/` | O médico |
| `/transplante-capilar-fue/` | Serviço FUE |
| `/mmp-capilar/` | Serviço MMP |
| `/resultados/` | Antes e depois |

As fotos originais ficam em `assets/src/` (baixadas do site atual do Dr. Gabriel). Os derivados servidos (`assets/img/*`) são gerados por `npm run build:images`.

## Desenvolvimento

```bash
npm install
npm run build:images   # regenera AVIF/WebP/JPEG a partir de assets/src
npm run build:pages    # regenera as subpáginas SEO
npm run serve          # http://127.0.0.1:8899
SITE_URL=http://127.0.0.1:8899 npm run test:e2e
```

Deploy: push em `main` → Render static site `gabriel-galeb-site` (publish path `.`).
