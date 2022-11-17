/*
      ALGOLIA SEARCH AUTOCOMPLETE
        Will be moved to (create) a new module
        probably preact.js
   */

import algoliasearch from 'https://cdn.jsdelivr.net/npm/algoliasearch@4.14.2/dist/algoliasearch-lite.esm.browser.js';

const {
  autocomplete,
  getAlgoliaResults,
  getAlgoliaFacets
} = window['@algolia/autocomplete-js'];

const { createQuerySuggestionsPlugin } = window[
  '@algolia/autocomplete-plugin-query-suggestions'
];

const searchClient = algoliasearch(
  ALGOLIA_CONFIG.appId,
  ALGOLIA_CONFIG.apiKey
);

const querySuggestionsPlugin = createQuerySuggestionsPlugin({
  searchClient,
  indexName: ALGOLIA_CONFIG.indices.querySgst,
  getSearchParams({ state }) {
    return {
      hitsPerPage: state.query ? 3 : 5
    };
  },
});

for (const selector of ['#autocomplete', '#autocompleteMobile']) {
  autocomplete({
    container: selector,
    placeholder: ALGOLIA_CONFIG.languageKey == 'bn'
      ? `পণ্য খুঁজুন`
      : `Search for products`,
    plugins: [querySuggestionsPlugin],
    openOnFocus: true,
    getSources({ state, query }) {
      if (!query) {
        return [];
      }
      return [
        {
          sourceId: 'products',
          getItemInputValue: ({ item }) => item.query,
          getItems({ query }) {
            return getAlgoliaResults({
              searchClient,
              queries: [
                {
                  indexName: ALGOLIA_CONFIG.indices.root,
                  query,
                  params: {
                    hitsPerPage: 4,
                    attributesToSnippet: ['Name:10'],
                    snippetEllipsisText: '…',
                  },
                },
              ],
            });
          },
          templates: {
            header({ html }) {
              return html`<div>
                                  <span class="aa-SourceHeaderTitle text-light-green">
                                   ${ALGOLIA_CONFIG.languageKey == 'bn'
                  ? `পণ্য সমূহ`
                  : `Products`}
                                  </span>
                                  <div class="aa-SourceHeaderLine border-0 bg-light-green"> </div>
                                  </div>`
            },
            item({ item, components, html }) {
              const highHelper = item.Name.trim() == item.NameBn.trim()
                ? ""
                : components.Highlight({ hit: item, attribute: 'NameBn' });
              return html`<a class="autocomplete-hits-item d-flex flex-row" 
                                  href="${item.SeName}">
                              <div class="d-flex justify-content-center align-items-center">
                                <img
                                  src="${item.ProductImages[0]}"
                                  alt="${item.Name}" />
                              </div>
                              <div class="d-flex flex-fill flex-column pl-2 justify-content-center ac-highlight">
                                <div>
                                  <span>
                                    ${components.Highlight({ hit: item, attribute: 'Name' })}
                                  </span>
                                </div>
                                <div>
                                  <span>
                                    ${highHelper}
                                  </span>
                                </div>
                              </div>
                            </div>`;
            },
            footer({ html }) {
              const text = ALGOLIA_CONFIG.languageKey == 'bn'
                ? `'${query}' সম্পর্কিত সকল ফলাফল দেখুন`
                : `Show all results for '${query}'`;

              return html`<div class="d-flex justify-content-center align-items-center p-1 mt-2 shadow-sm">
                    <a href="/search?queryRef=${query}"><small>${text}</small></a>
                  </div>`;
            },
            noResults() {
              return 'No results.';
            }
          }
        },
        {
          sourceId: 'productsCategories',
          getItems({ query }) {
            return getAlgoliaFacets({
              searchClient,
              queries: [
                {
                  indexName: ALGOLIA_CONFIG.indices.root,
                  facet: 'ProductCategories.lvl0',
                  params: {
                    facetQuery: query,
                    maxFacetHits: 2,
                  },
                },
              ],
            });
          },
          templates: {
            header({ html }) {
              return html`<div>
                                    <span class="aa-SourceHeaderTitle text-light-green">
                                        ${ALGOLIA_CONFIG.languageKey == 'bn'
                  ? `ক্যাটেগরি সমূহ`
                  : `Categories`}
                                    </span>
                                    <div class="aa-SourceHeaderLine border-0 bg-light-green"> </div>
                                    </div>`
            },
            item({ item, html }) {
              return html`<div>${item.label}</div>`
            }
          }
        }
      ];
    },
  });

  // subscribe to Enter key press event
  $(document).on('keydown', `${selector} .aa-Input`, function (e) {
    if (e.key === "Enter") {
      e.preventDefault();
      window.location = `/search?queryRef=${$(this).val()}`;
    }
  });
}

const target = document.querySelector('#autocomplete')
document.addEventListener('click', (event) => {
  const withinBoundaries = event.composedPath().includes(target)
  if (!withinBoundaries)
    $('.aa-Panel').remove();
});


/** */
/************************* */
/************************* */
/** */
/** */

function setMenuPosition() {
  const x = $('.top-links').height();
  const y = $('.header-main').height();
  const scrollTop = $(document).scrollTop();

  if (scrollTop > 570) {
    $('.go-to-top').show('slow');
  } else {
    $('.go-to-top').hide('slow');
  }

  if (scrollTop >= (x + y)) {
    $('.top-menu')
      .addClass('fixed-top has-border shadow-sm')
      .find('.navbar-brand').show(400);

    if (!$('.common-breadcrumb').hasClass('stick'))
      $('.common-breadcrumb').addClass('stick');
    if (!$('#CustomSearchForm').hasClass('stick'))
      $('#CustomSearchForm').addClass('stick');

  } else {
    $('.top-menu')
      .removeClass('fixed-top has-border shadow-sm')
      .find('.navbar-brand').hide();
    $('.common-breadcrumb, #CustomSearchForm').removeClass('stick')
  }
}

function setProductCollateralNavPosition() {
  const t = $(window).width() > 982 ? 90 : 0;
  if (($('#productCollateralNav').offset().top - $(window).scrollTop()) <= t) {
    $('#productCollateralNav')
      .removeClass('bg-transparent')
      .addClass('stick bg-white shadow-sm');
  } else {
    $('#productCollateralNav')
      .removeClass('stick bg-white shadow-sm')
      .addClass('bg-transparent');
  }
}

function setProductCollateralNavActiveItem() {
  if ($('#productCollateralNav').hasClass('stick')) {
    $('.product-collateral .pc-wrap .card').each(function () {
      const x = $(this).offset().top - $(window).scrollTop();
      const t = $(window).width() > 982 ? 135 : 45;
      if (x > 0 && x < t) {
        const id = $(this).attr('id');
        $('#productCollateralNav .nav-link').removeClass('active');
        $(`#productCollateralNav .nav-link[href="#${id}"]`).addClass('active');
      }
    });
  } else {
    $('#productCollateralNav .nav-link').removeClass('active');
  }
}

$(document).ready(function () {

  //
  

  // Topmenu positioning
  setMenuPosition();
  $(window).scroll(function () {
    setMenuPosition();

    if ($('html').hasClass('html-product-details-page')) {
      setProductCollateralNavPosition();
      setProductCollateralNavActiveItem();
    }

  });

  // MegaMenu tabs - show on hover
  $('.shop-dropdown .nav-link')
    .hoverIntent(function () {
      $('.shop-dropdown .nav-link').blur();
      $(this).tab('show');
    });

  $('.shop-dropdown .nav-link')
    .click(function (e) {
      e.preventDefault();
    });

  // Prevent closing dropdown if clicked inside mega menu
  $(".shop-dropdown").click(function (e) {
    e.stopPropagation();
  });

  //
  $('.ni-shop-dropdown').on('hidden.bs.dropdown', function () {
    $('.toggle-icon', this).removeClass('fa-chevron-up').addClass('fa-chevron-down');
  });
  $('.ni-shop-dropdown').on('shown.bs.dropdown', function () {
    $('.toggle-icon', this).removeClass('fa-chevron-down').addClass('fa-chevron-up');
  });

  //
  $('.auth-page-go-back').click(function () {
    const host = window.location.origin;
    if (document.referrer.includes(host)) {
      window.history.back();
    } else {
      window.location.assign(host);
    }
  });

  //
  $('.go-to-top button').click(function () {
    $('html, body').animate({
      scrollTop: 0
    });
  });

  //
  $('#productCollateralNav .nav-link').click(function (e) {
    e.preventDefault();
    const id = $(this).attr('href');
    const t = $(window).width() > 982 ? 135 : 45;
    $('html, body').animate({
      scrollTop: $(`${id}`).offset().top - (t - 2)
    }, 1000);
  });



  /*
   * COLOR SELECTOR
   * For DEMO only
   */
  //
  $('.color-selector.th-color').click(function () {
    const old = $('.top-links')
      .attr('class')
      .split(/\s+/)
      .find(x => x.includes('bg-'));
    const newest = 'bg-' + $(this).data('val');
    //
    if (newest == old)
      return;
    //
    $('.top-links').removeClass(old)
      .addClass(newest);
  });
  $('.color-selector.p-color').click(function () {
    const selected = $(this).data('val');
    let old = $('.btn-search')
      .attr('class')
      .split(/\s+/)
      .find(x => x.includes('bg-'));
    //
    if (selected == old)
      return;
    //
    old = old.replace('bg-', '');
    $(`.bg-${old}:not(.color-selector)`).removeClass(`bg-${old}`).addClass(`bg-${selected}`);
    $(`.text-${old}:not(.color-selector)`).removeClass(`text-${old}`).addClass(`text-${selected}`);
    $(`.border-${old}:not(.color-selector)`).removeClass(`border-${old}`).addClass(`border-${selected}`);

  });


  //if (!$('.item-grid').hasClass('row')) {
  //  $('.item-grid').addClass('row no-gutters')
  //}

  if (!$('.item-grid .item-box').hasClass('col-12')) {
    if ($('.item-grid .item-box').parents('.product-details-best-sellers').length > 0) {
      $('.item-grid .item-box').addClass('add-border px-1 py-1 col-12 col-sm-6 col-lg-4');
    } else {
      $('.item-grid .item-box').addClass('add-border px-1 py-1 col-12 col-sm-6 col-lg-4 col-xl-3 col-xlg-2');
    }
  }

});