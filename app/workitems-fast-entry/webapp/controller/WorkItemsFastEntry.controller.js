const nest = (items, ID = null, link = 'parent_ID') =>
	items
		.filter((item) => item[link] === ID)
		.map((item) => ({ ...item, children: nest(items, item.ID) }));

function addMinutes(date, minutes) {
	return new Date(date.getTime() + minutes * 60000);
}
sap.ui.define(
	['./BaseController', '../model/formatter', 'sap/ui/model/Filter', 'sap/ui/model/FilterOperator'],
	(BaseController, formatter, Filter, FilterOperator) =>
		BaseController.extend('iot.workitemsfastentry.controller.WorkItemsFastEntry', {
			formatter,
			async onInit() {
				// this.setModel(model);

				// this._loadHierarchy();
				this._filterHierarchyByPath('hierarchyTreeForm', '');
				// this._filterHierarchyByPath('hierarchyTreeTable', '');
				this.searchFilters = [];
			},

			async onBeforeRendering() {
				const model = this.getModel();
				const loadFrom = new Date();
				loadFrom.setHours(0, 0, 0, 0); // last midnight
				const loadUntil = new Date();
				loadUntil.setHours(24, 0, 0, 0); // last midnight
				const newItemStartDate = new Date();
				const newItemCompletedDate = addMinutes(new Date(), 15);

				model.setData({
					// TODO: Entität im Schema erstellen und aus ODataModel beziehen
					busy: false,
					showHierarchyTreeForm: false,
					showHierarchyTreeTable: false,
					categoriesFlat: {},
					categoriesNested: {},
					locations: [{ title: 'IOT' }, { title: 'Home-Office' }, { title: 'Rottendorf' }],
					// workItems: this._loadMockData(),
					newWorkItem: {
						title: '',
						parentPath: '',
						tags: [],
						// TODO: description erst im DB-Schema und an weiteren Stellen hinzufügen
						// description: '',
						// date: new Date(),
						activatedDate: newItemStartDate,
						completedDate: newItemCompletedDate,
						// TODO: location erst im DB-Schema und an weiteren Stellen hinzufügen
						// location: '',
						state: 'incompleted'
					}
				});

				await Promise.all([
					model.load('/MyCategories'),
					model.load('/MyWorkItems', {
						filters: [
							new Filter({
								filters: [
									new Filter({
										path: 'completedDate',
										operator: 'GE',
										value1: loadFrom
									}),
									new Filter({
										path: 'activatedDate',
										operator: 'LE',
										value1: loadUntil
									})
								],
								and: true
							})
						]
					})
				]);

				const categories = model.getProperty('/MyCategories');
				// eslint-disable-next-line camelcase
				const categoriesLevel0 = categories.filter(({ parent_ID }) => !parent_ID);

				model.setProperty('/categoriesLevel0', categoriesLevel0);
			},

			async _loadHierarchy() {
				const model = this.getModel();

				model.setProperty('/busy', true);

				const [{ results: categories }] = await Promise.all([
					this.read({
						path: '/MyCategories'
					})
				]);

				const categoriesNested = nest(categories);

				model.setProperty('/categoriesNested', categoriesNested);
				model.setProperty('/categoriesFlat', categories);
				model.setProperty('/busy', false);
			},

			onChangeHierarchy(event) {
				let associatedHierarchyTreeID;
				if (event.getParameter('id').endsWith('Form')) {
					this.getModel().setProperty('/showHierarchyTreeForm', true);
					associatedHierarchyTreeID = 'hierarchyTreeForm';
					// // Momentan nicht funktionsfaehig für 'hierarchyTreeTable'
					// }
					// else {
					// 	this.getModel().setProperty('/showHierarchyTreeTable', true);
					// 	associatedHierarchyTreeID = 'hierarchyTreeTable';
					// }
					const { newValue } = event.getParameters();

					// // Laden eines Popover-Fragments für den HierarchyTree
					// if (!this.popover) {
					// 	this.popover = Fragment.load({
					// 		id: this.getView().getId(),
					// 		name: 'iot.workitemsfastentry.view.PopoverHierarchySelect',
					// 		controller: this
					// 	});
					// }
					// this.popover.then(function (popover) {
					// 	popover.openBy(event.getSource());
					// });

					this._filterHierarchyByPath(associatedHierarchyTreeID, newValue);
				}
			},

			_filterHierarchyByPath(elementID, query) {
				const filters = [
					new Filter({
						path: 'path',
						test: (path) => {
							if (!query) return false;
							const substrings = query.split(' ');
							return substrings.map((sub) => sub.toUpperCase()).every((sub) => path.includes(sub));
						}
					})
				];
				this.byId(elementID).getBinding('items').filter(filters);
			},

			onSelectHierarchy(event) {
				if (event.getParameter('id').endsWith('Form')) {
					const { listItem } = event.getParameters();
					const hierarchyPath = listItem.getBindingContext().getProperty('path');

					this.getModel().setProperty('/newWorkItem/parentPath', hierarchyPath);
				} else {
					const { listItem } = event.getParameters();
					const hierarchyPath = listItem.getBindingContext().getProperty('path');
					const path = event.getSource().getBindingContext().getPath();

					this.getModel().setProperty(`${path}/parentPath`, hierarchyPath);
				}
			},

			onSearch(event) {
				this.searchFilters = [];
				this.searchQuery = event.getSource().getValue();

				if (this.searchQuery && this.searchQuery.length > 0) {
					this.searchFilters = new Filter('text', FilterOperator.Contains, this.searchQuery);
				}

				this.byId('table').getBinding('items').filter(this.searchFilters);
			},

			async addWorkItem() {
				const model = this.getModel();
				const newWorkItem = model.getProperty('/newWorkItem');
				await model.create('/MyWorkItems', newWorkItem);
			},

			// TODO: Erweitern um weitere Pruefungen
			checkCompleteness() {
				let isCompleted = true;
				const model = this.getModel();
				newWorkItem = model.getProperty('/newWorkItem');

				for (const [key, value] of Object.entries(newWorkItem)) {
					console.log('key:', key, 'value:', value);
				}

				Object.values(newWorkItem).forEach((val) => {
					if (val.toString().trim() === '') {
						isCompleted = false;
					}
				});

				isCompleted
					? model.setProperty('/newWorkItem/state', 'completed')
					: model.setProperty('/newWorkItem/state', 'incompleted');
			}
		})
);
