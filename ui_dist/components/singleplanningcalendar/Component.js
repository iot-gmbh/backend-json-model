sap.ui.define(["iot/CustomODataV2Model","./model/models","sap/ui/core/UIComponent"],(e,t,i)=>i.extend("iot.planner.components.singleplanningcalendar.Component",{metadata:{manifest:"json"},init(...n){i.prototype.init.apply(this,...n);this.setModel(new e("/v2/timetracking/"));this.getRouter().initialize();this.setModel(t.createDeviceModel(),"device")}}));