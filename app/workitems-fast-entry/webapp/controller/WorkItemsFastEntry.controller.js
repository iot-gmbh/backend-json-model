sap.ui.define(
	[
		'./BaseController',
		'sap/ui/Device',
		'sap/ui/model/Filter',
		'sap/ui/model/FilterOperator',
		'sap/ui/model/json/JSONModel',
		'sap/m/MessageBox'
	],
	(BaseController, Device, Filter, FilterOperator, JSONModel, MessageBox) =>
		BaseController.extend('iot.workitemsfastentry.controller.WorkItemsFastEntry', {
			onInit() {
				this.searchFilters = [];
				const model = new JSONModel({
					customers: [],
					projects: [],
					newWorkItemText: '',
					workItems: [
						{
							text: 'CAS HCOB, FSDM Business Glossar',
							date: new Date('2022-06-28'),
							startDate: new Date('2022-06-28T08:00Z'),
							endDate: new Date('2022-06-28T10:00Z'),
							extractedCustomer: 'CAS HCOB',
							filteredProjects: [],
							extractedProject: 'FSDM Business Glossar'
						},
						{
							text: 'IOT GmbH, Pflege eigener Systeme',
							date: new Date('2022-06-28'),
							startDate: new Date('2022-06-28T10:00Z'),
							endDate: new Date('2022-06-28T11:00Z'),
							extractedCustomer: 'IOT GmbH',
							filteredProjects: [],
							extractedProject: 'Pflege eigener Systeme'
						}
					],
					itemsRemovable: true
				});

				this.setModel(model);
				this._loadCustomersAndProjects();
			},

			async _loadCustomersAndProjects() {
				const model = this.getModel();
				const user = await this._getUserInfoService();

				// TODO: Mailadresse entfernen
				const email = user && user.getEmail() ? user.getEmail() : 'benedikt.hoelker@iot-online.de';

				const { results: allProjects } = await this.read({
					path: '/Users2Projects',
					filters: [
						new Filter({
							path: 'user_userPrincipalName',
							operator: 'EQ',
							value1: email
						})
					],
					urlParameters: { $expand: 'project/customer,project/workPackages' }
				});

				const customers = [];
				const projects = [];

				allProjects.forEach(({ project }) => {
					projects.push(project);
					customers.push(project.customer);
				});

				model.setProperty('/customers', [
					...new Map(customers.map((customer) => [customer.ID, customer])).values()
				]);
				model.setProperty('/projects', projects);
			},

			_getUserInfoService() {
				return new Promise((resolve) =>
					// eslint-disable-next-line no-promise-executor-return
					sap.ui.require(['sap/ushell/library'], (ushellLib) => {
						const container = ushellLib.Container;
						if (!container) return resolve();

						const service = container.getServiceAsync('UserInfo'); // .getService is deprecated!
						return resolve(service);
					})
				);
			},

			filterProjects(event) {
				const model = this.getModel();
				const projects = model.getProperty('/projects');
				const pathWorkItem = event.getSource().getBindingContext().getPath();
				const selectedCustomerID = model.getProperty(`${pathWorkItem}/customer_ID`);

				if (selectedCustomerID) {
					model.setProperty(
						`${pathWorkItem}/filteredProjects`,
						projects.filter(({ customer_ID }) => customer_ID === selectedCustomerID)
					);
				}
				model.updateBindings(true);
			},

			onSearch(event) {
				this.searchFilters = [];
				this.searchQuery = event.getSource().getValue();

				if (this.searchQuery && this.searchQuery.length > 0) {
					this.searchFilters = new Filter('text', FilterOperator.Contains, this.searchQuery);
				}

				this.byId('table').getBinding('items').filter(this.searchFilters);
			},

			addWorkItem() {
				const model = this.getView().getModel();
				const workItems = model.getProperty('/workItems').map((workItem) => ({ ...workItem }));
				const latestEndDate = workItems.reduce((endDate, workItem) => {
					if (endDate === undefined) {
						return workItem.endDate;
					}
					return workItem.endDate > endDate ? workItem.endDate : endDate;
				}, undefined);

				workItems.push({
					text: model.getProperty('/newWorkItemText'),
					completed: false,
					date: new Date(),
					startDate: latestEndDate,
					endDate: new Date(),
					extractedCustomer: '',
					filteredProjects: [],
					extractedProject: ''
				});

				model.setProperty('/workItems', workItems);
				model.setProperty('/newWorkItemText', '');
			}
		})
);
