const cdsapi = require("@sapmentors/cds-scp-api");

function parseQueryParams(select) {
  const filter = {};

  Object.assign(
    filter,
    parseExpression(select.from.ref[0].where),
    parseExpression(select.where)
  );

  if (!Object.keys(filter).length) {
    throw new Error("At least one filter is required");
  }

  const params = {};

  for (const key of Object.keys(filter)) {
    switch (key) {
      case "end/dateTime":
        params["end/dateTime"] = filter[key];
        break;
      case "start/dateTime":
        params["start/dateTime"] = filter[key];
        break;
      default:
        throw new Error(`Filter by '${key}' is not supported.`);
    }
  }

  return params;
}

function parseExpression(expr) {
  if (!expr) {
    return {};
  }
  const [property, _, value] = expr;
  // if (operator !== "=") {
  //   throw new Error(`Expression with '${operator}' is not allowed.`);
  // }
  const parsed = {};
  if (property && value) {
    parsed[property.ref[0]] = value.val;
  }
  return parsed;
}

module.exports = async function (srv) {
  const MSGraphSrv = await cdsapi.connect.to("MicrosoftGraphIOTGmbH");

  srv.before("READ", "*", async (req) => {
    try {
      const queryParams = parseQueryParams(req.query.SELECT);
      const queryString = Object.keys(queryParams)
        .map((key) => `${key}=${queryParams[key]}`)
        .join("&");
      req.query = `?${queryString}`;
    } catch (error) {
      req.reject(400, error.message);
    }
  });

  srv.on("READ", "Events", async (req) => {
    const user = process.env.NODE_ENV
      ? req.user.id
      : "benedikt.hoelker@iot-online.de";

    const { value } = await MSGraphSrv.run({
      url: `/v1.0/users/${user}/events${req}`,
    });

    return value;
  });

  srv.on("READ", "Users", async () => {
    let users = [];
    const { value } = await MSGraphSrv.run({
      url: `/v1.0/users`,
    });

    users = value.map(({ id, ...usr }) => ({
      ID: id,
      ...usr,
    }));

    return users;
  });
};
