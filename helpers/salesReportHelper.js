
const User = require('../models/usermodel')
const Order = require('../models/orderModel')
const fs = require('fs')
const pdfPrinter = require("pdfmake");
const moment = require("moment-timezone");



const loadingDashboard= async (req, res) => {
    return new Promise(async (resolve, reject) => {
        try {
            const users = await User.find({}).lean().exec();
            const totaluser = users.length;

            const totalSales = await Order.aggregate([
                {
                    $match: {
                        status: { $in: ["Placed","Delivered"] },

                    },
                },
                {
                    $group: {
                        _id: null,
                        totalSum: { $sum: "$total" },
                    },
                },
            ]);

            const salesbymonth = await Order.aggregate([
                {
                    $match: {
                        status: { $nin: ["Order Cancelled","Pending"] },
                    },
                },
                {
                    $group: {
                        _id: { $month: "$createdAt" },
                        totalSales: { $sum: "$total" },
                    },
                },
                {
                    $sort: {
                        _id: 1,
                    },
                },
            ]);

            const paymentMethod = await Order.aggregate([
                {
                    $match: {
                        status: { $in: ["Placed", "Delivered"] }, 
                    },
                },
                {
                    $group: {
                        _id: "$paymentMethod",
                        totalOrderValue: { $sum: "$total" },
                        count: { $sum: 1 },
                    },
                },
            ]);

            const currentYear = new Date().getFullYear();
            const previousYear = currentYear - 1;

            const yearSales = await Order.aggregate([
                {
                    $match: {
                        status: { $in: ["Placed", "Delivered"] },
                        createdAt: {
                            $gte: new Date(`${previousYear}-01-01`),
                            $lt: new Date(`${currentYear + 1}-01-01`),
                        },
                    },
                },
                {
                    $group: {
                        _id: {
                            $year: "$createdAt",
                        },
                        totalSales: {
                            $sum: "$total",
                        },
                    },
                },
            ])
                .exec();

            const todaysalesDate = new Date();
            const startOfDay = new Date(
                todaysalesDate.getFullYear(),
                todaysalesDate.getMonth(),
                todaysalesDate.getDate(),
                0,
                0,
                0,
                0
            );
            const endOfDay = new Date(
                todaysalesDate.getFullYear(),
                todaysalesDate.getMonth(),
                todaysalesDate.getDate(),
                23,
                59,
                59,
                999
            );

            const todaySales = await Order.aggregate([
                {
                    $match: {
                        status: { $in: ["pending", "Delivered", "Placed"] },

                        createdAt: {
                            $gte: startOfDay, // Set the current date's start time
                            $lt: endOfDay,
                        },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: "$total" },
                    },
                },
            ]);

            const dashBoardDetails = {
                totaluser,
                totalSales,
                salesbymonth,
                paymentMethod,
                yearSales,
                todaySales
            }

            resolve(dashBoardDetails)
        } catch (error) {
            reject(error)
        }
    })

}

const OrdersList= async (req, res) => {
    try {
        let orderDetails = await Order.find().populate('user').lean();
       
        orderDetails = orderDetails.reverse();

        const orderHistory = orderDetails.map(history => {
            let createdOnIST = moment(history.createdAt)
                .tz('Asia/Kolkata')
                .format('DD-MM-YYYY h:mm A');

            return { ...history, date: createdOnIST, userName: history.user.name };
        });

        return orderHistory
    } catch (error) {
        console.log(error.message)
    }
}



//new salesReport function
const orderSuccess= () => {
    return new Promise(async (resolve, reject) => {
        try {
            
                 const order = await Order
                .find({ status: { $in: ["Placed", "Delivered"] } })
                .sort({ date: -1 })
                .lean()
                .exec();
  
            const orderHistory = order.map(history => {
                let createdOnIST = moment(history.createdAt)
                    .tz('Asia/Kolkata')
                    .format('DD-MM-YYYY h:mm A');
  
                return { ...history, date: createdOnIST, userName: history.user.name };
            });
  
            const total = await Order.aggregate([
                {
                    $match: {
                        status: { $in: ["Placed", "Delivered",] },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: "$total" },
                    },
                },
                {
                    $sort: {
                        totalAmount: 1,
                    },
                },
            ]);
    
            const orderDetails = {
                orderHistory,
                total
            }
            resolve(orderDetails)
        } catch (error) {
            reject(error)
        }
    })
  }



  const salesToday= () => {
    return new Promise(async (resolve, reject) => {
        try {
            const todaysales = new Date();
            const startOfDay = new Date(
                todaysales.getFullYear(),
                todaysales.getMonth(),
                todaysales.getDate(),
                0,
                0,
                0,
                0
            );
            const endOfDay = new Date(
                todaysales.getFullYear(),
                todaysales.getMonth(),
                todaysales.getDate(),
                23,
                59,
                59,
                999
            );
            const order = await Order.find({
                status: { $nin: ["Order Cancelled"] },
                createdAt: {
                    $gte: startOfDay,
                    $lt: endOfDay
                }
            }).sort({ date: -1 })
  
            const orderHistory = order.map(history => {
                const createdOnIST = moment(history.createdAt).tz('Asia/Kolkata').format('DD-MM-YYYY h:mm A');
                return { ...history._doc, date: createdOnIST, userName: history.user.name };
            });
  
            const total = await Order.aggregate([
                {
                    $match: {
  
                        status: { $in: ["Placed", "Delivered"] },
  
                        createdAt: {
                            $gte: startOfDay, 
                            $lt: endOfDay,
                        },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: "$total" },
                    },
                },
            ]);

            const salesToday = {
                orderHistory,
                total
            }
  
            if (order) {
                resolve(salesToday)
            }
            else {
                resolve("No sales registerd today")
            }
        } catch (error) {
            reject(error)
        }
    })
  }

  const weeklySales= () => {
    return new Promise(async (resolve, reject) => {
        try {
            const currentDate = new Date();

            // Calculate the start and end dates of the current week
            const startOfWeek = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                currentDate.getDate() - currentDate.getDay()
            );
            const endOfWeek = new Date(
                currentDate.getFullYear(),
                currentDate.getMonth(),
                currentDate.getDate() + (6 - currentDate.getDay()),
                23,
                59,
                59,
                999
            );

            const order = await Order.find({
                status: { $nin: ["Order Cancelled","Pending","Returned"] },
                createdAt: {
                    $gte: startOfWeek,
                    $lt: endOfWeek
                }
            }).sort({ date: -1 });


            const orderHistory = order.map(history => {
                const createdOnIST = moment(history.createdAt).tz('Asia/Kolkata').format('DD-MM-YYYY h:mm A');
                return { ...history._doc, date: createdOnIST, userName: history.user.name };
            });

            const total = await Order.aggregate([
                {
                    $match: {
                        status: { $in: ["Placed", "Delivered"] },
                        createdAt: {
                            $gte: startOfWeek,
                            $lt: endOfWeek,
                        },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: "$total" },
                    },
                },
            ]);

            const weeklySales = {
                orderHistory,
                total
            }
            resolve(weeklySales)

        } catch (error) {
            reject(error)
        }
    })
}


const monthlySales= () => {
  return new Promise(async (resolve, reject) => {
      try {
          const thisMonth = new Date().getMonth() + 1;
          const startofMonth = new Date(
              new Date().getFullYear(),
              thisMonth - 1,
              1,
              0,
              0,
              0,
              0
          );
          const endofMonth = new Date(
              new Date().getFullYear(),
              thisMonth,
              0,
              23,
              59,
              59,
              999
          );
     
          const order = await Order.find({
              status: { $nin: ["Order Cancelled","Returned","Pending"] },
              createdAt: {
                  $lt: endofMonth,
                  $gte: startofMonth,
              }
          }).sort({ date: -1 });


          const orderHistory = order.map(history => {
              const createdOnIST = moment(history.createdAt).tz('Asia/Kolkata').format('DD-MM-YYYY h:mm A');
              return { ...history._doc, date: createdOnIST, userName: history.user.name };
          });

          const total = await Order.aggregate([
              {
                  $match: {
                      status: { $in: ["Placed", "Delivered"] },
                      createdAt: {
                          $lt: endofMonth,
                          $gte: startofMonth,
                      },
                  },
              },
              {
                  $group: {
                      _id: null,
                      totalAmount: { $sum: "$total" },
                  },
              },
          ]);

          const monthlySales = {
              orderHistory,
              total
          }

          resolve(monthlySales)
      } catch (error) {
          reject(error)
      }
  })
}


const yearlySales= () => {
    return new Promise(async (resolve, reject) => {
        try {
            const today = new Date().getFullYear();
            const startofYear = new Date(today, 0, 1, 0, 0, 0, 0);
            const endofYear = new Date(today, 11, 31, 23, 59, 59, 999);

            const order = await Order.find({
                status: { $nin: ["Order Cancelled","Pending"] },
                createdAt: {
                    $lt: endofYear,
                    $gte: startofYear,
                }
            }).sort({ date: -1 });

            const orderHistory = order.map(history => {
                const createdOnIST = moment(history.cretedAt).tz('Asia/Kolkata').format('DD-MM-YYYY h:mm A');
                return { ...history._doc, date: createdOnIST, userName: history.user.name };
            });

            const total = await Order.aggregate([
                {
                    $match: {
                        status: { $in: ["Placed", "Delivered"] },
                        createdAt: {
                            $lt: endofYear,
                            $gte: startofYear,
                        },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: "$total" },
                    },
                },
            ]);

            const yearlySales = {
                orderHistory,
                total
            }

            resolve(yearlySales)
        } catch (error) {
            reject(error)
        }
    })
}


const salesWithDate= (req, res) => {
    return new Promise(async (resolve, reject) => {
        try {
            const date = new Date();
            const fromDate = new Date(req.body.fromDate);
            const toDate = new Date(req.body.toDate);
            fromDate.setHours(0, 0, 0, 0); // Set time to 00:00:00.000
            toDate.setHours(23, 59, 59, 999);

            const order = await Order.find({
                status: { $nin: ["Order Cancelled"] },
                createdAt: {
                    $lt: toDate,
                    $gte: fromDate,
                }
            }).sort({ date: -1 });


            const orderHistory = order.map(history => {
                const createdOnIST = moment(history.createdAt).tz('Asia/Kolkata').format('DD-MM-YYYY h:mm A');
                return { ...history._doc, date: createdOnIST, userName: history.user.name };
            });

            const total = await Order.aggregate([
                {
                    $match: {
                        status: { $in: ["Placed", "Delivered"] },
                        createdAt: {
                            $lt: toDate,
                            $gte: fromDate,
                        },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: "$total" },
                    },
                },
            ]);

            const salesWithDate = {
                orderHistory,
                total
            }
            resolve(salesWithDate)
        } catch (error) {
            console.log('salesWithDate helper error')
            reject(error)
        }
    })
}



const salesPdf= (req, res) => {
    return new Promise(async (resolve, reject) => {
        try {
            let startY = 150;
            const writeStream = fs.createWriteStream("order.pdf");
            const printer = new pdfPrinter({
                Roboto: {
                    normal: "Helvetica",
                    bold: "Helvetica-Bold",
                    italics: "Helvetica-Oblique",
                    bolditalics: "Helvetica-BoldOblique",
                },
            });

            const order = await Order
                .find({ status: { $in: ["Placed", "Delivered"] } })
                .exec();

            const totalAmount = await Order.aggregate([
                {
                    $match: {
                        status: { $nin: ["Order Cancelled"] },
                    },
                },
                {
                    $group: {
                        _id: null,
                        totalAmount: { $sum: "$total" },
                    },
                },
            ]);

            const dateOptions = { year: "numeric", month: "long", day: "numeric" };
            // Create document definition
            const docDefinition = {
                content: [
                    { text: "TimeKeeper", style: "header" },
                    { text: "\n" },
                    { text: "Order Information", style: "header1" },
                    { text: "\n" },
                    { text: "\n" },
                ],
                styles: {
                    header: {
                        fontSize: 25,
                        alignment: "center",
                    },
                    header1: {
                        fontSize: 12,
                        alignment: "center",
                    },
                    total: {
                        fontSize: 18,
                        alignment: "start",
                    },
                },
            };

            // Create the table data
            const tableBody = [
                ["No", "Date", "Order Id", "Status", "Payment", "Amount"], // Table header
            ];

            for (let i = 0; i < order.length; i++) {
                const data = order[i];
                const formattedDate = new Intl.DateTimeFormat(
                    "en-US",
                    dateOptions
                ).format(new Date(data.createdAt));
                tableBody.push([
                    (i + 1).toString(), // Index value
                    formattedDate,
                    data.id,
                    data.status,
                    data.paymentMethod,
                    data.status,
                ]);
            }

            const table = {
                table: {
                    widths: ["auto", "auto", "auto", "auto", "auto", "auto"],
                    headerRows: 1,
                    body: tableBody,
                },
            };

            // Add the table to the document definition
            docDefinition.content.push(table);
            docDefinition.content.push([
                { text: "\n" },
                { text: `Total: ${totalAmount[0]?.totalAmount || 0}`, style: "total" },
            ]);
            // Generate PDF from the document definition
            const pdfDoc = printer.createPdfKitDocument(docDefinition);

            // Pipe the PDF document to a write stream
            pdfDoc.pipe(writeStream);

            // Finalize the PDF and end the stream
            pdfDoc.end();

            writeStream.on("finish", () => {
                res.download("order.pdf", "order.pdf");
            });
        } catch (error) {
            console.log('pdfSales helper error')
            reject(error)
        }
    })
}

  module.exports={
    orderSuccess,
    loadingDashboard,
    OrdersList,
    salesToday,
    weeklySales,
    monthlySales,
    yearlySales,
    salesWithDate,
    salesPdf
   }