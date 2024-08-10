const maxAmount = 60000;
const correctPassword = "3215"; // Senha para restauração
let total = parseFloat(localStorage.getItem("totalPaid")) || 0;

document.addEventListener("DOMContentLoaded", function () {
  loadData();
  updateProgressBar();
  updateAmountInfo();
});

function updateProgressBar() {
  const progressBar = document.getElementById("progress-bar");
  const progress = Math.min((total / maxAmount) * 100, 100);
  progressBar.style.width = progress + "%";
  progressBar.textContent = Math.round(progress) + "%";
}

function updateAmountInfo() {
  const totalPaid = document.getElementById("total-paid");
  const remainingAmount = document.getElementById("remaining-amount");

  totalPaid.textContent = `R$ ${total.toFixed(2)}`;
  remainingAmount.textContent = `R$ ${(maxAmount - total).toFixed(2)}`;
}

function saveData(date, value, receiptPath) {
  let payments = JSON.parse(localStorage.getItem("payments")) || [];
  payments.push({ date, value, receiptPath });
  localStorage.setItem("payments", JSON.stringify(payments));
  localStorage.setItem("totalPaid", total.toFixed(2));
}

function loadData() {
  let payments = JSON.parse(localStorage.getItem("payments")) || [];
  payments.forEach((payment) => {
    addTableRow(payment.date, payment.value, payment.receiptPath);
  });
}

function addTableRow(date, value, receiptPath) {
  const table = document.getElementById("value-table");
  const row = table.insertRow();

  const cellDate = row.insertCell(0);
  cellDate.textContent = formatDate(date);

  const cellValue = row.insertCell(1);
  cellValue.textContent = `R$ ${parseFloat(value).toFixed(2)}`;

  const cellReceipt = row.insertCell(2);
  if (receiptPath) {
    const img = document.createElement("img");
    img.src = receiptPath;
    img.style.maxWidth = "100px";
    img.style.cursor = "pointer";
    img.addEventListener("click", () => openLightbox(receiptPath));
    cellReceipt.appendChild(img);
  } else {
    cellReceipt.textContent = "Nenhum recibo";
  }
}

function formatDate(dateString) {
  const options = { year: "numeric", month: "2-digit", day: "2-digit" };
  return new Date(dateString).toLocaleDateString("pt-BR", options);
}

function openLightbox(imageSrc) {
  const lightbox = document.getElementById("lightbox");
  const lightboxImage = document.getElementById("lightbox-image");
  lightboxImage.src = imageSrc;
  lightbox.style.display = "flex";
}

function closeLightbox() {
  document.getElementById("lightbox").style.display = "none";
  document.getElementById("lightbox-image").src = "";
}

function convertToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

document
  .getElementById("value-form")
  .addEventListener("submit", async function (event) {
    event.preventDefault();

    const value = parseFloat(document.getElementById("value").value);
    const date = document.getElementById("date").value;
    const receipt = document.getElementById("receipt").files[0];

    if (isNaN(value) || !date) {
      alert("Por favor, insira um valor válido e uma data.");
      return;
    }

    total += value;
    updateProgressBar();
    updateAmountInfo();

    let receiptPath = "";
    if (receipt) {
      receiptPath = await convertToBase64(receipt);
    }

    addTableRow(date, value, receiptPath);
    saveData(date, value, receiptPath);

    document.getElementById("value-form").reset();
  });

document.getElementById("reset-btn").addEventListener("click", function () {
  const password = prompt("Digite a senha para restaurar o site:");
  if (password === correctPassword) {
    if (
      confirm(
        "Tem certeza de que deseja restaurar o site? Todos os dados serão perdidos."
      )
    ) {
      localStorage.clear();
      location.reload();
    }
  } else {
    alert("Senha incorreta.");
  }
});

document
  .querySelector(".lightbox-close")
  .addEventListener("click", closeLightbox);
