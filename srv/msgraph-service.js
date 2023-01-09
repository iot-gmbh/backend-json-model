const validator = require("validator");

const fetch = require("node-fetch");
const auth = require("./auth.json");

async function getNewAccessToken(req) {
  const [, tokenValue] = req.user.accessToken.split(" ");

  // const tokenEndpoint = `https://${auth.authority}/${auth.tenantName}/oauth2/${auth.version}/token`;
  const tokenEndpoint =
    "https://login.microsoftonline.com/common/oauth2/v2.0/token";

  const myHeaders = new fetch.Headers();
  myHeaders.append("Content-Type", "application/x-www-form-urlencoded");

  const urlencoded = new URLSearchParams();
  urlencoded.append(
    "grant_type",
    "urn:ietf:params:oauth:grant-type:jwt-bearer"
  );
  urlencoded.append("client_id", auth.clientID);
  urlencoded.append("client_secret", auth.clientSecret);
  urlencoded.append("assertion", tokenValue);
  // urlencoded.append("scope", "openid offline_access .default");
  urlencoded.append("scope", "offline_access User.Read Calendars.Read");
  urlencoded.append("requested_token_use", "on_behalf_of");

  const options = {
    method: "POST",
    headers: myHeaders,
    body: urlencoded,
  };

  const response = await fetch(tokenEndpoint, options);

  const json = await response.json();

  if (json.error) {
    return req.reject(json.error_description);
  }

  if (json.access_token) return json.access_token;

  return req.reject("Access token is missing.");
}

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
      date: new Date(new Date(start.dateTime).toISOString()),
      dateString: new Date(start.dateTime).toISOString().substring(0, 10),
      // dateISOString: new Date(start.dateTime).toISOString(),
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

    const accessToken = req.user.accessToken || (await getNewAccessToken(req));

    const events = await msGraphSrv.send({
      query: `/calendarview?startdatetime=${startDateTime}&enddatetime=${endDateTime}&$top=1000&$select=${select}`,
      headers: {
        Authorization: accessToken,
      },
    });

    const filteredEvents = removeAllDayEvents(events);

    return transformEventsToWorkItems(filteredEvents);
  });

  this.on("getWorkItemByID", async (req) => {
    const accessToken = await getNewAccessToken(req);
    const {
      data: { ID },
    } = req;

    if (validator.isUUID(ID)) {
      return {};
    }

    const events = await msGraphSrv.send({
      query: `/events('${ID}')?$select=${select}`,
      headers: {
        Authorization: accessToken,
      },
    });

    return transformEventsToWorkItems(events);
  });

  srv.on("READ", "WorkItems", async (req) => {
    const accessToken = await getNewAccessToken(req);

    const events = await msGraphSrv.send({
      query: req.query,
      headers: {
        Authorization: accessToken,
      },
    });

    const filteredEvents = removeAllDayEvents(events);

    return transformEventsToWorkItems(filteredEvents);
  });

  srv.on("READ", "Users", async (req) => {
    const accessToken = await getNewAccessToken(req);
    const myUser = await msGraphSrv.send({
      query: "GET /",
      headers: {
        Authorization: accessToken,
      },
    });

    return myUser;
  });
};
