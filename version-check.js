const KEY = 'yearglass-app-version';
fetch('/app-version.json', {cache: 'no-store'})
  .then(r => r.json())
  .then(data => {
    const stored = localStorage.getItem(KEY);
    if (stored && stored !== data.build) {
      console.log('New version detected:', data.build, '— refreshing');
      localStorage.setItem(KEY, data.build);
      window.location.reload();
    } else {
      localStorage.setItem(KEY, data.build);
    }
  })
  .catch(() => {});
