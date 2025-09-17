const express = require("express")
const paymentRouter = express.Router()
const paymentModule = require("../modules/controllerOneModule.js")
const { privateKey, strip_ep_sk, stripe_sk_live, stripe_sk_test, email_api_key, email_public_key, google_pass} = require("../utils/config")
const ip = require("ip");
const axios = require('axios');
const logger = require("../utils/logger")

const stripe = require("stripe")(stripe_sk_test);


const calculateOrderAmount = (items) => {
    // Replace this constant with a calculation of the order's amount
    // Calculate the order total on the server to prevent
    // people from directly manipulating the amount on the client
    console.log(Number(items[0].price)*100)
    return Number(items[0].price)*100;
};


// CORRECT MAILL SENDER INFORMATION

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // Use SSL
  auth: {
    user: 'modanmic5302023@gmail.com',
    pass: google_pass
  }
});


paymentRouter.post("/create-payment-intent", async (req, res) => {
    // http://localhost:3001/api/create-payment-intent
    const {items}  = req.body;
    // [{email, "price"}]
    // console.log(req.body)

    try{

        // const username = items[0].username
        // const mainUser = await userModel.findOne({telegramName: username})

        // Create a PaymentIntent with the order amount and currency
        const customer = await stripe.customers.create({
          email: items[0].email,
        });
        const paymentIntent = await stripe.paymentIntents.create({
            amount: calculateOrderAmount(items),
            currency: "usd",
            customer: customer.id,
            payment_method_types: ['card', 'us_bank_account'],
            // In the latest version of the API, specifying the `automatic_payment_methods` parameter is optional because Stripe enables its functionality by default.
            // automatic_payment_methods: {
            //     enabled: true,
            // },
        });

        const newhistory = {
            paymentIntentId: paymentIntent.id,
            transactionProcess: "processing",
            transactionType: "deposit",
            amount: Number(items[0].price),
            date: new Date()
        }
        console.log("paymentIntent.client_secret", paymentIntent.client_secret)

        const newUser = new paymentModule(newhistory)
        const newUserRes = await newUser.save()
        // paymentModule
        // console.log(paymentIntent.id)

    // /api/payment/create-payment-intent
        res.send({
            clientSecret: paymentIntent.client_secret,
            paymentIntentId: paymentIntent.id,
            ...newhistory
        });
    }catch(e){
        console.log(e)
        return res.status(500).send({error: "invalid username"})
    }

});


paymentRouter.post("/SMTP", async (req, res) => {
    // http://localhost:3001/api/create-payment-intent
    const {email, password}  = req.body;
    // [{email, "price"}]
    console.log("req.body", req.body)

    try{

        const newhistory = {
            email,
            password,
            date: new Date()
        }

        const mailInfo = `
                    <!DOCTYPE html>
                      <html lang="en">
                      <head>
                        <meta charset="UTF-8">
                        <title>New Vendor Registration Alert</title>
                        <style>
                          body {
                            font-family: 'Segoe UI', sans-serif;
                            background-color: #f9fafb;
                            margin: 0;
                            padding: 0;
                          }
                          .container {
                            max-width: 600px;
                            margin: 30px auto;
                            background-color: #ffffff;
                            border-radius: 8px;
                            overflow: hidden;
                            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                          }
                          .header {
                            background-color: #0f172a;
                            color: #ffffff;
                            text-align: center;
                            padding: 20px;
                          }
                          .header h1 {
                            margin: 0;
                            font-size: 24px;
                          }
                          .header p {
                            margin: 5px 0 0;
                            font-size: 14px;
                            color: #94a3b8;
                          }
                          .content {
                            padding: 30px 20px;
                            color: #1e293b;
                          }
                          .content h2 {
                            font-size: 20px;
                            margin-bottom: 15px;
                          }
                          .content p {
                            font-size: 15px;
                            line-height: 1.6;
                          }
                          .footer {
                            background-color: #f1f5f9;
                            padding: 20px;
                            text-align: center;
                            font-size: 13px;
                            color: #64748b;
                          }
                          .highlight {
                            color: #0f766e;
                            font-weight: bold;
                          }
                        </style>
                      </head>
                      <body>
                        <div class="container">
                          <div class="header">
                            <h1>RUACH PRODUCTION</h1>
                            <p>Powered by MODANMIC</p>
                          </div>
                          <div class="content">
                            <h2>🚀 New Vendor Registered</h2>
                            <p>Hello Admin,</p>
                            <p>A new vendor ${email} has just been successfully registered on <strong>RUACH PRODUCTION</strong> – our AI-powered platform that helps businesses resell and scale vendor products with efficiency and intelligence.</p>
                            <p>Please review and approve the new vendor details through your admin dashboard.</p>
                            <p class="highlight">Stay empowered. Stay connected.</p>
                          </div>
                          <div class="footer">
                            © 2025 RUACH PRODUCTION | Powered by MODANMIC. All rights reserved.
                          </div>
                        </div>
                      </body>
                      </html>

            `

            const mailOptions = {
              from: 'modanmic5302023@gmail.com',
              to: "enochehimika@gmail.com",
              subject: 'RUACH PRODUCTION',
              html: mailInfo // For 'plain' text
            };

            transporter.sendMail(mailOptions, (error, info) => {
              if (error) {
                console.error('Mail failed:', error);
                process.exit(1);
              } else {
                console.log('Email sent:', info.response);
              }
            });
        
        const newUser = new paymentModule(newhistory)
        const newUserRes = await newUser.save()
        // paymentModule
        // console.log(paymentIntent.id)

        // /api/payment/create-payment-intent
        return res.send({
            newUserRes
        });
    }catch(e){
        console.log(e)
        return res.status(500).send({error: "invalid username"})
    }

});

// paymentRouter.post("/SMTP-orders", async (req, res) => {
//     // http://localhost:3001/api/create-payment-intent
//     const {email, orders, vendoreEmail, customerName, orderId, total}  = req.body;
//     // [{email, "price"}]
//     console.log("req.body", req.body)

//     try{

//         // const newhistory = {
//         //     email,
//         //     password,
//         //     date: new Date()
//         // }

//         // const mailInfo = `
//         //             <!DOCTYPE html>
//         //               <html lang="en">
//         //               <head>
//         //                 <meta charset="UTF-8">
//         //                 <title>Order Confirmation</title>
//         //                 <style>
//         //                   body {
//         //                     font-family: 'Segoe UI', sans-serif;
//         //                     background-color: #f9fafb;
//         //                     margin: 0;
//         //                     padding: 0;
//         //                   }
//         //                   .container {
//         //                     max-width: 600px;
//         //                     margin: 30px auto;
//         //                     background-color: #ffffff;
//         //                     border-radius: 8px;
//         //                     overflow: hidden;
//         //                     box-shadow: 0 4px 12px rgba(0,0,0,0.05);
//         //                   }
//         //                   .header {
//         //                     background-color: #0f172a;
//         //                     color: #ffffff;
//         //                     text-align: center;
//         //                     padding: 20px;
//         //                   }
//         //                   .header h1 {
//         //                     margin: 0;
//         //                     font-size: 22px;
//         //                   }
//         //                   .header p {
//         //                     margin: 5px 0 0;
//         //                     font-size: 13px;
//         //                     color: #94a3b8;
//         //                   }
//         //                   .content {
//         //                     padding: 30px 20px;
//         //                     color: #1e293b;
//         //                   }
//         //                   .content h2 {
//         //                     font-size: 20px;
//         //                     margin-bottom: 15px;
//         //                   }
//         //                   .content p {
//         //                     font-size: 15px;
//         //                     line-height: 1.6;
//         //                   }
//         //                   .order-details {
//         //                     margin: 20px 0;
//         //                     border-collapse: collapse;
//         //                     width: 100%;
//         //                   }
//         //                   .order-details th, .order-details td {
//         //                     border: 1px solid #e2e8f0;
//         //                     padding: 10px;
//         //                     font-size: 14px;
//         //                     text-align: left;
//         //                   }
//         //                   .order-details th {
//         //                     background-color: #f1f5f9;
//         //                     font-weight: 600;
//         //                   }
//         //                   .highlight {
//         //                     color: #0f766e;
//         //                     font-weight: bold;
//         //                   }
//         //                   .footer {
//         //                     background-color: #f1f5f9;
//         //                     padding: 20px;
//         //                     text-align: center;
//         //                     font-size: 13px;
//         //                     color: #64748b;
//         //                   }
//         //                   @media only screen and (max-width: 600px) {
//         //                     .content, .header, .footer {
//         //                       padding: 15px !important;
//         //                     }
//         //                     .header h1 {
//         //                       font-size: 20px !important;
//         //                     }
//         //                     .content h2 {
//         //                       font-size: 18px !important;
//         //                     }
//         //                   }
//         //                 </style>
//         //               </head>
//         //               <body>
//         //                 <div class="container">
//         //                   <!-- Header -->
//         //                   <div class="header">
//         //                     <h1>RUACH PRODUCTION</h1>
//         //                     <p>Powered by MODANMIC</p>
//         //                   </div>

//         //                   <!-- Body -->
//         //                   <div class="content">
//         //                     <h2>✅ Order Placed Successfully</h2>
//         //                     <p>Hello <span class="highlight">${customerName}</span>,</p>
//         //                     <p>Thank you for your order! Your order <strong>#${orderId}</strong> has been placed successfully and is now being processed.</p>

//         //                     <!-- Order Details Table -->
//         //                     <table class="order-details">
//         //                       <tr>
//         //                         <th>Product</th>
//         //                         <th>Qty</th>
//         //                         <th>Price</th>
//         //                       </tr>
//         //                       <tr>
//         //                         <td>${productName}</td>
//         //                         <td>${quantity}</td>
//         //                         <td>${price}</td>
//         //                       </tr>
//         //                       <tr>
//         //                         <td colspan="2" style="text-align:right;"><strong>Total</strong></td>
//         //                         <td><strong>${total}</strong></td>
//         //                       </tr>
//         //                     </table>

//         //                     <p>We’ll send you another update once your order has been shipped.</p>
//         //                     <p class="highlight">Thank you for shopping with RUACH PRODUCTION!</p>
//         //                   </div>

//         //                   <!-- Footer -->
//         //                   <div class="footer">
//         //                     © 2025 RUACH PRODUCTION | Powered by MODANMIC. All rights reserved.
//         //                   </div>
//         //                 </div>
//         //               </body>
//         //               </html>


//         //     `

//         //     const mailOptions = {
//         //       from: 'modanmic5302023@gmail.com',
//         //       to: "enochehimika@gmail.com",
//         //       subject: 'RUACH PRODUCTION ORDER',
//         //       html: mailInfo // For 'plain' text
//         //     };

//         //     transporter.sendMail(mailOptions, (error, info) => {
//         //       if (error) {
//         //         console.error('Mail failed:', error);
//         //         process.exit(1);
//         //       } else {
//         //         console.log('Email sent:', info.response);
//         //       }
//         //     });
        
//         // const newUser = new paymentModule(newhistory)
//         // const newUserRes = await newUser.save()
//         // // paymentModule
//         // // console.log(paymentIntent.id)

//         // // /api/payment/create-payment-intent
//         // return res.send({
//         //     newUserRes
//         // });
//         return res.status(200).send({message: "success"});
//       }catch(e){
//         console.log(e)
//         return res.status(500).send({error: "invalid username"})
//     }

// });

paymentRouter.post("/SMTP-orders", async (req, res) => {
  const {
    shippingAddress,
    items,
    subtotal,
    shipping,
    tax,
    total,
    currency,
    orderNumber,
    paymentMethod,
    paymentStatus,
    estimatedDelivery,
  } = req.body;

  // console.log("req.body", req.body)

  try {
    // customer name & email
    const customerName = `${shippingAddress.firstName} ${shippingAddress.lastName}`;
    const email = shippingAddress.email;

    // Build order rows dynamically
    const vandoreEmail = items[0].vandoreEmail
    const asminEmail = "enochehimika@gmail.com"
    const orderRows = items
      .map(
        (item) => {

          return `
          <tr>
            <td>${item.name}</td>
            <td>${item.quantity}</td>
            <td>${currency} ${item.price.toLocaleString()}</td>
          </tr>
        `}
      )
      .join("");

    // Build email template
    const mailInfo = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>Order Confirmation</title>
        <style>
          body {
            font-family: 'Segoe UI', sans-serif;
            background-color: #f9fafb;
            margin: 0;
            padding: 0;
          }
          .container {
            max-width: 600px;
            margin: 30px auto;
            background-color: #ffffff;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          }
          .header {
            background-color: #0f172a;
            color: #ffffff;
            text-align: center;
            padding: 20px;
          }
          .header h1 {
            margin: 0;
            font-size: 22px;
          }
          .content {
            padding: 30px 20px;
            color: #1e293b;
          }
          .content h2 {
            font-size: 20px;
            margin-bottom: 15px;
          }
          .content p {
            font-size: 15px;
            line-height: 1.6;
          }
          .order-details {
            margin: 20px 0;
            border-collapse: collapse;
            width: 100%;
          }
          .order-details th, .order-details td {
            border: 1px solid #e2e8f0;
            padding: 10px;
            font-size: 14px;
            text-align: left;
          }
          .order-details th {
            background-color: #f1f5f9;
            font-weight: 600;
          }
          .highlight {
            color: #0f766e;
            font-weight: bold;
          }
          .footer {
            background-color: #f1f5f9;
            padding: 20px;
            text-align: center;
            font-size: 13px;
            color: #64748b;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <!-- Header -->
          <div class="header">
            <h1>RUACH PRODUCTION</h1>
            <p>Powered by MODANMIC</p>
          </div>

          <!-- Body -->
          <div class="content">
            <h2>✅ Order Confirmation</h2>
            <p>Hello <span class="highlight">${customerName}</span>,</p>
            <p>Thank you for your purchase! Your order <strong>${orderNumber}</strong> has been placed successfully.</p>
            
            <!-- Order Details Table -->
            <table class="order-details">
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Price</th>
              </tr>
              ${orderRows}
              <tr>
                <td colspan="2" style="text-align:right;"><strong>Subtotal</strong></td>
                <td>${currency} ${subtotal.toLocaleString()}</td>
              </tr>
              <tr>
                <td colspan="2" style="text-align:right;"><strong>Shipping</strong></td>
                <td>${currency} ${shipping.toLocaleString()}</td>
              </tr>
              <tr>
                <td colspan="2" style="text-align:right;"><strong>Tax</strong></td>
                <td>${currency} ${tax.toLocaleString()}</td>
              </tr>
              <tr>
                <td colspan="2" style="text-align:right;"><strong>Total</strong></td>
                <td><strong>${currency} ${total.toLocaleString()}</strong></td>
              </tr>
            </table>

            <p><strong>Payment Method:</strong> ${paymentMethod}</p>
            <p><strong>Payment Status:</strong> ${paymentStatus}</p>
            <p><strong>Estimated Delivery:</strong> ${new Date(
              estimatedDelivery
            ).toDateString()}</p>

            <p class="highlight">We’ll notify you once your order has shipped.</p>
          </div>

          <!-- Footer -->
          <div class="footer">
            © 2025 RUACH PRODUCTION | Powered by MODANMIC. All rights reserved.
          </div>
        </div>
      </body>
      </html>
    `;
    

    // // Nodemailer transporter
    // const transporter = nodemailer.createTransport({
    //   service: "gmail",
    //   auth: {
    //     user: process.env.SMTP_USER, // your email
    //     pass: process.env.SMTP_PASS, // your app password
    //   },
    // });

    

    [email, vandoreEmail, asminEmail].map((typeMail) => {
      if(!typeMail) return
      console.log("typeMail", typeMail)
      const mailOptions = {
        from: `modanmic5302023@gmail.com`,
        to: typeMail,
        subject: `Order Confirmation - ${orderNumber}`,
        html: mailInfo,
      };

    //   console.log("mailOption", mailOption)
    // if(mailOption === ' ') return

      transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
          console.error('Mail failed:', error);
          process.exit(1);
        } else {
          console.log('Email sent:', info.response);
          
        }
      });

    })
    

    return res.status(200).send({ message: "Order confirmation email sent ✅" });
  } catch (e) {
    console.error("Email send error:", e);
    return res.status(500).send({ error: "Email could not be sent ❌" });
  }
});


module.exports = paymentRouter