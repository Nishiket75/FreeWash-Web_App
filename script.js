const EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";
const EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID";
const EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";

(function () {
  if (typeof emailjs !== "undefined" && EMAILJS_PUBLIC_KEY !== "YOUR_PUBLIC_KEY") {
    emailjs.init({ publicKey: EMAILJS_PUBLIC_KEY });
  }
})();


const servicesData = [
  { id: 1, name: "Dry Cleaning", price: 200.0, icon: "👔" },
  { id: 2, name: "Wash & Fold", price: 100.0, icon: "🧺" },
  { id: 3, name: "Ironing", price: 30.0, icon: "♨️" },
  { id: 4, name: "Stain Removal", price: 500.0, icon: "✨" },
  { id: 5, name: "Leather & Suede Cleaning", price: 999.0, icon: "🧥" },
  { id: 6, name: "Wedding Dress Cleaning", price: 2800.0, icon: "👗" },
];

// Cart state (Initially empty)
let cart = [];


const servicesListEl = document.getElementById("services-list");
const cartItemsBodyEl = document.getElementById("cart-items-body");
const emptyCartMsgEl = document.getElementById("empty-cart-msg");
const totalAmountEl = document.getElementById("total-amount");
const bookingForm = document.getElementById("booking-form");
const bookingStatusEl = document.getElementById("booking-status");
const bookNowBtn = document.getElementById("book-now-btn");
const scrollBtn = document.getElementById("scroll-to-booking-btn");
const hamburgerBtn = document.getElementById("hamburger-btn");
const navLinksEl = document.getElementById("nav-links");
const newsletterForm = document.getElementById("newsletter-form");
const newsletterStatusEl = document.getElementById("newsletter-status");


hamburgerBtn.addEventListener("click", () => {
  navLinksEl.classList.toggle("active");
});

scrollBtn.addEventListener("click", () => {
  document.getElementById("services").scrollIntoView({ behavior: "smooth" });
});


function renderServices() {
  servicesListEl.innerHTML = "";

  servicesData.forEach((service) => {
    const isInCart = cart.some((item) => item.id === service.id);

    const row = document.createElement("div");
    row.className = "service-row";

    row.innerHTML = `
      <div class="service-info">
        <span class="service-icon">${service.icon}</span>
        <span>${service.name}</span>
        <span>•</span>
        <span class="service-price">₹${service.price.toFixed(2)}</span>
      </div>
      <button 
        type="button" 
        class="btn-toggle ${isInCart ? "btn-remove" : "btn-add"}" 
        onclick="toggleCartItem(${service.id})"
      >
        ${
          isInCart
            ? 'Remove Item <i class="fa-solid fa-circle-minus"></i>'
            : 'Add Item <i class="fa-solid fa-circle-plus"></i>'
        }
      </button>
    `;

    servicesListEl.appendChild(row);
  });
}

function toggleCartItem(serviceId) {
  const existingIndex = cart.findIndex((item) => item.id === serviceId);

  if (existingIndex > -1) {
    cart.splice(existingIndex, 1);
  } else {
    const selectedService = servicesData.find((item) => item.id === serviceId);
    if (selectedService) {
      cart.push(selectedService);
    }
  }

  // Clear previous status messages when cart updates
  bookingStatusEl.textContent = "";
  bookingStatusEl.className = "booking-status";

  renderServices();
  renderCart();
}

function renderCart() {
  cartItemsBodyEl.innerHTML = "";

  if (cart.length === 0) {
    emptyCartMsgEl.style.display = "block";
    totalAmountEl.textContent = "₹0.00";
    return;
  }

  emptyCartMsgEl.style.display = "none";
  let total = 0;

  cart.forEach((item, index) => {
    total += item.price;
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${item.name}</td>
      <td>₹${item.price.toFixed(2)}</td>
    `;
    cartItemsBodyEl.appendChild(tr);
  });

  totalAmountEl.textContent = `₹${total.toFixed(2)}`;
}


bookingForm.addEventListener("submit", function (e) {
  e.preventDefault();

  if (cart.length === 0) {
    bookingStatusEl.textContent = "Please add at least one service to the cart before booking.";
    bookingStatusEl.className = "booking-status error";
    return;
  }

  const fullName = document.getElementById("full-name").value.trim();
  const emailId = document.getElementById("email-id").value.trim();
  const phoneNumber = document.getElementById("phone-number").value.trim();

  const orderSummary = cart
    .map((item, idx) => `${idx + 1}. ${item.name} - ₹${item.price.toFixed(2)}`)
    .join("\n");

  const totalAmount = cart.reduce((sum, item) => sum + item.price, 0).toFixed(2);

  const templateParams = {
    customer_name: fullName,
    customer_email: emailId,
    customer_phone: phoneNumber,
    order_details: orderSummary,
    total_amount: `₹${totalAmount}`,
  };

  bookNowBtn.disabled = true;
  bookNowBtn.textContent = "Booking...";


  if (
    typeof emailjs !== "undefined" &&
    EMAILJS_PUBLIC_KEY !== "YOUR_PUBLIC_KEY" &&
    EMAILJS_SERVICE_ID !== "YOUR_SERVICE_ID" &&
    EMAILJS_TEMPLATE_ID !== "YOUR_TEMPLATE_ID"
  ) {
    emailjs
      .send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams)
      .then(() => {
        handleBookingSuccess();
      })
      .catch((error) => {
        console.error("EmailJS Error:", error);
        bookingStatusEl.textContent = "Failed to send confirmation email. Please check your EmailJS keys.";
        bookingStatusEl.className = "booking-status error";
      })
      .finally(() => {
        bookNowBtn.disabled = false;
        bookNowBtn.textContent = "Book now";
      });
  } else {
    // Fallback confirmation when testing locally before adding EmailJS keys
    setTimeout(() => {
      handleBookingSuccess();
      bookNowBtn.disabled = false;
      bookNowBtn.textContent = "Book now";
    }, 500);
  }
});

function handleBookingSuccess() {
  bookingStatusEl.textContent = "Thank you For Booking the Service We will get back to you soon!";
  bookingStatusEl.className = "booking-status success";


  bookingForm.reset();
  cart = [];
  renderServices();
  renderCart();
}


newsletterForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const name = document.getElementById("news-name").value.trim();
  newsletterStatusEl.textContent = `Thanks for subscribing, ${name}!`;
  newsletterForm.reset();
});


renderServices();
renderCart();