/*global
	Clubs, describe, it, expect
 */

describe('Clubs collection', function () {
	'use strict';
	it('should have a clubs collection', function () {
		expect(Clubs).toBeDefined();
	});
	it('should have some clubs defined', function () {
		expect(Clubs.find().count()).toBeGreaterThan(0);
	});
});