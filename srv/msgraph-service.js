const validator = require("validator");

module.exports = async function (srv) {
  const msGraphSrv = await cds.connect.to("microsoft.graph");

  const selectFields = [
    "id",
    "subject",
    "start",
    "end",
    "categories",
    "sensitivity",
    "isAllDay",
  ];
  const select = selectFields.join(",");

  function transformEventToWorkItem({
    id,
    subject = "",
    start,
    end,
    categories,
    sensitivity,
    isAllDay,
    location,
    user,
  }) {
    return {
      ID: encodeURIComponent(id),
      title: subject,
      tags: categories
        .concat(
          subject
            .split(" ")
            .filter((v) => v.startsWith("#"))
            .map((x) => x.substr(1))
        )
        .map((tag_title) => ({
          tag_title,
        })),
      /*
      The original format is: '2022-06-23T14:30:00.0000000'
      OData needs a format like this: '2022-06-23T00:00:00Z'
      */
      date: new Date(new Date(start.dateTime).setHours(0, 0, 0)).toISOString(),
      activatedDate: `${start.dateTime.substring(0, 19)}Z`,
      completedDate: `${end.dateTime.substring(0, 19)}Z`,
      assignedTo_userPrincipalName: user,
      private: sensitivity === "private",
      isAllDay,
      activity: undefined,
      location,
      source: "MSGraphEvent",
    };
  }

  function removeAllDayEvents(events) {
    return events.filter((event) => event.isAllDay === false);
  }

  const transformEventsToWorkItems = (events) => {
    if (Array.isArray(events)) {
      return events
        .filter(({ subject }) => !!subject)
        .map((event) => transformEventToWorkItem(event));
    }

    const filteredEvents = removeAllDayEvents(events);

    return transformEventToWorkItem(filteredEvents);
  };

  this.on("getCalendarView", async (req) => {
    const {
      data: { startDateTime, endDateTime },
    } = req;

    const events = await msGraphSrv.send({
      query: `/calendarview?startdatetime=${startDateTime}&enddatetime=${endDateTime}&$top=1000&$select=${select}`,
      headers: {
        Authorization: `Bearer ${req.user.accessToken}`,
      },
    });

    const filteredEvents = removeAllDayEvents(events);

    return transformEventsToWorkItems(filteredEvents);
  });

  this.on("getWorkItemByID", async (req) => {
    const {
      data: { ID },
    } = req;

    if (validator.isUUID(ID)) {
      return {};
    }

    const events = await msGraphSrv.send({
      query: `/events('${ID}')?$select=${select}`,
      headers: {
        Authorization: `Bearer ${req.user.accessToken}`,
      },
    });

    return transformEventsToWorkItems(events);
  });

  srv.on("READ", "WorkItems", async (req) => {
    const events = await msGraphSrv.send({
      query: req.query,
      headers: {
        Authorization: `Bearer ${req.user.accessToken}`,
      },
    });

    const filteredEvents = removeAllDayEvents(events);

    return transformEventsToWorkItems(filteredEvents);
  });

  srv.on("READ", "Users", async (req) => {
    const myUser = await msGraphSrv.send({
      query: "GET /",
      headers: {
        Authorization: `Bearer ${req.user.accessToken}`,
      },
    });

    return myUser;
  });
};
