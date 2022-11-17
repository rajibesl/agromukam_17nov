$.fn.extend({
  treed: function (options) {

    let openedClass = 'fa-minus-square float-right cursor-pointer';
    let closedClass = 'fa-plus-square float-right cursor-pointer';

    if (typeof options != 'undefined') {
      if (typeof options.openedClass != 'undefined')
        openedClass = options.openedClass;
      if (typeof options.closedClass != 'undefined')
        closedClass = options.closedClass;
    }

    //initialize each of the top levels
    const tree = $(this);
    tree.addClass("tree");
    tree.find('li').has("ul").each(function () {
      const branch = $(this); //li with children ul
      const isParent = branch.hasClass('masonry-item');
      branch.prepend("<i class='fas " + (isParent ? openedClass : closedClass) + "'></i>");
      branch.addClass('branch');
      branch.find('i').on('click', function (e) {
        if (this == e.target) {
          //const icon = $(this).children('i:first');
          $(this).toggleClass(openedClass + " " + closedClass);
          $(this).parent().children().children().toggle();
        }
      })
      if (!isParent)
        branch.children().children().toggle();
    });
    //fire event from the dynamically added icon
    tree.find('.branch i').each(function () {
      $(this).on('click', function () {
        $(this).parent().closest('li').click();
      });
    });
  }
});