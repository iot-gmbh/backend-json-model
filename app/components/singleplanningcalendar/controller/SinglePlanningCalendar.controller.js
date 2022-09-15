/* eslint-disable no-unused-vars */
/* eslint-disable camelcase */
sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/Filter",
    "../model/formatter",
    "../model/legendItems",
    "sap/base/Log",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
  ],
  (
    BaseController,
    Filter,
    formatter,
    legendItems,
    Log,
    MessageBox,
    MessageToast
  ) => {
    function addDays(date, days) {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    }

    function getMondayMorning() {
      const date = new Date(new Date().setHours(0, 0, 0, 1));
      const day = date.getDay();
      const diff = date.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
      return new Date(date.setDate(diff));
    }

    return BaseController.extend(
      "iot.planner.components.singleplanningcalendar.controller.SinglePlanningCalendar",
      {
        formatter,

        async onInit() {
          const bundle = this.getResourceBundle();
          const calendar = this.byId("SPCalendar");
          const workWeekView = calendar.getViews()[1];

          calendar.setSelectedView(workWeekView);
          calendar.setStartDate(getMondayMorning());

          this.getRouter()
            .getRoute("calendar")
            .attachPatternMatched(
              () =>
                Promise.all([this._loadAppointments(), this._loadHierarchy()]),
              this
            );

          $(document).keydown((evt) => {
            const activeElementID =
              $(document.activeElement) &&
              $(document.activeElement).control()[0] &&
              $(document.activeElement).control()[0].getId();

            if (evt.ctrlKey) {
              if (
                evt.keyCode === 13 &&
                !this.byId("submitButton").getEnabled()
              ) {
                MessageToast.show(
                  bundle.getText("appointmentDialog.invalidInput")
                );
                return;
              }
              if (
                evt.keyCode === 13 &&
                activeElementID &&
                // Check the active element in order to prevent double-submit
                !activeElementID.includes("submitButton")
              ) {
                evt.preventDefault();

                this.onSubmitEntry();
              } else if (evt.keyCode === 46) {
                evt.preventDefault();

                const appointmentControl = sap.ui
                  .getCore()
                  .byId(activeElementID);
                const appointment = appointmentControl
                  .getBindingContext()
                  .getObject();

                this._deleteAppointment(appointment);
              }
            }
          });
        },

        onBeforeRendering() {
          const bundle = this.getResourceBundle();
          const model = this.getModel();

          model.setData({
            MyWorkItems: { NEW: {} },
            busy: true,
            categories: {},
            hierarchySuggestion: "",
            legendItems: Object.entries(legendItems.getItems()).map(
              ([key, { type }]) => ({
                text: bundle.getText(`legendItems.${key}`),
                type,
              })
            ),
          });

          // Otherwise new entries won't be displayed in the calendar
          model.setSizeLimit(300);
        },

        onSelectHierarchy(event) {
          const { rowContext } = event.getParameters();

          if (!rowContext) return;

          const hierarchyPath = rowContext.getProperty("path");
          const path = event.getSource().getBindingContext().getPath();

          this.getModel().setProperty(`${path}/parentPath`, hierarchyPath);
        },

        onDisplayLegend() {
          this.byId("legendDialog").open();
        },

        onPressAppointment(event) {
          const { appointment } = event.getParameters();

          if (appointment) {
            this._bindAndOpenDialog(appointment.getBindingContext().getPath());
          }
        },

        async onEditAppointment(event) {
          const model = this.getModel();
          const { startDate, endDate, appointment, copy } =
            event.getParameters();

          const bindingContext = appointment.getBindingContext();
          const data = bindingContext.getObject();

          let path = bindingContext.getPath();

          if (copy) {
            path = "/MyWorkItems/NEW";
            model.setProperty("/MyWorkItems/NEW", appointment);
          }

          if (!data.parentPath) {
            this._bindAndOpenDialog(path);
            return;
          }

          this._submitEntry({
            ...data,
            date: startDate,
            activatedDate: startDate,
            completedDate: endDate,
            localPath: path,
          });
        },

        onPressDeleteAppointment(event) {
          const appointment = event.getSource().getBindingContext().getObject();

          this._deleteAppointment(appointment);
        },

        async _deleteAppointment(appointment) {
          const model = this.getModel();

          model.setProperty("/dialogBusy", true);

          try {
            await model.remove(appointment);

            if (appointment.source !== "Manual") {
              await model.callFunction("/removeDraft", {
                method: "POST",
                urlParameters: {
                  ID: appointment.ID,
                  activatedDate: appointment.activatedDate,
                  completedDate: appointment.completedDate,
                },
              });
            }
          } catch (error) {
            Log.error(error);
          }

          this._closeDialog("createItemDialog");
          model.setProperty("/dialogBusy", false);
        },

        async onPressResetAppointment(event) {
          const model = this.getModel();
          const bindingContext = event.getSource().getBindingContext();
          const appointment = bindingContext.getObject();
          const path = bindingContext.getPath();

          model.setProperty("/dialogBusy", true);

          try {
            const appointmentSync = await model.callFunction("/resetToDraft", {
              method: "POST",
              urlParameters: {
                ID: appointment.ID,
              },
            });

            model.setProperty(path, appointmentSync);
            this._closeDialog("createItemDialog");
          } catch (error) {
            Log.error(error);
          }

          model.setProperty("/dialogBusy", false);
        },

        onCreateAppointment(event) {
          this._createAppointment(event);
          this._bindAndOpenDialog("/MyWorkItems/NEW");
        },

        _createAppointment(event) {
          const model = this.getModel();
          const { startDate, endDate } = event.getParameters();
          const appointment = {
            date: startDate,
            activatedDate: startDate,
            completedDate: endDate,
          };

          model.setProperty("/MyWorkItems/NEW", appointment);
        },

        _bindAndOpenDialog(path) {
          const model = this.getModel();
          const bundle = this.getResourceBundle();
          const appointment = model.getProperty(path);
          const dialog = this.byId("createItemDialog");

          model.setProperty(
            "/createItemDialogTitle",
            appointment.ID
              ? bundle.getText("editAppointment")
              : bundle.getText("createAppointment")
          );

          this._filterHierarchyByPath(appointment.parentPath);

          dialog.bindElement(path);
          dialog.open();
        },

        onChangeHierarchy(event) {
          const { newValue } = event.getParameters();
          this._filterHierarchyByPath(newValue);
        },

        filterTree(array, texts) {
          // See: https://stackoverflow.com/questions/45289854/how-to-effectively-filter-tree-view-retaining-its-existing-structure
          const getChildren = (result, object) => {
            if (
              (object.path &&
                texts.every((text) =>
                  object.path.toUpperCase().includes(text)
                )) ||
              (object.absoluteReference &&
                texts.every((text) =>
                  object.absoluteReference.toUpperCase().includes(text)
                )) ||
              (object.deepReference &&
                texts.every((text) =>
                  object.deepReference.toUpperCase().includes(text)
                ))
            ) {
              result.push(object);
              return result;
            }

            if (Array.isArray(object.children)) {
              const children = object.children.reduce(getChildren, []);
              if (children.length) result.push({ ...object, children });
            }
            return result;
          };

          return array.reduce(getChildren, []);
        },

        _filterHierarchyByPath(query) {
          const filters = [];
          const model = this.getModel();
          const { MyCategoriesNested } = model.getData();

          if (!query) {
            model.setProperty("/MyCategoriesNestedAndFiltered", []);
            return;
          }

          const categoriesFiltered = this.filterTree(
            MyCategoriesNested,
            query
              .split(" ")
              .filter(Boolean)
              .map((text) => text.toUpperCase())
          );

          // const categoriesNested = model.nest({ items: categoriesFiltered });
          model.setProperty(
            "/MyCategoriesNestedAndFiltered",
            categoriesFiltered
          );

          const tree = this.byId("hierarchyTree");

          tree.getRows().forEach((row) => {
            const titleCell = row.getCells()[0];

            if (!titleCell) return;

            const htmlText = titleCell
              .getHtmlText()
              .replaceAll("<strong>", "")
              .replaceAll("</strong>", "");

            titleCell.setHtmlText(htmlText);

            if (!query) return;

            const querySubstrings = query.split(/>| /);

            const newText = querySubstrings.reduce(
              (text, sub) => text.replace(sub, `<strong>${sub}</strong>`),
              htmlText
            );

            titleCell.setHtmlText(newText);
          });
        },

        async onSubmitEntry() {
          const model = this.getModel();
          const appointment = this.byId("createItemDialog")
            .getBindingContext()
            .getObject();

          const path = this.byId("createItemDialog")
            .getBindingContext()
            .getPath();

          if (appointment.isAllDay) {
            MessageToast.show(
              this.getResourceBundle().getText(
                "message.allDayEventsAreNotEditable"
              )
            );
            return;
          }

          model.setProperty("/dialogBusy", true);

          appointment.localPath = path;

          try {
            await this._submitEntry(appointment);
          } catch (error) {
            Log.error(error);
          }

          model.setProperty("/dialogBusy", false);
          this._closeDialog("createItemDialog");
        },

        async _submitEntry(appointment) {
          const data = appointment;
          const model = this.getModel();
          const { MyCategories } = model.getData();
          const parent = MyCategories.find(
            (cat) => cat.path === appointment.parentPath
          );

          data.parentPath = parent.path;
          data.parent_ID = parent.ID;

          const month = appointment.date.getUTCMonth();
          const day = appointment.date.getUTCDate();
          const year = appointment.date.getUTCFullYear();

          data.activatedDate.setFullYear(year, month, day);
          data.completedDate.setFullYear(year, month, day);

          // Update
          if (data.ID) {
            await model.update(data);
          } else {
            await model.create("/MyWorkItems", data);

            model.setProperty("/MyWorkItems/NEW", {});
          }
        },

        onCloseDialog(event) {
          event.getSource().getParent().close();
        },

        _closeDialog(dialogName) {
          this.byId(dialogName).close();
        },

        onAfterCloseDialog() {
          this.getModel().setProperty("/MyWorkItems/NEW", {});
        },

        onChangeView() {
          this._loadAppointments();
        },

        onStartDateChange() {
          this._loadAppointments();
        },

        onUpdateTags(event) {
          const model = this.getModel();
          const multiInput = event.getSource();
          const path = multiInput.getBindingContext().getPath();

          this._removeDuplicateTokens(multiInput);

          const tags = multiInput
            .getTokens()
            .map((token) => ({ tag_title: token.getKey() }));

          model.setProperty(`${path}/tags`, tags);

          this._suggestCategory(tags);
        },

        async _suggestCategory(tags) {
          const tagsSortedAndConcatenated = tags
            .map(({ tag_title }) => tag_title)
            .join(" ");

          const { results: suggestions } = await this.read({
            path: "/MatchCategory2Tags",
            urlParameters: {
              $search: tagsSortedAndConcatenated,
            },
          });

          this.getModel().setProperty(
            "/hierarchySuggestion",
            suggestions[0] ? suggestions[0].categoryTitle : ""
          );
        },

        _removeDuplicateTokens(multiInput) {
          const tokens = multiInput.getTokens();
          const tokensMap = {};

          tokens.forEach((token) => {
            const title = token.getText();
            tokensMap[title] = token;
          });

          multiInput.setTokens(Object.values(tokensMap));
        },

        onDeleteToken(event) {
          const token = event.getSource();
          const multiInput = token.getParent();

          multiInput.removeToken(token);
        },

        _getCalendarEndDate() {
          const calendar = this.byId("SPCalendar");
          const startDate = calendar.getStartDate();
          const selectedView = calendar._getSelectedView().getKey();

          const mapDaysToAdd = {
            Day: 1,
            WorkWeek: 5,
            Week: 7,
            // Sicher ist sicher, im Zweifel zu viele Daten laden => 31 Tage
            Month: 31,
          };

          const daysToAdd = mapDaysToAdd[selectedView];
          const endDate = addDays(startDate, daysToAdd);

          return endDate;
        },

        async _loadAppointments() {
          const model = this.getModel();
          const calendar = this.byId("SPCalendar");
          const startDate = calendar.getStartDate();
          const endDate = this._getCalendarEndDate();

          model.setProperty("/busy", true);

          const { results: workItems } = await model.callFunction(
            "/getCalendarView",
            {
              urlParameters: {
                startDateTime: startDate,
                endDateTime: endDate,
              },
            }
          );

          const appointments = workItems.map(
            ({ completedDate, activatedDate, isAllDay, ...appointment }) => ({
              ...appointment,
              tags: appointment.tags.results,
              // completedDate,
              // activatedDate,
              activatedDate: isAllDay
                ? new Date(activatedDate.setHours(0))
                : activatedDate,
              completedDate: isAllDay
                ? addDays(completedDate.setHours(0), -1)
                : completedDate,
            })
          );

          model.setProperty("/MyWorkItems", appointments);
          model.setProperty("/busy", false);
        },

        async _loadHierarchy() {
          const model = this.getModel();

          model.setProperty("/busy", true);

          try {
            const { results } = await model.callFunction("/getMyCategoryTree");
            const categoriesNested = model.nest({ items: results });

            model.setProperty("/MyCategories", results);
            model.setProperty("/MyCategoriesNested", categoriesNested);
            model.setProperty(
              "/MyCategoriesNestedAndFiltered",
              categoriesNested
            );
          } catch (error) {
            Log.error(error);
          }

          model.setProperty("/busy", false);
        },

        _getUser() {
          return new Promise((resolve, reject) => {
            this.getModel().read("/MyUser", {
              success: (response) => {
                const myUser = response.results[0];
                if (!myUser)
                  reject(
                    new Error("User does not exist in DB. Please create it.")
                  );
                return resolve(myUser);
              },
            });
          });
        },
      }
    );
  }
);
