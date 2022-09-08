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

  function convertDateTimeToLocalISOString(dateTimeUTC) {
    const dateUTC = new Date(dateTimeUTC);
    const dateUTCHours = dateUTC.getHours();
    const dateLocal = dateUTC.setHours(dateUTCHours + 4);

    return new Date(dateLocal).toISOString();
  }

  function transformEventToWorkItem({
    id,
    subject,
    start,
    end,
    categories,
    sensitivity,
    isAllDay,
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

      All-Day events show the wrong times and are a couple of hours off (02:00 instead of 00:00).
      This leads to UI5 showing repeating them each single day instead of showing all-day events.
      Thus we replace the time for all-day events
      */
      date: start.dateTime,
      activatedDate: `${start.dateTime.substring(0, 19)}Z`,
      completedDate: `${end.dateTime.substring(0, 19)}Z`,
      assignedTo_userPrincipalName: user,
      private: sensitivity === "private",
      isAllDay,
      source: "MSGraphEvent",
    };
  }

  const transformEventsToWorkItems = (events) => {
    if (Array.isArray(events)) {
      return events.map((event) => transformEventToWorkItem(event));
    }

    return transformEventToWorkItem(events);
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

    return transformEventsToWorkItems(events);
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

    return transformEventsToWorkItems(events);
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
