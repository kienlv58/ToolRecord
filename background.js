chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('index.html', {
    id: "desktopCaptureID",
    innerBounds: {
      width: 1000,
      height: 600,
      minWidth:700,
      minHeight:600
    }
  });
});