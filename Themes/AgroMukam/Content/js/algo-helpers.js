/* Helpers */
const INTL_ID = ALGOLIA_CONFIG.languageKey == 'bn' ? 'bn-BD' : 'en-US';
const localizeNumbers = n => n.toLocaleString(INTL_ID);
const getDiscountPercentage = (o, n) => Math.round(((o - n) / o) * 100);

function hitTemplate(hit) {
  const productName = ALGOLIA_CONFIG.languageKey == 'bn' ? hit.NameBn : hit.Name;
  return `
    <a class="hit bg-white cursor-pointer w-100" href="${hit.SeName}">
      <div class="hit-image d-flex justify-content-center">
        <img src="${hit.ProductImages[0]}" />
      </div>
      <div class="hit-content p-2">
        <div>
          <div class="hit-name mb-2">${productName.substr(0, 36) + (productName.length >= 36 ? '...' : '')}</div>
        </div>
        <div class="hit-price">
          <div class="current-price text-light-green">৳${localizeNumbers(hit.ProductPrice.Price)}</div>
          <div class="old-price text-muted">
            ${hit.ProductPrice.OldPrice > 0 ? `<del class="text-muted">৳${localizeNumbers(hit.ProductPrice.OldPrice)}</del> ${hit.ProductPrice.Price < hit.ProductPrice.OldPrice ? ' -' + getDiscountPercentage(hit.ProductPrice.OldPrice, hit.ProductPrice.Price) + '%' : ''}` : ''}
          </div>
        </div>
        <div class="hit-reviews">
          <i class="${hit.Reviews.Average > 1 ? 'fas text-warning' : 'far'} fa-star"></i>
          <i class="${hit.Reviews.Average > 2 ? 'fas text-warning' : 'far'}  fa-star"></i>
          <i class="${hit.Reviews.Average > 3 ? 'fas text-warning' : 'far'}  fa-star"></i>
          <i class="${hit.Reviews.Average > 4 ? 'fas text-warning' : 'far'}  fa-star"></i>
          <i class="${hit.Reviews.Average > 5 ? 'fas text-warning' : 'far'}  fa-star"></i>
        </div>
      </div>
    </a>
  `;
}

function refinementListTemplate(item) {
  const { url, label, count, isRefined } = item;
  return `
    <div class="form-check">
      <input class="form-check-input" type="checkbox" value="" ${isRefined ? 'checked' : ''}>
      <label class="form-check-label d-flex flex-row" for="defaultCheck1">
        <div class="d-flex flex-fill" style="line-height: 24px;">
          ${label.substr(0, 32) + (label.length >= 32 ? '...' : '')}
        </div>
        <div class="d-flex ais-refinement-list--count justify-content-center align-items-center">
          ${localizeNumbers(count)}
        </div>
      </label>
    </div>
  `;
}

//
$(document).ready(function () {

  $(document).on('click', '.as-filter-toggler button', function () {
    $('.as-sidebar').toggleClass('active');
  });

});