// initialize Algolia search
//console.log('algo global', ALGOLIA_CONFIG);

const searchClient = algoliasearch(
  ALGOLIA_CONFIG.appId,
  ALGOLIA_CONFIG.apiKey
);

const search = instantsearch({
  searchClient,
  indexName: ALGOLIA_CONFIG.indexName,
  routing: true,
  numberLocale: ALGOLIA_CONFIG.languageKey
});

const config = {
  hitsPerPage: ALGOLIA_CONFIG.hitsPerPage
};
const defaultFacetFilters = document.querySelector('#defaultFacetFilters')?.value;
if (defaultFacetFilters && defaultFacetFilters != '')
  config.filters = defaultFacetFilters;

//console.log('config', config);

/*
    *** NEW ***
    * 
    * search query (extract from URL)
    * case: user types something in searchbox and presses enter
    *       we extract what the user typed in and try search by the query
 */
const urlParams = new URLSearchParams(window.location.search);
if (urlParams.get('queryRef'))
  config.query = urlParams.get('queryRef');

// Configurations
search.addWidget(
  instantsearch.widgets.configure(config)
);

/**
 * 
 * Widgets
 */
/**/
function addRefinementListWidget(container, attribute) {
  search.addWidget(
    instantsearch.widgets.refinementList({
      container,
      attribute,
      searchForFacetValues: true,
      autoHideContainer: true,
      limit: ALGOLIA_CONFIG.limit,
      showMore: true,
      templates: {
        item(item) {
          return refinementListTemplate(item);
        },
      }
    })
  );
}
/**/

/* Left (Filter Panel) */
// #Categories
const categoryAttributes = ALGOLIA_CONFIG.languageKey == 'en'
  ? [
    'ProductCategories.lvl0',
    'ProductCategories.lvl1',
    'ProductCategories.lvl2',
    'ProductCategories.lvl3',
    'ProductCategories.lvl4',
  ] : [
    'ProductCategoriesBn.lvl0',
    'ProductCategoriesBn.lvl1',
    'ProductCategoriesBn.lvl2',
    'ProductCategoriesBn.lvl3',
    'ProductCategoriesBn.lvl4',
  ];
search.addWidget(
  instantsearch.widgets.hierarchicalMenu({
    container: '#categories',
    showParentLevel: true,
    autoHideContainer: true,
    attributes: categoryAttributes
  })
);

// Location Filter
if ($('#waLocation').length > 0) {
  const locationAttributes = ALGOLIA_CONFIG.languageKey == 'en'
    ? [
      'WarehouseAddressHierarchy.lvl0',
      'WarehouseAddressHierarchy.lvl1',
      'WarehouseAddressHierarchy.lvl2'
    ] : [
      'WarehouseAddressHierarchyBn.lvl0',
      'WarehouseAddressHierarchyBn.lvl1',
      'WarehouseAddressHierarchyBn.lvl2'
    ];

  search.addWidget(
    instantsearch.widgets.hierarchicalMenu({
      container: '#waLocation',
      showParentLevel: true,
      autoHideContainer: true,
      attributes: locationAttributes
    })
  );
}


const filterableAttributes = [
  { container: '#brands', attribute: 'ProductSpecificationAttributes.Product Brand' },
  { container: '#colors', attribute: 'ProductAttributes.Color' },
  { container: '#net-contents', attribute: 'ProductAttributes.Net Contents' },
  { container: '#colours', attribute: 'ProductSpecificationAttributes.Colour' },
  { container: '#country-of-origin', attribute: 'ProductSpecificationAttributes.Country of Origin' },
  { container: '#features', attribute: 'ProductSpecificationAttributes.Features' },
  { container: '#application', attribute: 'ProductSpecificationAttributes.Function / Application' },
  { container: '#maturity', attribute: 'ProductSpecificationAttributes.Maturity' },
  { container: '#output-per-hour', attribute: 'ProductSpecificationAttributes.Output Per Hour' },
  { container: '#product-packaging', attribute: 'ProductSpecificationAttributes.Product Packaging' },
  { container: '#packaging', attribute: 'ProductSpecificationAttributes.Packaging' },
  { container: '#packaging-type', attribute: 'ProductSpecificationAttributes.Packaging Type' },
  { container: '#storage-condition', attribute: 'ProductSpecificationAttributes.Storage Condition' },
  { container: '#vendors', attribute: 'VendorName' },
  { container: '#manufacturers', attribute: 'Manufacturers' },
  { container: '#services', attribute: ALGOLIA_CONFIG.languageKey == 'bn' ? 'ServicesBn' : 'Services' },
];

for (const attribute of filterableAttributes)
  if ($(attribute.container).length > 0)
    addRefinementListWidget(attribute.container, attribute.attribute);

// #Price
search.addWidget(
  instantsearch.widgets.rangeInput({
    container: "#price",
    autoHideContainer: true,
    attribute: "ProductPrice.Price"
  })
);

// #Ratings
search.addWidget(
  instantsearch.widgets.ratingMenu({
    container: "#ratings",
    autoHideContainer: true,
    attribute: "Reviews.Rating"
  })
);

/* Right (Results Section) */
// #Stats
search.addWidget(
  instantsearch.widgets.stats({
    container: "#stats",
    templates: {
      text(data) {
        let count = '';

        if (data.hasManyResults) {
          count += `${data.nbHits} results`;
        } else if (data.hasOneResult) {
          count += `1 result`;
        } else {
          count += `no result`;
        }

        return `⚡️ ${count} found in ${data.processingTimeMS}ms`;
      }
    }
  })
);

// #SortBy
search.addWidget(
  instantsearch.widgets.sortBy({
    container: "#sort-by",
    items: [
      { label: 'Default', value: ALGOLIA_CONFIG.indices.root },
      { label: 'Newest First', value: ALGOLIA_CONFIG.indices.newestFirst },
      { label: 'Top Reviewed', value: ALGOLIA_CONFIG.indices.topReviewed },
      { label: 'Price (low to high)', value: ALGOLIA_CONFIG.indices.priceLowToHigh },
      { label: 'Price (high to low)', value: ALGOLIA_CONFIG.indices.priceHighToLow },
    ],
  })
);

// #Hits (list of products)
search.addWidget(
  instantsearch.widgets.hits({
    container: "#hits",
    templates: {
      empty: "No results.",
      item: function (hit) {
        return hitTemplate(hit);
      }
    }
  })
);

// #Pagination
search.addWidget(
  instantsearch.widgets.pagination({
    container: "#pagination"
  })
);

// #Current Refinements
const { connectCurrentRefinements } = instantsearch.connectors;
// Create the render function
const createDataAttribtues = refinement =>
  Object.keys(refinement)
    .map(key => `data-${key}="${refinement[key]}"`)
    .join(' ');


const renderListItem = item => `
  ${item.refinements
    .map(
      refinement =>
        `<div class="cr-item-wrap rounded-pill shadow-sm d-flex justify-content-center align-items-center">
              ${refinement.label} (${refinement.count})
              <button ${createDataAttribtues(refinement)}>X</button>
            </div>`
    )
    .join('')}
`;

const renderCurrentRefinements = (renderOptions, isFirstRender) => {
  const { items, refine, widgetParams } = renderOptions;

  widgetParams.container.innerHTML = `
    <div class="d-flex flex-row flex-wrap">
      ${items.map(renderListItem).join('')}
    </div>
  `;

  [...widgetParams.container.querySelectorAll('button')].forEach(element => {
    element.addEventListener('click', event => {
      const item = Object.keys(event.currentTarget.dataset).reduce(
        (acc, key) => ({
          ...acc,
          [key]: event.currentTarget.dataset[key],
        }),
        {}
      );

      refine(item);
    });
  });
};

// Create the custom widget
const customCurrentRefinements = connectCurrentRefinements(
  renderCurrentRefinements
);

// Instantiate the custom widget
search.addWidgets([
  customCurrentRefinements({
    container: document.querySelector('#current-refinements'),
  })
]);


/* Actually Start The Search */
search.start();

search.on('render', function () {
  $('.ais-header').css('display', 'inherit');
  $('.ais-RefinementList--noRefinement')
    .parent()
    .prev('.ais-header')
    .css('display', 'none');

  console.log('assads', search.helper.getQuery().query);

  if (search.helper.getQuery().query && search.helper.getQuery().query != '')
    handleSearchQuery();
});

function handleSearchQuery() {
  if ($('#queryRef').length == 0) {
    const html = `<div
      id="queryRef"
      class="cr-item-wrap rounded-pill shadow-sm d-flex justify-content-center align-items-center">
        Query: <span class="pl-2"></span>
        <button class="clear-query-ref">X</button>
      </div>`;
      $('#current-refinements > div').prepend(html);
  }

  $('#queryRef span').text(search.helper.getQuery().query);
}

$(document).on('click', '.clear-query-ref', function () {
  search.helper.setQuery('').search();
  $('#queryRef').remove();
});