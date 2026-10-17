# Print Layout App: Stack and Plan

Your app is a print-layout editor, not only an image editor. I recommend a browser app first. It keeps the stack small and lets you test print output early.

## Stack to learn

- **HTML and CSS:** page structure, text flow, print styles, and millimetre units.
- **TypeScript:** document data, measurements, and fewer avoidable errors.
- **React:** editor controls, forms, and reusable templates.
- **Vite:** a simple way to run and build the app.
- **Browser APIs:** file import, image preview, and local storage.

Start without a server or database. Save designs and imported image files in IndexedDB after the first editor works.

## Important design choice

Use HTML and CSS to render the page, card, and token layouts. This makes text selection and text flow simpler than a canvas-first editor. Store each design as data, with measurements in millimetres. For example, store a token diameter as `25`, `50`, or `75`.

For the first text-wrap feature, support simple shapes such as rectangles and circles. Wrapping text around the exact outline of any PNG or JPEG is a harder feature. Add it later if you need it.

Use CSS print rules for A4 and A5 pages. Start PDF export with the browser print dialog. Check the printed size with a ruler. Add a more controlled PDF export only if the first method does not meet your needs.

## Build in small steps

1. Show one A4 page on screen and print it at the correct size.
2. Add text blocks and image import.
3. Add image placement and simple text wrap.
4. Add one card template and its form.
5. Add round tokens with the three diameters and a color ring.
6. Save and reopen a design.
7. Add PDF export and test it with real printers.

Learn each part as the project needs it. I suggest we start with the A4 page and print test, then add one feature at a time.
