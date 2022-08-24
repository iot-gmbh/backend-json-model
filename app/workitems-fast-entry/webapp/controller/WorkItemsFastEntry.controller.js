function addMinutes(date, minutes) {
	return new Date(date.getTime() + minutes * 60000);
}

sap.ui.define(
	[
		'./BaseController',
		'../model/formatter',
		'sap/ui/model/Filter',
		'sap/ui/model/FilterOperator',
		'sap/m/MessageToast'
	],
	(BaseController, formatter, Filter, FilterOperator, MessageToast) => {
		const nest = (items, ID = null, link = 'parent_ID') =>
			items
				.filter((item) => item[link] === ID)
				.map((item) => ({ ...item, children: nest(items, item.ID) }));

		return BaseController.extend('iot.workitemsfastentry.controller.WorkItemsFastEntry', {
			formatter,
			async onInit() {
				this._filterHierarchyByPath('hierarchyTreeForm', '');
				this.searchFilters = [];
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
			},

			async onBeforeRendering() {
				const model = this.getModel();
				const loadFrom = new Date();
				loadFrom.setHours(0, 0, 0, 0); // last midnight
				const loadUntil = new Date();
				loadUntil.setHours(24, 0, 0, 0); // next midnight
				// const newItemDate = new Date();
				const newItemStartDate = new Date();
				// // Problem: this.calculateActivatedDate benötigt geladene MyWorkItems
				// const newItemStartDate = this.calculateActivatedDate();
				const newItemEndDate = addMinutes(new Date(), 15);
				// // Code von Benedikt
				// const newItemStartDate = new Date();
				// const newItemEndDate = addMinutes(new Date(), 15);

				model.setData({
					busy: false,
					tableBusy: true,
					showHierarchyTreeForm: false,
					showHierarchyTreeTable: false,
					categoriesFlat: {},
					categoriesNested: {},
					// TODO: Entität im Schema erstellen und aus ODataModel beziehen
					activities: [
						{ title: 'Durchführung' },
						{ title: 'Reise-/Fahrzeit' },
						{ title: 'Pendelfahrt Hotel/Einsatzort' }
					],
					// TODO: Entität im Schema erstellen und aus ODataModel beziehen
					locations: [{ title: 'IOT' }, { title: 'Home-Office' }, { title: 'Rottendorf' }],
					countAll: undefined,
					countCompleted: undefined,
					countIncompleted: undefined,
					newWorkItem: {
						title: '',
						parentPath: '',
						tags: [],
						// date: newItemDate,
						activatedDate: newItemStartDate,
						completedDate: newItemEndDate,
						// TODO: activity erst im DB-Schema und an weiteren Stellen hinzufügen
						// activity: '',
						// TODO: location erst im DB-Schema und an weiteren Stellen hinzufügen
						// location: '',
						state: 'incompleted'
					}
				});

				const [categories] = await Promise.all([
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

				const categoriesNested = nest(categories);

				model.setProperty('/tableBusy', false);
				model.setProperty('/categories', categoriesNested);
			},

			calculateActivatedDate() {
				const model = this.getModel();
				const workItems = model.getProperty('/MyWorkItems').map((workItem) => ({ ...workItem }));
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

			async setItemCountsFilters(event) {
				const model = this.getModel();

				const countAll = model
					.getProperty('/MyWorkItems')
					.filter((workItem) => workItem.state !== '').length;

				const countCompleted = model
					.getProperty('/MyWorkItems')
					.filter((workItem) => workItem.state === 'completed').length;

				const countIncompleted = model
					.getProperty('/MyWorkItems')
					.filter((workItem) => workItem.state === 'incompleted').length;

				model.setProperty('/countAll', countAll);
				model.setProperty('/countCompleted', countCompleted);
				model.setProperty('/countIncompleted', countIncompleted);
			},

			onChangeHierarchy(event) {
				let associatedHierarchyTreeID;
				if (event.getParameter('id').endsWith('Form')) {
					this.getModel().setProperty('/showHierarchyTreeForm', true);
					associatedHierarchyTreeID = 'hierarchyTreeForm';
					const { newValue } = event.getParameters();

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

			onFilterWorkItems(event) {
				const binding = this.byId('tableWorkItems').getBinding('items');
				const key = event.getParameter('selectedKey');
				binding.filter(this._filters[key]);
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
				model.setProperty('/busy', true);

				this.checkCompleteness();
				await model.create('/MyWorkItems', { localPath: '/MyWorkItems/X', ...newWorkItem });

				model.setProperty('/busy', false);
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

			async updateWorkItem(event) {
				const bindingContext = event.getSource().getBindingContext();
				const localPath = bindingContext.getPath();
				const workItem = bindingContext.getObject();
				await this.getModel().update({ ...workItem, localPath });
			},

			async onPressDeleteWorkItems() {
				const model = this.getModel();
				const table = this.byId('tableWorkItems');
				const workItemsToDelete = table.getSelectedContexts().map((context) => context.getObject());

				await Promise.all(
					workItemsToDelete.map((workItem) => {
						if (workItem.type === 'Manual') return model.remove(workItem);
						return model.callFunction('/removeDraft', {
							method: 'POST',
							urlParameters: {
								ID: workItem.ID,
								activatedDate: workItem.activatedDate,
								completedDate: workItem.completedDate
							}
						});
					})
				);

				const data = model.getProperty('/MyWorkItems').filter((entity) => {
					const keepItem = !workItemsToDelete
						.map((wi) => wi.__metadata.uri)
						.includes(entity.__metadata.uri);
					return keepItem;
				});

				model.setProperty('/MyWorkItems', data);

				table.removeSelections();

				MessageToast.show(`Deleted ${workItemsToDelete.length} work items.`);
			}
		});
	}
);
