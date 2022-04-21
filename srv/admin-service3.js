// const cds = require("@sap/cds");

// module.exports = srv => {
//   srv.after('each', 'Projects', async (project, req) => {

//     const result = await cds.transaction(req).run(
//         SELECT.from('Projects').join('Customers').on('Projects.customer.ID', '=', 'Customer.ID')  
//     );
//     console.log(result);

//     if (project.invoiceRelevance === null) { 
//         project.invoiceRelevance = result.invoiceRelevance;
//     }
//   });
// };


// function treatAsUTC(date) {
//   const result = new Date(date);
//   result.setMinutes(result.getMinutes() - result.getTimezoneOffset());
//   return result;
// }

// function getDaysBetween(startDate, endDate) {
//   const millisecondsPerDay = 24 * 60 * 60 * 1000;
//   return (treatAsUTC(endDate) - treatAsUTC(startDate)) / millisecondsPerDay;
// }

// module.exports = (srv) => {
//   srv.after("READ", "Tasks", (tasks) => {
//     return tasks.map(async (task) => {
//       task.daysBetween = (
//         getDaysBetween(task.beginFrom, task.dueDate) || 0
//       ).toFixed(2);

//       task.workload = (task.estimate / task.daysBetween).toFixed(2) || 0;
//     });
//   });
// };
