# Dr. Gabriel Galeb — site institucional

Site estático trilíngue (português, espanhol e inglês) para a clínica do
Dr. Gabriel Galeb. A interface mantém a direção visual *quiet luxury* em preto,
creme e dourado, com conteúdo e fotografias conferidos com o site institucional
de referência.

## Desenvolvimento

Requer Node.js 20.9 ou superior.

```bash
npm install
npx playwright install chromium
npm run images
npm test
```

`npm run images` valida formato e dimensões das versões WebP de exibição. As
imagens preservam o conteúdo e as cores das fotografias do site de referência.

`npm test` inicia um servidor local isolado, executa as verificações Playwright
e salva capturas de desktop, tablet e celular em `e2e/artifacts/`.

## Idiomas

Português é o idioma padrão. O seletor `PT / ES / EN` atualiza o conteúdo,
metadados, textos acessíveis e mensagens de agendamento; a escolha é preservada
no navegador e também pode ser definida por `?lang=pt`, `?lang=es` ou
`?lang=en`.
