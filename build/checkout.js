// This is your test publishable API key.
const stripe = Stripe("pk_test_51OI5wZHJLfqlerXMkRLyXjQqx5e7bijGP81Y9KnuN3d6gUwJcmaoDC3vqUmi1VL1oCRubP8V0zmsJ0Ts7m0swmSJ00imeDuqsz");


// // The items the customer wants to buy
// const username = new URLSearchParams(window.location.search).get(
//     "username"
// );
// const deposit = new URLSearchParams(window.location.search).get(
//     "deposit"
// );


// The items the customer wants to buy
const username = new URLSearchParams(window.location.search).get(
    "username"
);
const deposit = new URLSearchParams(window.location.search).get(
    "deposit"
);

const itemsCount = new URLSearchParams(window.location.search).get(
    "iteme"
);

const plane = new URLSearchParams(window.location.search).get(
    "plane"
);

// console.log(`Deposit $${deposit} @${username}`)

const items = [{ price: deposit, email: username }];
// console.log("items", items)
let elements;

initialize();
checkStatus();

document
  .querySelector("#payment-form")
  .addEventListener("submit", handleSubmit);

// Fetches a payment intent and captures the client secret
async function initialize() {

  // INSET HTML TEXT
  if (plane) {
    // INSET HTML TEXT
    document.getElementById("depositID").innerHTML = `Subscribe $${deposit} @${username}` // Subscribe $50 @username
  } else {
    document.getElementById("depositID").innerHTML = `CONFARM PAYMENT OF $${deposit}`
  }


  const response = await fetch("/api/create-payment-intent", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items }),
  });
  const { clientSecret, paymentIntentId } = await response.json();

  const appearance = {
    theme: 'flat',
  };
  elements = stripe.elements({ appearance, clientSecret });

  const paymentElementOptions = {
    layout: "tabs",
  };

  const paymentElement = elements.create("payment", paymentElementOptions);
  paymentElement.mount("#payment-element");
}


async function handleSubmit(e){

    e.preventDefault();
    setLoading(true);

    const conditionUrl = `https://borderless-buy.vercel.app/payment-successful?orderId=${paymentIntentId}&amount=${deposit}&items=${itemsCount}&email=${username}`// "https://modanmic-fintech.onrender.com" // plane ?`https://tradebot-k4nt.onrender.com/success-subscribe.html?username=${username}&deposit=${deposit}&plane=${plane}`   : `https://tradebot-k4nt.onrender.com/success.html?username=${username}&deposit=${deposit}` // plane ?`http://localhost:3001/success-subscribe.html?username=${username}&deposit=${deposit}&plane=${plane}`   : `https://tradebot-k4nt.onrender.com/success.html?username=${username}&deposit=${deposit}`

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: conditionUrl, // `https://tradebot-k4nt.onrender.com/success.html?username=${username}&deposit=${deposit}`, // `http://localhost:3001/success.html?username=${username}&deposit=${deposit}`,
        receipt_email: document.getElementById("email").value,
      //   receipt_email: emailAddress,
      },
    });

    // if (plane) {
    //   error = await stripe.confirmPayment({
    //     elements,
    //     confirmParams: {
    //       // Make sure to change this to your payment completion page
    //       return_url: `http://localhost:3001/success-subscribe.html?username=${username}&deposit=${deposit}&plane=${plane}`, // `https://tradebot-k4nt.onrender.com/success.html?username=${username}&deposit=${deposit}`, // `http://localhost:3001/success.html?username=${username}&deposit=${deposit}`,
    //       receipt_email: document.getElementById("email").value,
    //     //   receipt_email: emailAddress,
    //     },
    //   });
    // }else {
    //   error = await stripe.confirmPaymen({
    //     elements,
    //     confirmParams: {
    //       // Make sure to change this to your payment completion page
    //       return_url: `https://tradebot-k4nt.onrender.com/success.html?username=${username}&deposit=${deposit}`, // `http://localhost:3001/success.html?username=${username}&deposit=${deposit}`,
    //       receipt_email: document.getElementById("email").value,
    //     //   receipt_email: emailAddress,
    //     },
    //   });
    // }
    // const { error } = await stripe.confirmPayment({
    //   elements,
    //   confirmParams: {
    //     // Make sure to change this to your payment completion page
    //     return_url: `http://localhost:3001/success-subscribe.html?username=${username}&deposit=${deposit}&plane=${plane}`, // `https://tradebot-k4nt.onrender.com/success.html?username=${username}&deposit=${deposit}`, // `http://localhost:3001/success.html?username=${username}&deposit=${deposit}`,
    //     receipt_email: document.getElementById("email").value,
    //   //   receipt_email: emailAddress,
    //   },
    // });

    // console.log(error)

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error.type === "card_error" || error.type === "validation_error") {
      showMessage(error.message);
    } else {
      showMessage("An unexpected error occurred.");
    }

    setLoading(false);
  }


// Fetches the payment intent status after payment submission
async function checkStatus() {
  const clientSecret = new URLSearchParams(window.location.search).get(
    "payment_intent_client_secret"
  );

  if (!clientSecret) {
    return;
  }

  const { paymentIntent } = await stripe.retrievePaymentIntent(clientSecret);

  switch (paymentIntent.status) {
    case "succeeded":
      showMessage("Payment succeeded!");
      break;
    case "processing":
      showMessage("Your payment is processing.");
      break;
    case "requires_payment_method":
      showMessage("Your payment was not successful, please try again.");
      break;
    default:
      showMessage("Something went wrong.");
      break;
  }
}

// ------- UI helpers -------

function showMessage(messageText) {
  const messageContainer = document.querySelector("#payment-message");

  messageContainer.classList.remove("hidden");
  messageContainer.textContent = messageText;

  setTimeout(function () {
    messageContainer.classList.add("hidden");
    messageContainer.textContent = "";
  }, 4000);
}

// Show a spinner on payment submission
function setLoading(isLoading) {
  if (isLoading) {
    // Disable the button and show a spinner
    document.querySelector("#submit").disabled = true;
    document.querySelector("#spinner").classList.remove("hidden");
    document.querySelector("#button-text").classList.add("hidden");
  } else {
    document.querySelector("#submit").disabled = false;
    document.querySelector("#spinner").classList.add("hidden");
    document.querySelector("#button-text").classList.remove("hidden");
  }
}
