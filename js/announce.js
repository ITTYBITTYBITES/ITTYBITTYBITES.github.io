/* Announcement bar: shows the first non-expired slide statically (no
   rotation — rotating slides changed the bar's height and pushed the
   header up and down). Drops slides whose data-expire date has passed
   (e.g. the Hospice badge after Nov 30, 2026) — no rebuild required.
   Slides without data-expire stay until edited. */
(function () {
  var bar = document.getElementById('announce-bar');
  if (!bar) return;
  bar.classList.add('js-ready');
  var slides = Array.prototype.slice.call(bar.querySelectorAll('.announce-slide'));
  var now = new Date();
  var visible = slides.filter(function (slide) {
    var expire = slide.getAttribute('data-expire');
    return !expire || new Date(expire) >= now;
  });
  slides.forEach(function (slide) {
    if (visible.indexOf(slide) === -1) slide.parentNode.removeChild(slide);
  });
  if (visible.length === 0) {
    bar.parentNode.removeChild(bar);
    return;
  }
  var index = visible.indexOf(bar.querySelector('.announce-slide.is-active'));
  if (index < 0) index = 0;
  visible.forEach(function (slide, j) {
    slide.classList.toggle('is-active', j === index);
  });
})();
