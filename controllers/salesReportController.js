
const salesReportHelper = require('../helpers/salesReportHelper')




//sales report
const salesReport = async (req, res) => {
  try {
    const orderSuccessDetails = await salesReportHelper.orderSuccess();

    res.render("salesReport", {
      order: orderSuccessDetails.orderHistory,
      total: orderSuccessDetails.total,
    });
  } catch (error) {
    console.log(error.message);
  }
};


const todaySales = async (req, res) => {
  try {
    const todaySales = await salesReportHelper.salesToday();

    res.render("salesReport", {
      order: todaySales.orderHistory,
      total: todaySales.total,
    });
  } catch (error) {
    console.log(error.message);
  }
};


const weeklySales = async (req, res) => {
  try {
    const weeklySales = await salesReportHelper.weeklySales();
    console.log("weeklySalesssssss", weeklySales);

    res.render("salesReport", {
      order: weeklySales.orderHistory,
      total: weeklySales.total,
    });
  } catch (error) {
    console.log(error.message);
    res.redirect("/admin/admin-error");
  }
};
const monthlySales = async (req, res) => {
  try {
    const montlySales = await salesReportHelper.monthlySales();

    res.render("salesReport", {
      order: montlySales.orderHistory,
      total: montlySales.total,
    });
  } catch (error) {
    console.log(error.message);
    res.redirect("/admin/admin-error");
  }
};

const yearlySales = async (req, res) => {
  try {
    const yearlySales = await salesReportHelper.yearlySales();

    res.render("salesReport", {
      order: yearlySales.orderHistory,
      total: yearlySales.total,
    });
  } catch (error) {
    console.log(error.message);
  }
};


const salesWithDate = async (req, res) => {
  try {
    const salesWithDate = await salesReportHelper.salesWithDate(req, res);
    res.render("salesReport", {
      order: salesWithDate.orderHistory,
      total: salesWithDate.total,
    });
  } catch (error) {
    console.log(error);
  }
};


const downloadSalesReport = async (req, res) => {
  try {
    const salesPdf = await salesReportHelper.salesPdf(req, res);
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
  salesReport,
  todaySales,
  weeklySales,
  monthlySales,
  yearlySales,
  salesWithDate,
  downloadSalesReport
}