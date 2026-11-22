# tools: render checks without a browser

`node tools/render-temple.js` and `node tools/render-pillars.js` run the reference demos' drawing code in Node with a stubbed DOM and write PNGs to `tools/out/` (temple at scroll 0% and 100%; pillars at pour 0, 50 and 100% for each order). Use them to eyeball art changes quickly, and to check that the pediment apex is not clipped and the ghost-to-marble pour still works after edits. They do not test the DOM, events or the page layout; use Playwright for that.
