sap.ui.define(
  [
    "sap/m/Button",
    "sap/m/MessagePopover",
    "sap/m/library",
    "sap/ui/model/resource/ResourceModel",
  ],
  (Button, MessagePopover, SAPMLibrary, ResourceModel) => {
    const messagePopover = MessagePopover.extend(
      "errorhandler.MessagePopover",
      {
        metadata: {
          library: "errorhandler",
          properties: {
            enableMail: {
              type: "boolean",
              defaultValue: false,
            },
          },
          events: {},
        },
        renderer: "sap.m.MessagePopoverRenderer",

        init(...args) {
          MessagePopover.prototype.init.apply(this, ...args);

          this._resBundle = new ResourceModel({
            bundleName: "errorhandler.i18n.i18n",
          }).getResourceBundle();

          this.attachActiveTitlePress((event) => this.focusControl(event));
        },

        focusControl(event) {
          const button = event.getSource().getParent();
          const toolbar = button.getParent();
          const page = toolbar.getParent();
          const message = event
            .getParameter("item")
            .getBindingContext()
            .getObject();
          const control = sap.ui.getCore().byId(message.getControlId());
          
          if (!control || !page || typeof page.scrollToElement !== "function")
            return;

          page.scrollToElement(control.getDomRef(), 200);
          setTimeout(() => control.focus(), 300);
        },

        _isItemPositionable(controlIds) {
          return (
            controlIds && Array.isArray(controlIds) && controlIds.length > 0
          );
        },

        triggerEmail() {
          const bundle = this._resBundle;
          const appComponent = this.getAppComponent();

          const subject = bundle.getText(
            "mailTitle",
            appComponent
              ? appComponent.getManifest()["sap.app"].title
              : [window.location.href]
          );
          const body = this.getUserInfos() + this.getMsgInfos();

          SAPMLibrary.URLHelper.triggerEmail(
            bundle.getText("mailAddress"),
            subject,
            body
          );
        },

        getAppComponent() {
          if (!sap.ushell || !sap.ushell.Container) return undefined;

          return sap.ushell.Container.getService(
            "AppLifeCycle"
          ).getCurrentApplication().componentInstance;
        },

        getUserInfos() {
          if (!sap.ushell || !sap.ushell.Container) return "";

          const appComponent = this.getAppComponent();
          const user = appComponent.getModel("user").getProperty("/user");

          // falls das UserModel genutzt wird sollen die Daten des aktuellen Benutzers ausgelesen werden
          // ansonsten wird der User der Shell verwendet
          if (user) {
            return this._resBundle.getText("userInformationLong", [
              user.PersonalFullName,
              user.UserName,
              user.PlantName,
              user.Plant,
            ]);
          }

          return this._resBundle.getText(
            "userInformationShort",
            sap.ushell.Container.getService("UserInfo").getId()
          );
        },

        getMsgInfos() {
          return JSON.stringify(
            this.getModel()
              .getData()
              .map(({ processor, ...message }) => {
                // anstatt dem Timestamp soll Datum und Uhrzeit in leslicher Form ausgegeben werden
                const time = new Date(message.date);

                return {
                  ...message,
                  date: time.toLocaleDateString(),
                  time: time.toLocaleTimeString(),
                };
              })
          );
        },
      }
    );

    messagePopover.prototype.onBeforeRenderingPopover = async function () {
      MessagePopover.prototype.onBeforeRenderingPopover.apply(this);

      if (this._alreadyRendered) return;

      this._alreadyRendered = true;

      if (!this.getEnableMail()) return;

      this.setHeaderButton(
        new Button({
          text: this._resBundle.getText("sendMail"),
          press: () => this.triggerEmail(),
        })
      );
    };

    return messagePopover;
  }
);
