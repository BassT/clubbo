/*global
    Absences, describe, it, expect
 */

describe('Absences collection', function () {
    'use strict';
    it('Should have an absences collection.', function () {
        expect(Absences).toBeDefined();
    });
    it('Should have some absences.', function () {
        expect(Absences.find().count()).toBeGreaterThan(0);
    });
});