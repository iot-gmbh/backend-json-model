sap.ui.define(["sap/ui/core/mvc/Controller","sap/ui/core/UIComponent","sap/m/library","../model/formatter"],(e,t,r,o)=>{const{URLHelper:s}=r;return e.extend("iot.planner.components.managecategories.controller.BaseController",{formatter:o,getRouter(){return t.getRouterFor(this)},getModel(e){return this.getView().getModel(e)||this.getOwnerComponent().getModel(e)},setModel(e,t){return this.getView().setModel(e,t)},async read({path:e,...t}){return new Promise((r,o)=>{this.getModel("OData").read(e,{...t,success:r,error:o})})},async create({path:e,data:t}){return new Promise((r,o)=>{this.getModel("OData").create(e,t,{success:r,error:o})})},getResourceBundle(){return this.getOwnerComponent().getModel("i18n").getResourceBundle()},onShareEmailPress(){const e=this.getModel("objectView")||this.getModel("worklistView");s.triggerEmail(null,e.getProperty("/shareSendEmailSubject"),e.getProperty("/shareSendEmailMessage"))}})});