sap.ui.define(
  [
    "sap/m/Button",
    "./ErrorHandler",
    "sap/ui/core/Fragment",
    "./MessagePopover",
    "sap/ui/core/MessageType",
  ],
  (Button, ErrorHandler, Fragment, MessagePopover, MessageType) => {
    const MessagePopoverButton = Button.extend(
      "errorhandler.MessagePopoverButton",
      {
        metadata: {
          library: "errorhandler",
          defaultAggregation: "_items",
          aggregations: {
            _items: {
              type: "sap.m.MessageItem",
              multiple: true,
              singularName: "item",
            },
            _popover: {
              type: "sap.m.MessagePopover",
              multiple: false,
              visibility: "hidden",
            },
          },
          properties: {
            icon: {
              type: "string",
              defaultValue: "sap-icon://message-popup",
            },
            modelName: {
              type: "string",
              defaultValue: "message",
            },
            enableMail: {
              type: "boolean",
              defaultValue: false,
            },
          },
        },

        renderer: "sap.m.ButtonRenderer",

        init(...args) {
          const messageModel = ErrorHandler.getMessageModel();
          this.setModel(messageModel, "message");

          Button.prototype.init.apply(this, ...args);

          this.setAggregation("_popover", new MessagePopover());

          this.attachPress(() => this.getAggregation("_popover").toggle(this));
        },

        openPopover() {
          const popover = this.getAggregation("_popover");

          if (popover.isOpen()) return;

          popover.openBy(this);
        },

        closePopover() {
          const popover = this.getAggregation("_popover");

          if (!popover.isOpen()) return;

          popover.close();
        },
      }
    );

    MessagePopoverButton.prototype.onBeforeRendering = async function () {
      Button.prototype.onBeforeRendering.apply(this);

      const model = this.getModelName();
      const popover = this.getAggregation("_popover");

      const bindingInfo = this.getBindingInfo("_items");
      if (bindingInfo) {
        popover.bindAggregation("items", bindingInfo);
        return;
      }

      // das übergebene Model als Default-Model verwenden, damit die MessageItems einheitlich gebunden werden können
      this.setModel(this.getModel(model));

      const messageItem = await Fragment.load({
        id: this.getId(),
        name: `errorhandler.fragments.MessageItem`,
        controller: popover,
      });

      this.bindAggregation("_items", {
        path: "/",
        template: messageItem,
        templateShareable: true,
      });

      popover.bindAggregation("items", this.getBindingInfo("_items"));
      popover.setEnableMail(this.getEnableMail());

      this.bindProperty("type", {
        path: "/",
        formatter: (messages) =>
          messages.filter((message) => {
            const messageType = message.getType();
            return (
              messageType === MessageType.Error ||
              messageType === MessageType.Warning
            );
          }).length > 0
            ? "Emphasized"
            : "Default",
      });

      this.bindProperty("text", {
        path: "/",
        formatter: (messages) =>
          messages.filter((message) => {
            const messageType = message.getType();
            return (
              messageType === MessageType.Error ||
              messageType === MessageType.Warning
            );
          }).length,
      });
    };

    return MessagePopoverButton;
  }
);
