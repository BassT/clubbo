/*global
    describe, it, expect, Departments
 */

describe('Departments', function () {
    'use strict';
    it('Should be defined', function () {
        expect(Departments).toBeDefined();
    });
    it('Should have some departments', function () {
        expect(Departments.find().count()).toBeGreaterThan(0);
    });
});