/*global QUnit*/

sap.ui.define([
	"iot/single-planning-calendar/controller/SinglePlanningCalendar.controller"
], function (Controller) {
	"use strict";

	QUnit.module("SinglePlanningCalendar Controller");

	QUnit.test("I should test the SinglePlanningCalendar controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
