
// active slide, typed.js instances
let index = 0,
  interval = parseInt(document.getElementById('Interval').value),
  tCaption, tText;

// typed.js default options
const typeWriterOptions = {
  contentType: 'html',
  backDelay: 5000,
  typeSpeed: 60,
  showCursor: false
};

async function sleep(z) {
  await new Promise(r => setTimeout(r, z));
}

async function changeSlide() {
  await sleep(interval);
  $('#homepageBanner').carousel('next');
}

function onCompleteCaptionTyping() {
  const opt = {
    ...typeWriterOptions,
    startDelay: 1000,
    stringsElement: `#typed-text-${index}`,
    onComplete: changeSlide
  }
  tText = new Typed('#tText', opt);
}

function init() {
  if (tCaption) tCaption.destroy();
  if (tText) tText.destroy();

  const opt = {
    ...typeWriterOptions,
    startDelay: 500,
    stringsElement: `#typed-caption-${index}`,
    onComplete: onCompleteCaptionTyping
  }
  tCaption = new Typed('#tCaption', opt);
}

$(document).ready(function () {
  init();

  $('#homepageBanner').on('slide.bs.carousel', function () {
    $('#tCaption, #tText').text('');
  });
  $('#homepageBanner').on('slid.bs.carousel', function () {
    index = $(this).find('.active').index();
    init();
  });

});