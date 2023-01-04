sap.ui.define(["../../BaseComponent"], (BaseComponent) =>
  BaseComponent.extend(
    "iot.planner.components.singleplanningcalendar.Component",
    {
      async init(...args) {
        // call the base component's init function
        BaseComponent.prototype.init.apply(this, [
          "/v2/timetracking/",
          ...args,
        ]);
      },
    }
  )
);
