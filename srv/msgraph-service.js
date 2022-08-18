const client = require("@sap/cds/libx/_runtime/remote/utils/client");

module.exports = async function (srv) {
  const msGraphSrv = await cds.connect.to("microsoft.graph");

  srv.on("READ", "Events", async (req) => {
    const queryString = req.getUrlObject().path;

    /* 
    TODO: Extract filters for start and end. Then add them to the URL as query params in the form of:   
    &startdatetime=2022-08-17T20:57:35.986Z&enddatetime=2022-08-24T20:57:35.996Z
    */

    const result = await msGraphSrv.send({
      query: queryString,
      headers: {
        Authorization: `Bearer ${req.user.accessToken}`,
      },
    });
    return result;

    // if (Array.isArray(result)) {
    //   // We need the mapping, otherwise the objects would be too big
    //   return result.map(
    //     ({ id, subject, start, end, sensitivity, categories, isAllDay }) => ({
    //       id,
    //       subject,
    //       start,
    //       end,
    //       sensitivity,
    //       categories,
    //       isAllDay,
    //     })
    //   );
    // }

    // const { id, subject, start, end, sensitivity, categories, isAllDay } =
    //   result;
    // return {
    //   id,
    //   subject,
    //   start,
    //   end,
    //   sensitivity,
    //   categories,
    //   isAllDay,
    // };
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
