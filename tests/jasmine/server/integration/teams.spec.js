/*global
    describe, it, expect, Teams
 */
describe('Teams', function() {
    'use strict';
    it('should be defined', function () {
        expect(Teams).toBeDefined();
    });
    it('should have some Teams', function () {
        expect(Teams.find().count()).toBeGreaterThan(0);
    });
});