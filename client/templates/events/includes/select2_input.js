/*global
    Template
 */

Template.select2Input.onRendered(function() {
  "use strict";
  var $tagsSelect;
  $tagsSelect = this.$("#" + this.data.id);
  $tagsSelect.select2({
    tags: true,
    placeholder: "Tags hinzufügen...",
    tokenSeparators: [",", " "],
    width: "style"
  });
  if (this.data.tags) {
    $tagsSelect.val(this.data.tags).trigger("change");
  }
});
