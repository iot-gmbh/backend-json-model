sap.ui.define(
  [
    "sap/ui/core/util/MockServer",
    "sap/ui/model/json/JSONModel",
    "sap/base/util/UriParameters",
    "sap/base/Log",
  ],
  (e, t, r, a) => {
    let o;
    const i = "iot.singleplanningcalendar/";
    const n = `${i}localService/mockdata`;
    const s = {
      init(s) {
        const u = s || {};
        return new Promise((s, c) => {
          const p = sap.ui.require.toUrl(`${i}manifest.json`);
          const l = new t(p);
          l.attachRequestCompleted(() => {
            const t = new r(window.location.href);
            const c = sap.ui.require.toUrl(n);
            const p = l.getProperty("/sap.app/dataSources/mainService");
            const f = sap.ui.require.toUrl(i + p.settings.localUri);
            const d = p.uri
                && new URI(p.uri).absoluteTo(sap.ui.require.toUrl(i)).toString();
            if (!o) {
              o = new e({ rootUri: d });
            } else {
              o.stop();
            }
            e.config({
              autoRespond: true,
              autoRespondAfter: u.delay || t.get("serverDelay") || 500,
            });
            o.simulate(f, {
              sMockdataBaseUrl: c,
              bGenerateMissingMockData: true,
            });
            const g = o.getRequests();
            const m = function (e, t, r) {
              r.response = function (r) {
                r.respond(e, { "Content-Type": "text/plain;charset=utf-8" }, t);
              };
            };
            if (u.metadataError || t.get("metadataError")) {
              g.forEach((e) => {
                if (e.path.toString().indexOf("$metadata") > -1) {
                  m(500, "metadata Error", e);
                }
              });
            }
            const v = u.errorType || t.get("errorType");
            const h = v === "badRequest" ? 400 : 500;
            if (v) {
              g.forEach((e) => {
                m(h, v, e);
              });
            }
            o.setRequests(g);
            o.start();
            a.info("Running the app with mock data");
            s();
          });
          l.attachRequestFailed(() => {
            const e = "Failed to load application manifest";
            a.error(e);
            c(new Error(e));
          });
        });
      },
      getMockServer() {
        return o;
      },
    };
    return s;
  },
);
