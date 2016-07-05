/*global
    Template
 */

Template.tagFilter.onRendered(function () {
    'use strict';
    this.$('#event-tags').select2({
        tags: true,
        width: "style",
        placeholder: "Events nach Tags filtern...",
        tokenSeparators: [',', ' ']
    });
});