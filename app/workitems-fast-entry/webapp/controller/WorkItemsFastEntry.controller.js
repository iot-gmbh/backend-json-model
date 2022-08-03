const nest = (items, ID = null, link = 'parent_ID') =>
	items
		.filter((item) => item[link] === ID)
		.map((item) => ({ ...item, children: nest(items, item.ID) }));

sap.ui.define(
	[
		'./BaseController',
		'sap/ui/Device',
		'sap/ui/model/Filter',
		'sap/ui/model/FilterOperator',
		'sap/ui/model/json/JSONModel'
	],
	(BaseController, Device, Filter, FilterOperator, JSONModel) =>
		BaseController.extend('iot.workitemsfastentry.controller.WorkItemsFastEntry', {
			async onInit() {
				const model = new JSONModel({
					// TODO: Entität im Schema erstellen und aus ODataModel beziehen
					busy: false,
					showHierarchyTreeForm: false,
					showHierarchyTreeTable: false,
					categoriesFlat: {},
					categoriesNested: {},
					locations: [{ title: 'IOT' }, { title: 'Home-Office' }, { title: 'Rottendorf' }],
					workItems: this._loadMockData(),
					newWorkItem: undefined
				});

				this.setModel(model);
				this.loadInitialFormData();
				this._loadHierarchy();
				this._filterHierarchyByPath('hierarchyTreeForm', '');
				// this._filterHierarchyByPath('hierarchyTreeTable', '');
				this.searchFilters = [];

				this.byId('hierarchySearchForm').setFilterFunction((term, item) =>
					// A case-insensitive "string contains" style filter
					item.getText().match(new RegExp(term, 'i'))
				);

				// TODO: Auslagern in control?
				this.byId('hierarchySearchForm').attachBrowserEvent(
					'focusout',
					this.onFocusOutHierarchyTreeForm.bind(this)
				);
				this.byId('hierarchyTreeForm').attachBrowserEvent(
					'focusin',
					this.onFocusInHierarchyTreeForm.bind(this)
				);
				this.byId('hierarchyTreeForm').attachBrowserEvent(
					'focusout',
					this.onFocusOutHierarchyTreeForm.bind(this)
				);

				// // Doesn't work
				// this.byId('hierarchySearchTable').attachBrowserEvent(
				// 	'focusout',
				// 	this.onFocusOutHierarchyTreeTable.bind(this)
				// );
				// this.byId('hierarchyTreeTable').attachBrowserEvent(
				// 	'focusin',
				// 	this.onFocusInHierarchyTreeTable.bind(this)
				// );
				// this.byId('hierarchyTreeTable').attachBrowserEvent(
				// 	'focusout',
				// 	this.onFocusOutHierarchyTreeTable.bind(this)
				// );
			},

			_loadMockData() {
				return [
					{
						title: 'Projektaufschreibung Programmierung Neue Funktion',
						parentPath: 'CAS HCOB > FSDM Businessglossar',
						tags: '',
						description: '',
						date: new Date('2022-07-07'),
						startDate: new Date('2022-07-07T06:00Z'),
						endDate: new Date('2022-07-07T10:30Z'),
						location: 'IOT',
						completed: false
					},
					{
						title: 'Projektaufschreibung Programmierung Neue Funktion',
						parentPath: 'CAS HCOB > FSDM Businessglossar',
						tags: '',
						description: '',
						date: new Date('2022-07-07'),
						startDate: new Date('2022-07-07T10:30Z'),
						endDate: new Date('2022-07-07T14:00Z'),
						location: 'IOT',
						completed: false
					}
				];
			},

			loadInitialFormData() {
				const model = this.getModel();
				const initialWorkItem = {
					title: '',
					parentPath: '',
					tags: '',
					description: '',
					date: new Date(),
					startDate: this.calculateStartDate(),
					endDate: new Date(),
					location: '',
					completed: false
				};

				model.setProperty('/newWorkItem', initialWorkItem);
				model.updateBindings(true);
			},

			calculateStartDate() {
				const model = this.getModel();
				const workItems = model.getProperty('/workItems').map((workItem) => ({ ...workItem }));
				const latestEndDate = workItems.reduce((endDate, workItem) => {
					if (endDate === undefined) {
						return workItem.endDate;
					}
					return workItem.endDate > endDate ? workItem.endDate : endDate;
				}, undefined);

				let nextStartDate = latestEndDate;
				let currentDate = new Date();
				// toDateString() returns a string consisting of the year, month and day only
				if (nextStartDate.toDateString() !== currentDate.toDateString()) {
					nextStartDate = currentDate;
					nextStartDate.setHours(8, 30, 0);
					if (currentDate.getTime() < nextStartDate.getTime()) {
						nextStartDate = currentDate;
					}
				}

				return nextStartDate;
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
				} else {
					this.getModel().setProperty('/showHierarchyTreeTable', true);
					associatedHierarchyTreeID = 'hierarchyTreeTable';
				}
				const { newValue } = event.getParameters();

				this._filterHierarchyByPath(associatedHierarchyTreeID, newValue);
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

			onFocusInHierarchyTreeForm() {
				console.log('Focusin');
				this.getModel().setProperty('/showHierarchyTreeForm', true);
			},

			onFocusOutHierarchyTreeForm() {
				console.log('Focusout');
				this.getModel().setProperty('/showHierarchyTreeForm', false);
			},

			// // Doesn't work
			// onFocusInHierarchyTreeTable() {
			// 	console.log('Focusin');
			// 	this.getModel().setProperty('/showHierarchyTreeTable', true);
			// },

			// onFocusOutHierarchyTreeTable() {
			// 	console.log('Focusout');
			// 	this.getModel().setProperty('/showHierarchyTreeTable', false);
			// },

			onSearch(event) {
				this.searchFilters = [];
				this.searchQuery = event.getSource().getValue();

				if (this.searchQuery && this.searchQuery.length > 0) {
					this.searchFilters = new Filter('text', FilterOperator.Contains, this.searchQuery);
				}

				this.byId('table').getBinding('items').filter(this.searchFilters);
			},

			addWorkItem() {
				const model = this.getModel();
				const workItems = model.getProperty('/workItems');
				const newWorkItem = model.getProperty('/newWorkItem');

				const location = this.byId('selectLocation').getValue();
				model.setProperty('/newWorkItem/location', location);
				this.checkCompleteness();

				workItems.push(newWorkItem);
				model.setProperty('/workItems', workItems);
				model.updateBindings(true);
				this.loadInitialFormData();
			},

			// TODO: Erweitern um weitere Pruefungen
			checkCompleteness() {
				let isCompleted = true;
				const model = this.getModel();
				newWorkItem = model.getProperty('/newWorkItem');

				Object.values(newWorkItem).forEach((val) => {
					if (val.toString().trim() === '') {
						isCompleted = false;
					}
				});

				model.setProperty('/newWorkItem/completed', isCompleted);
			}
		})
);
