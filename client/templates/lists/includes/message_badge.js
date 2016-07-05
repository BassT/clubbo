/*global
    Template
 */
Template.messageBadge.onRendered(function () {
    'use strict';
    this.$('[data-toggle="popover"]').popover();
});