const amountInput = document.querySelector("#amount");
const gstRateInput = document.querySelector("#gst-rate");
const priceTypeInput = document.querySelector("#price-type");
const discountInput = document.querySelector("#discount");
const invoiceTypeInputs = document.querySelectorAll("input[name='invoice-type']");
const copyButton = document.querySelector("#copy-summary");
const copyStatus = document.querySelector("#copy-status");

const output = {
  finalTotal: document.querySelector("#final-total"),
  taxableValue: document.querySelector("#taxable-value"),
  gstAmount: document.querySelector("#gst-amount"),
  cgst: document.querySelector("#cgst"),
  sgst: document.querySelector("#sgst"),
  igst: document.querySelector("#igst"),
  effectiveRate: document.querySelector("#effective-rate"),
};

const money = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

let latestSummary = "";

function numberFrom(input) {
  const value = Number.parseFloat(input.value);
  return Number.isFinite(value) && value > 0 ? value : 0;
}

function selectedInvoiceType() {
  return document.querySelector("input[name='invoice-type']:checked").value;
}

function calculate() {
  const rawAmount = numberFrom(amountInput);
  const discount = Math.min(numberFrom(discountInput), rawAmount);
  const rate = Number.parseFloat(gstRateInput.value) / 100;
  const discountedAmount = rawAmount - discount;
  const isInclusive = priceTypeInput.value === "inclusive";
  const invoiceType = selectedInvoiceType();

  const taxableValue = isInclusive ? discountedAmount / (1 + rate) : discountedAmount;
  const gstAmount = isInclusive ? discountedAmount - taxableValue : taxableValue * rate;
  const finalTotal = taxableValue + gstAmount;
  const cgst = invoiceType === "intra" ? gstAmount / 2 : 0;
  const sgst = invoiceType === "intra" ? gstAmount / 2 : 0;
  const igst = invoiceType === "inter" ? gstAmount : 0;

  output.finalTotal.textContent = money.format(finalTotal);
  output.taxableValue.textContent = money.format(taxableValue);
  output.gstAmount.textContent = money.format(gstAmount);
  output.cgst.textContent = money.format(cgst);
  output.sgst.textContent = money.format(sgst);
  output.igst.textContent = money.format(igst);
  output.effectiveRate.textContent = `${(rate * 100).toFixed(0)}%`;

  latestSummary = [
    "GST Invoice Splitter summary",
    `Final total: ${money.format(finalTotal)}`,
    `Taxable value: ${money.format(taxableValue)}`,
    `GST amount: ${money.format(gstAmount)}`,
    `CGST: ${money.format(cgst)}`,
    `SGST: ${money.format(sgst)}`,
    `IGST: ${money.format(igst)}`,
  ].join("\n");
}

function bindInputs() {
  [amountInput, gstRateInput, priceTypeInput, discountInput, ...invoiceTypeInputs].forEach((input) => {
    input.addEventListener("input", calculate);
    input.addEventListener("change", calculate);
  });
}

async function copySummary() {
  try {
    await navigator.clipboard.writeText(latestSummary);
    copyStatus.textContent = "Summary copied.";
  } catch {
    copyStatus.textContent = latestSummary;
  }
}

bindInputs();
copyButton.addEventListener("click", copySummary);
calculate();
