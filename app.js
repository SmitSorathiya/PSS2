// ===== LOGIN AUTHENTICATION =====
const PASS = 'pss2026';

function attemptLogin() {
  const input = document.getElementById('loginPassword');
  const error = document.getElementById('loginError');
  const card = document.querySelector('.login-card');

  if (input.value === PASS) {
    sessionStorage.setItem('pss_auth', '1');
    const overlay = document.getElementById('loginOverlay');
    overlay.classList.add('hidden');
    setTimeout(() => overlay.style.display = 'none', 400);
  } else {
    error.classList.add('show');
    card.classList.add('shake');
    input.value = '';
    input.focus();
    setTimeout(() => card.classList.remove('shake'), 400);
    setTimeout(() => error.classList.remove('show'), 2000);
  }
}

// Check if already authenticated this session
(function checkAuth() {
  if (sessionStorage.getItem('pss_auth') === '1') {
    const overlay = document.getElementById('loginOverlay');
    overlay.style.display = 'none';
  } else {
    const input = document.getElementById('loginPassword');
    input.focus();
    input.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') attemptLogin();
    });
  }
})();

// ===== Number to Words (Indian system) =====
const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine','Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];

function twoDigitWords(n) {
  if (n < 20) return ones[n];
  return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
}

function threeDigitWords(n) {
  if (n === 0) return '';
  const h = Math.floor(n / 100), r = n % 100;
  let s = '';
  if (h) { s += ones[h] + ' Hundred'; if (r) s += ' '; }
  if (r) s += twoDigitWords(r);
  return s;
}

function numberToWords(num) {
  if (num === 0) return 'Zero Rupees Only';
  const intPart = Math.floor(num);
  let w = '';
  const cr = Math.floor(intPart / 10000000);
  const lk = Math.floor((intPart % 10000000) / 100000);
  const th = Math.floor((intPart % 100000) / 1000);
  const rem = intPart % 1000;
  if (cr > 0) w += (cr > 99 ? numberToWordsHelper(cr) : twoDigitWords(cr)) + ' Crore ';
  if (lk > 0) w += twoDigitWords(lk) + ' Lakh ';
  if (th > 0) w += twoDigitWords(th) + ' Thousand ';
  if (rem > 0) w += threeDigitWords(rem);
  w = w.trim();
  if (!w) w = 'Zero';
  return w + ' Rupees Only';
}

// ===== State =====
let selectedName = 'SANJAY SORATHIYA';

// ===== Chip Selection =====
document.querySelectorAll('.chip').forEach(chip => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
    chip.classList.add('active');
    selectedName = chip.dataset.name;
    updatePreview();
  });
});

// ===== Live preview on input =====
['companyName','billDate','billMonth','guardQty','guardRate','bouncerQty','bouncerRate','remarks'].forEach(id => {
  const el = document.getElementById(id);
  if (el) el.addEventListener('input', updatePreview);
});

const signCheckbox = document.getElementById('includeSign');
if (signCheckbox) {
  signCheckbox.addEventListener('change', updatePreview);
}

function toggleSignature() {
  const cb = document.getElementById('includeSign');
  if (cb) {
    cb.checked = !cb.checked;
    updatePreview();
  }
}

// ===== Format date as DD/MM/YYYY =====
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return dd + '/' + mm + '/' + yyyy;
}

// ===== Format number with commas (Indian) =====
function formatAmount(n) {
  if (isNaN(n) || n === 0) return '';
  const s = n.toString();
  let result = '';
  const len = s.length;
  if (len <= 3) return s;
  result = s.substring(len - 3);
  let remaining = s.substring(0, len - 3);
  while (remaining.length > 2) {
    result = remaining.substring(remaining.length - 2) + ',' + result;
    remaining = remaining.substring(0, remaining.length - 2);
  }
  if (remaining.length > 0) result = remaining + ',' + result;
  return result;
}

// ===== Generate bill HTML =====
function generateBillHTML() {
  const company = document.getElementById('companyName').value.trim();
  const dateVal = document.getElementById('billDate').value;
  const month = document.getElementById('billMonth').value;
  const guardQty = parseInt(document.getElementById('guardQty').value) || 0;
  const guardRate = parseInt(document.getElementById('guardRate').value) || 0;
  const bouncerQty = parseInt(document.getElementById('bouncerQty')?.value) || 0;
  const bouncerRate = parseInt(document.getElementById('bouncerRate')?.value) || 0;
  const remarks = document.getElementById('remarks').value.trim();
  const guardAmount = guardQty * guardRate;
  const bouncerAmount = bouncerQty * bouncerRate;
  const total = guardAmount + bouncerAmount;
  const dateFormatted = formatDate(dateVal);

  const includeSign = document.getElementById('includeSign')?.checked || false;

  // Build 4 empty rows after the 2 data rows
  let emptyRows = '';
  for (let i = 0; i < 4; i++) {
    emptyRows += '<tr class="empty-row"><td></td><td></td><td></td><td></td><td></td></tr>';
  }

  return `
    <div class="bill-name">${selectedName}</div>

    <table class="bill-info-table">
      <tr>
        <td class="ms-cell">
          <span class="label-bold">MS.</span> ${company}
        </td>
        <td class="date-cell" style="padding:0">
          <table class="date-inner-table">
            <tr>
              <td class="date-label-cell"><span class="label-bold">DATE</span></td>
              <td class="date-val-cell">${dateFormatted}</td>
            </tr>
            <tr>
              <td class="date-label-cell"><span class="label-bold">BILL OF THE<br>MONTH</span></td>
              <td class="date-val-cell">${month || ''}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <div class="bill-subject">SUB :- SECURITY GUARD</div>

    <table class="bill-table">
      <thead>
        <tr>
          <th class="col-sr">SR.NO.</th>
          <th class="col-particular">PARTICULAR</th>
          <th class="col-qty">QTY</th>
          <th class="col-rate">RATE</th>
          <th class="col-amount">AMOUNT</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>1</td>
          <td class="text-left">Security Guard</td>
          <td>${guardQty || ''}</td>
          <td>${guardRate ? formatAmount(guardRate) : ''}</td>
          <td>${guardAmount ? formatAmount(guardAmount) : ''}</td>
        </tr>
        <tr>
          <td>2</td>
          <td class="text-left">Bouncer</td>
          <td>${bouncerQty || ''}</td>
          <td>${bouncerRate ? formatAmount(bouncerRate) : ''}</td>
          <td>${bouncerAmount ? formatAmount(bouncerAmount) : ''}</td>
        </tr>
        ${emptyRows}
        <tr class="total-row">
          <td colspan="4" class="text-right">TOTAL</td>
          <td>${total ? formatAmount(total) : ''}</td>
        </tr>
      </tbody>
    </table>

    <table class="bill-words">
      <tr>
        <td>
          <span class="words-label">(Rs. In Words)</span> ${total ? numberToWords(total) : '..............................................'}
        </td>
      </tr>
    </table>

    <table class="bill-signature">
      <tr>
        <td class="sign-td" onclick="toggleSignature()" title="Click to toggle signature">
          <div class="sign-container">
            ${includeSign ? `<img src="new1.png" alt="Authorised Signature" class="sign-img">` : ''}
            <div class="sign-text">Authorised Sign</div>
          </div>
        </td>
      </tr>
    </table>

    <div class="bill-remarks">Remarks :- ${remarks}</div>
  `;
}

// ===== Update Preview =====
function updatePreview() {
  document.getElementById('billPreview').innerHTML = generateBillHTML();
}

// ===== Print =====
function printBill() {
  const origTitle = document.title;
  document.title = ' ';
  document.getElementById('billPrint').innerHTML = generateBillHTML();
  setTimeout(() => {
    window.print();
    setTimeout(() => {
      document.title = origTitle;
    }, 1000);
  }, 200);
}

// ===== Download as PDF =====
function downloadBill() {
  const company = document.getElementById('companyName').value.trim() || 'Bill';
  const monthSelect = document.getElementById('billMonth');
  const monthText = monthSelect.options[monthSelect.selectedIndex].text || '';
  const dateVal = document.getElementById('billDate').value;
  const year = dateVal ? new Date(dateVal).getFullYear() : new Date().getFullYear();
  const filename = company + '_' + monthText + year;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>${filename}</title>
      <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Playfair+Display:wght@700;800;900&display=swap" rel="stylesheet">
      <style>
        * { margin:0; padding:0; box-sizing:border-box; }
        @page { size: A4 portrait; margin: 0; }
        html, body { background:#fff; margin:0; padding:0; width:100%; height:100%; overflow:hidden; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
        .bill-page { width:210mm; max-width:210mm; min-height:297mm; box-sizing:border-box; background:#fff; color:#000; padding:12mm 15mm 10mm; font-family:'Inter',Arial,sans-serif; font-size:11pt; margin:0 auto; }
        .bill-name{text-align:center;font-family:'Playfair Display',Georgia,serif;font-size:24pt;font-weight:800;letter-spacing:.04em;color:#1a1a3e;margin-bottom:22px;text-transform:uppercase}
        .bill-info-table{width:100%;border-collapse:collapse}
        .bill-info-table td{border:1.5px solid #000;padding:10px 12px;vertical-align:top;font-size:11pt}
        .ms-cell{width:55%;min-height:44px}
        .date-cell{width:45%}
        .label-bold{font-weight:700;font-size:11.5pt}
        .date-inner-table{width:100%;border-collapse:collapse}
        .date-inner-table td{padding:9px 12px;font-size:11pt;vertical-align:middle;border:none}
        .date-inner-table tr+tr td{border-top:1.5px solid #000}
        .date-label-cell{border-right:1.5px solid #000 !important;white-space:nowrap;font-weight:700;width:1%;padding-right:8px}
        .date-val-cell{padding-left:14px;font-size:11.5pt;font-weight:600}
        .bill-subject{background:#fff;border:1.5px solid #000;border-top:none;padding:8px 12px;font-weight:700;font-size:11.5pt}
        .bill-table{width:100%;border-collapse:collapse}
        .bill-table th,.bill-table td{border:1.5px solid #000;padding:9px 10px;text-align:center;font-size:11pt}
        .bill-table thead{background:#fff}
        .bill-table th{font-weight:700;text-transform:uppercase}
        .col-sr{width:10%}.col-particular{width:35%}.col-qty{width:12%}.col-rate{width:18%}.col-amount{width:25%}
        .text-left{text-align:left!important}.text-right{text-align:right!important}
        .empty-row td{height:44px}
        .total-row td{font-weight:700;font-size:11.5pt;border-top:2px solid #000;padding:10px 10px}
        .bill-words{width:100%;border-collapse:collapse}
        .bill-words td{border:1.5px solid #000;padding:12px 14px;font-size:11pt}
        .words-label{font-weight:700;font-size:11pt}
        .bill-signature{width:100%;border-collapse:collapse}
        .bill-signature td{border:1.5px solid #000;padding:10px 16px 14px;font-size:11pt;vertical-align:bottom;height:85px}
        .sign-container{display:flex;flex-direction:column;align-items:flex-end;justify-content:flex-end;width:100%;height:100%}
        .sign-img{max-height:60px;max-width:150px;object-fit:contain;margin-bottom:-10px;margin-right:8px;mix-blend-mode:multiply;display:block}
        .sign-text{text-align:right;font-weight:700;font-style:italic}
        .bill-remarks{margin-top:10px;font-weight:700;font-size:11pt}
      </style>
    </head>
    <body>
      <div class="bill-page">${generateBillHTML()}</div>
      <script>
        window.onload = function() {
          setTimeout(function() { window.print(); }, 500);
        };
      <\/script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

// ===== Initial render =====
updatePreview();
