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
		'sap/ui/model/json/JSONModel',
		'sap/ui/core/Fragment'
	],
	(BaseController, Device, Filter, FilterOperator, JSONModel, Fragment) =>
		BaseController.extend('iot.workitemsfastentry.controller.WorkItemsFastEntry', {
			async onInit() {
				const model = new JSONModel({
					// TODO: Entität im Schema erstellen und aus ODataModel beziehen
					busy: false,
					showHierarchyTreeForm: false,
					showHierarchyTreeTable: false,
					categoriesFlat: {},
					categoriesNested: {},
					activities: [
						{ title: 'Durchführung' },
						{ title: 'Reise-/Fahrzeit' },
						{ title: 'Pendelfahrt Hotel/Einsatzort' }
					],
					locations: [{ title: 'IOT' }, { title: 'Home-Office' }, { title: 'Rottendorf' }],
					workItems: this.loadMockData(),
					newWorkItem: undefined,
					countAll: undefined,
					countCompleted: undefined,
					countIncompleted: undefined
				});

				this.setModel(model);

				model.setProperty('/busy', true);
				this.loadInitialFormData();
				this.updateTable();
				this._loadHierarchy();
				this.filterHierarchyByPath('hierarchyTreeForm', '');
				// this.filterHierarchyByPath('hierarchyTreeTable', '');
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

				this._filters = {
					all: new Filter({
						path: 'state',
						operator: 'NE',
						value1: ''
					}),
					completed: new Filter({
						path: 'state',
						operator: 'EQ',
						value1: 'completed'
					}),
					incompleted: new Filter({
						path: 'state',
						operator: 'EQ',
						value1: 'incompleted'
					})
				};

				model.setProperty('/busy', true);

				// // Funktioniert nicht
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

			async onUpdateFinished(event) {
				const table = event.getSource();
				const model = this.getModel();
				const totalItems = event.getParameter('total');

				if (totalItems && table.getBinding('items').isLengthFinal()) {
					await this.getModel().read(
						{
							path: 'MyWorkItems',
							filters: this._filters.all
						},
						{
							success: (oData) => {
								model.setProperty('/countAll');
							}
						}
					);
					// await this.getModel().read(
					// 	{
					// 		path: 'MyWorkItems',
					// 		filters: this._filters.completed
					// 	},
					// 	{
					// 		success: (oData) => {
					// 			model.setProperty('/countCompleted');
					// 		}
					// 	}
					// );
					// await this.getModel().read(
					// 	{
					// 		path: 'MyWorkItems',
					// 		filters: this._filters.incompleted
					// 	},
					// 	{
					// 		success: (oData) => {
					// 			model.setProperty('/countIncompleted');
					// 		}
					// 	}
					// );
				}
			},

			loadMockData() {
				return [
					{
						title: 'Projektaufschreibung Programmierung Neue Funktion',
						parentPath: 'CAS HCOB > FSDM Businessglossar',
						tags: '',
						date: new Date('2022-07-07'),
						activatedDate: new Date('2022-07-07T06:00Z'),
						completedDate: new Date('2022-07-07T10:30Z'),
						location: 'IOT',
						state: 'incompleted'
					},
					{
						title: 'Projektaufschreibung Programmierung Neue Funktion',
						parentPath: 'CAS HCOB > FSDM Businessglossar',
						tags: '',
						date: new Date('2022-07-07'),
						activatedDate: new Date('2022-07-07T10:30Z'),
						completedDate: new Date('2022-07-07T14:00Z'),
						location: 'IOT',
						state: 'incompleted'
					}
				];
			},

			loadInitialFormData() {
				const model = this.getModel();
				const initialWorkItem = {
					title: '',
					parentPath: '',
					// tags: '',
					date: new Date(),
					activatedDate: this.calculateActivatedDate(),
					completedDate: new Date(),
					// TODO: location erst im DB-Schema und an weiteren Stellen hinzufügen
					// location: '',
					state: 'incompleted'
				};

				model.setProperty('/newWorkItem', initialWorkItem);
				model.updateBindings(true);
			},

			calculateActivatedDate() {
				const model = this.getModel();
				const workItems = model.getProperty('/workItems').map((workItem) => ({ ...workItem }));
				const latestCompletedDate = workItems.reduce((completedDate, workItem) => {
					if (completedDate === undefined) {
						return workItem.completedDate;
					}
					return workItem.completedDate > completedDate ? workItem.completedDate : completedDate;
				}, undefined);

				let nextActivatedDate = latestCompletedDate;
				let currentDate = new Date();
				// toDateString() returns a string consisting of the year, month and day only
				if (nextActivatedDate.toDateString() !== currentDate.toDateString()) {
					nextActivatedDate = currentDate;
					nextActivatedDate.setHours(8, 30, 0);
					if (currentDate.getTime() < nextActivatedDate.getTime()) {
						nextActivatedDate = currentDate;
					}
				}

				return nextActivatedDate;
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

			onFilterWorkItems(event) {
				const binding = this.byId('tableWorkItems').getBinding('items');
				const key = event.getParameter('selectedKey');
				binding.filter(this._filters[key]);
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

					this.filterHierarchyByPath(associatedHierarchyTreeID, newValue);
				}
			},

			filterHierarchyByPath(elementID, query) {
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
				this.getModel().setProperty('/showHierarchyTreeForm', true);
			},

			onFocusOutHierarchyTreeForm() {
				this.getModel().setProperty('/showHierarchyTreeForm', false);
			},

			// // Funktioniert nicht
			// onFocusInHierarchyTreeTable() {
			// 	console.log('Focusin');
			// 	this.getModel().setProperty('/showHierarchyTreeTable', true);
			// },

			// onFocusOutHierarchyTreeTable() {
			// 	console.log('Focusout');
			// 	this.getModel().setProperty('/showHierarchyTreeTable', false);
			// },

			onChangeDate(event) {
				const model = this.getModel();
				const date = model.getProperty('/newWorkItem/date');
				const activatedDate = model.getProperty('/newWorkItem/activatedDate');
				const completedDate = model.getProperty('/newWorkItem/completedDate');

				model.setProperty('/newWorkItem/activatedDate', this.updateDate(activatedDate, date));
				model.setProperty('/newWorkItem/completedDate', this.updateDate(completedDate, date));
			},

			updateDate(oldDate, date) {
				// Copy values instead of changing the state of /newWorkItem/date
				const newDate = new Date(date.getTime());
				const newDateHours = oldDate.getHours();
				const newDateMinutes = oldDate.getMinutes();
				const newDateSeconds = oldDate.getSeconds();

				newDate.setHours(newDateHours, newDateMinutes, newDateSeconds);

				return newDate;
			},

			onSearch(event) {
				this.searchFilters = [];
				this.searchQuery = event.getSource().getValue();

				if (this.searchQuery && this.searchQuery.length > 0) {
					this.searchFilters = new Filter('text', FilterOperator.Contains, this.searchQuery);
				}

				this.byId('table').getBinding('items').filter(this.searchFilters);
			},

			onPressSubmitWorkItem() {
				const model = this.getModel();
				const workItems = model.getProperty('/workItems');
				const newWorkItem = model.getProperty('/newWorkItem');

				// const location = this.byId('selectLocation').getValue();
				// model.setProperty('/newWorkItem/location', location);
				this.checkCompleteness();

				this._submitWorkItem();
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

				isCompleted
					? model.setProperty('/newWorkItem/state', 'completed')
					: model.setProperty('/newWorkItem/state', 'incompleted');
			},

			async _submitWorkItem() {
				const model = this.getModel();
				const workItem = model.getProperty('/newWorkItem');
				delete workItem.date;

				model.setProperty('/busy', true);

				try {
					await this.create({
						path: '/MyWorkItems',
						data: workItem
					});
				} catch (error) {
					console.log(error);
				}

				this.updateTable();

				model.setProperty('/busy', false);
			},

			async updateTable() {
				const model = this.getModel();
				let workItems = model.getProperty('/workItems');
				const { results: workItemsBackend } = await this.read({
					path: '/MyWorkItems',
					urlParameters: { $top: 100, $expand: 'tags' },
					// Currently loading all work items with a not empty string as state
					filters: [
						new Filter({
							path: 'state',
							operator: 'NE',
							value1: ''
						})
					]
				});

				workItems = this.loadMockData();
				workItemsBackend.forEach((workItemBackend) => {
					workItemBackend.date = workItemBackend.activatedDate;
					workItemBackend.duration = this.calcDurationInHoursAndMinutes(workItemBackend.duration);
					workItems.push(workItemBackend);
				});

				model.setProperty('/workItems', workItems);
				this.loadInitialFormData();
			},

			calcDurationInHoursAndMinutes(decimalDuration) {
				const minutes = Math.round((decimalDuration % 1) * 60);
				const hours = Math.floor(decimalDuration);

				return this.addLeadingZero(hours) + ':' + this.addLeadingZero(minutes);
			},

			addLeadingZero(number) {
				return number < 10 ? '0' + number : number;
			}
		})
);
