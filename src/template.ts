export default `
<!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
    <title>EPUB.js</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jszip/3.1.5/jszip.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/epubjs/dist/epub.min.js"></script>

    <style type="text/css">
      body {
        margin: 0;
      }

      #viewer {
        height: 100vh;
        width: 100vw;
        overflow: hidden !important;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    </style>
  </head>

  <body oncopy='return false' oncut='return false'>
    <div id="viewer"></div>

    <script>
      let book;
      let rendition;

      const type = window.type;
      const file = window.book;
      const theme = window.theme;
      const initialLocations = window.locations;
      const enableSelection = window.enable_selection;

      if (!file) {
        alert('Failed load book');
      }

      if (type === 'epub' || type === 'opf' || type === 'binary') {
        book = ePub(file);
      } else if (type === 'base64') {
        book = ePub(file, { encoding: "base64" });
      } else {
        alert('Missing file type');
      }

      const makeRangeCfi = (a, b) => {
        const CFI = new ePub.CFI()
        const start = CFI.parse(a), end = CFI.parse(b)
        const cfi = {
            range: true,
            base: start.base,
            path: {
                steps: [],
                terminal: null
            },
            start: start.path,
            end: end.path
        }
        const len = cfi.start.steps.length
        for (let i = 0; i < len; i++) {
            if (CFI.equalStep(cfi.start.steps[i], cfi.end.steps[i])) {
                if (i == len - 1) {
                    // Last step is equal, check terminals
                    if (cfi.start.terminal === cfi.end.terminal) {
                        // CFI's are equal
                        cfi.path.steps.push(cfi.start.steps[i])
                        // Not a range
                        cfi.range = false
                    }
                } else cfi.path.steps.push(cfi.start.steps[i])
            } else break
        }
        cfi.start.steps = cfi.start.steps.slice(cfi.path.steps.length)
        cfi.end.steps = cfi.end.steps.slice(cfi.path.steps.length)
    
        return 'epubcfi(' + CFI.segmentString(cfi.base)
            + '!' + CFI.segmentString(cfi.path)
            + ',' + CFI.segmentString(cfi.start)
            + ',' + CFI.segmentString(cfi.end)
            + ')'
      }

      rendition = book.renderTo("viewer", {
        width: "100%",
        height: "100%",
      });

      window.ReactNativeWebView.postMessage(JSON.stringify({ type: "onStarted" }));

      book.ready
        .then(function () {
          if (initialLocations) {
            book.locations.load(initialLocations);
            var displayed = rendition.display();

            displayed.then(function () {
            var currentLocation = rendition.currentLocation();

              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: "onReady",
                totalLocations: book.locations.length(),
                currentLocation: currentLocation,
                progress: book.locations.percentageFromCfi(currentLocation.start.cfi),
              }));
            });

            // window.ReactNativeWebView.postMessage(JSON.stringify({
            //   type: "onLocationsReady",
            //   epubKey: book.key(),
            //   locations: book.locations.save(),
            // }));

            book.loaded.navigation.then(function (toc) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'onNavigationLoaded',
                toc: toc,
              }));
            });
          } else book.locations.generate(950).then(() => {
            var displayed = rendition.display();

            displayed.then(function () {
              var currentLocation = rendition.currentLocation();
  
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: "onReady",
                totalLocations: book.locations.length(),
                currentLocation: currentLocation,
                progress: book.locations.percentageFromCfi(currentLocation.start.cfi),
              }));
            });
  
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: "onLocationsReady",
              epubKey: book.key(),
              locations: book.locations.save(),
            }));
  
            book.loaded.navigation.then(function (toc) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'onNavigationLoaded',
                toc: toc,
              }));
            });
          });
        })
        .catch(function (err) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
          type: "onDisplayError",
          reason: err
        }));
      });

      rendition.on('started', () => {
        rendition.themes.register({ theme: theme });
        rendition.themes.select('theme');
      });

      rendition.on("relocated", function (location) {
        var percent = book.locations.percentageFromCfi(location.start.cfi);
        var percentage = Math.floor(percent * 100);

        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: "onLocationChange",
          totalLocations: book.locations.length(),
          currentLocation: location,
          progress: percentage,
        }));

        if (location.atStart) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: "onBeginning",
          }));
        }

        if (location.atEnd) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: "onFinish",
          }));
        }
      });

      rendition.on("orientationchange", function (orientation) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'onOrientationChange',
          orientation: orientation
        }));
      });

      rendition.on("rendered", function (section) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'onRendered',
          section: section,
          currentSection: book.navigation.get(section.href),
        }));
      });

      rendition.on("layout", function (layout) {
        window.ReactNativeWebView.postMessage(JSON.stringify({
          type: 'onLayout',
          layout: layout,
        }));
      });

      rendition.on("selected", function (cfiRange, contents) {
        rendition.annotations.add("highlight", cfiRange, {}, (e) => {
          console.log("highlight clicked", e.target);
        });

        contents.window.getSelection().removeAllRanges();
          book.getRange(cfiRange).then(function (range) {
            if (range) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'onSelected',
                cfiRange: cfiRange,
                text: range.toString(),
              }));
            }
          });
        });

        rendition.on("markClicked", function (cfiRange, contents) {
          rendition.annotations.remove(cfiRange, "highlight");
          book.getRange(cfiRange).then(function (range) {
            if (range) {
              window.ReactNativeWebView.postMessage(JSON.stringify({
                type: 'onMarkPressed',
                cfiRange: cfiRange,
                text: range.toString(),
              }));
            }
          });
        });

        rendition.on("resized", function (layout) {
          window.ReactNativeWebView.postMessage(JSON.stringify({
            type: 'onResized',
            layout: layout,
          }));
        });
    </script>
  </body>
</html>
`;
