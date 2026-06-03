const menuToggle = document.getElementById("menuToggle");
const mainNav = document.getElementById("mainNav");

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    mainNav.classList.toggle("open");
  });

  mainNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => mainNav.classList.remove("open"));
  });
}

const revealItems = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.2 }
);

revealItems.forEach((item) => revealObserver.observe(item));

const joinForm = document.getElementById("joinForm");
const formFeedback = document.getElementById("formFeedback");

if (joinForm && formFeedback) {
  joinForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!joinForm.checkValidity()) {
      formFeedback.textContent = "Completa todos los campos para enviar tu solicitud.";
      formFeedback.style.color = "#b44518";
      return;
    }

    formFeedback.textContent =
      "Gracias por sumarte. Recibimos tu solicitud y te contactaremos en las proximas 48 horas.";
    formFeedback.style.color = "#1f6f3b";
    joinForm.reset();
  });
}

const itemFilter = document.getElementById("itemFilter");

const applyItemFilter = () => {
  if (!itemFilter) return;

  const selected = itemFilter.value;
  document.querySelectorAll(".free-card").forEach((card) => {
    const category = card.dataset.category || "";
    const shouldShow = selected === "todos" || selected === category;
    card.classList.toggle("hidden", !shouldShow);
  });
};

if (itemFilter) {
  itemFilter.addEventListener("change", applyItemFilter);
}

const donationForm = document.getElementById("donationForm");
const donationFeedback = document.getElementById("donationFeedback");
const freeProductsGrid = document.getElementById("freeProductsGrid");

if (donationForm && donationFeedback && freeProductsGrid) {
  donationForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!donationForm.checkValidity()) {
      donationFeedback.textContent = "Completa todos los datos para publicar tu producto.";
      donationFeedback.style.color = "#b44518";
      return;
    }

    const itemName = document.getElementById("itemName").value.trim();
    const itemCategory = document.getElementById("itemCategory").value;
    const itemZone = document.getElementById("itemZone").value.trim();
    const itemState = document.getElementById("itemState").value.trim();
    const itemDescription = document.getElementById("itemDescription").value.trim();

    const newCard = document.createElement("article");
    newCard.className = "free-card";
    newCard.dataset.category = itemCategory;

    const badge = document.createElement("span");
    badge.className = "free-badge";
    badge.textContent = "Nuevo";

    const title = document.createElement("h3");
    title.textContent = itemName;

    const description = document.createElement("p");
    description.textContent = itemDescription;

    const list = document.createElement("ul");
    const zoneItem = document.createElement("li");
    zoneItem.textContent = `Zona: ${itemZone}`;
    const stateItem = document.createElement("li");
    stateItem.textContent = `Estado: ${itemState}`;
    const pickupItem = document.createElement("li");
    pickupItem.textContent = "Retiro: A coordinar con la persona donante";

    list.append(zoneItem, stateItem, pickupItem);

    const interestButton = document.createElement("button");
    interestButton.type = "button";
    interestButton.className = "btn btn-secondary interest-btn";
    interestButton.textContent = "Me interesa";

    newCard.append(badge, title, description, list, interestButton);

    freeProductsGrid.prepend(newCard);
    applyItemFilter();
    donationFeedback.textContent =
      "Publicacion de ejemplo creada. En la version final se guardara en una base de datos.";
    donationFeedback.style.color = "#1f6f3b";
    donationForm.reset();
  });
}

document.addEventListener("click", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  if (target.classList.contains("interest-btn")) {
    const card = target.closest(".free-card");
    const title = card ? card.querySelector("h3") : null;
    const productName = title ? title.textContent : "este producto";
    const message = `Interes registrado para ${productName}. Este es un prototipo de demostracion.`;

    if (donationFeedback) {
      donationFeedback.textContent = message;
      donationFeedback.style.color = "#1f6f3b";
    } else if (formFeedback) {
      formFeedback.textContent = message;
      formFeedback.style.color = "#1f6f3b";
    }
  }
});
