import { formatHours, formatCurrency } from "@/lib/time-tracking"
import type { InvoiceSummary } from "@/lib/time-tracking"

export function buildInvoiceHtml(params: {
  summary: InvoiceSummary
  start: string
  end: string
  invoiceNumber: string
  invoiceDate: string
  invoiceDueDate: string
  user: {
    address?: string
    mobile?: string
    email?: string
    billing_email?: string | null
    abn?: string
    account_number?: string
    bsb?: string
  } | null
  company: {
    name?: string
    address?: string
    email?: string
    abn?: string
  } | null
  chargeGst: boolean
  gstAmount: number
}): string {
  const {
    summary,
    start,
    end,
    invoiceNumber,
    invoiceDate,
    invoiceDueDate,
    user,
    company,
    chargeGst,
    gstAmount,
  } = params

  const subtotal = summary.totalAmount
  const gstRate = chargeGst ? gstAmount / 100 : 0
  const gst = chargeGst
    ? Math.round(subtotal * gstRate * 100) / 100
    : 0
  const total = chargeGst
    ? Math.round((subtotal + gst) * 100) / 100
    : Math.round(subtotal * 100) / 100

  const billFromEmail =
    (user?.billing_email && String(user.billing_email).trim()) ||
    user?.email ||
    "—"

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Invoice</title></head>
<body style="font-family:system-ui,sans-serif;padding:2rem;max-width:600px;margin:0 auto">
  <h1>Invoice</h1>
  <div style="margin-bottom:1.5rem">
    <p><strong>Invoice number:</strong> ${invoiceNumber}</p>
    <p><strong>Invoice date:</strong> ${invoiceDate}</p>
    <p><strong>Invoice due date:</strong> ${invoiceDueDate}</p>
    <p><strong>Invoice due amount:</strong> ${formatCurrency(total)}</p>
  </div>
  <div style="display:flex;gap:3rem;margin-bottom:1.5rem;flex-wrap:wrap">
    <div>
      <h3 style="margin:0 0 0.5rem 0;font-size:0.9rem">Bill from (User)</h3>
      <p style="margin:0.25rem 0"><strong>Address:</strong> ${user?.address ?? "—"}</p>
      <p style="margin:0.25rem 0"><strong>Mobile:</strong> ${user?.mobile ?? "—"}</p>
      <p style="margin:0.25rem 0"><strong>Email:</strong> ${billFromEmail}</p>
      <p style="margin:0.25rem 0"><strong>ABN:</strong> ${user?.abn ?? "—"}</p>
      <p style="margin:0.25rem 0"><strong>Account number:</strong> ${user?.account_number ?? "—"}</p>
      <p style="margin:0.25rem 0"><strong>BSB:</strong> ${user?.bsb ?? "—"}</p>
    </div>
    <div>
      <h3 style="margin:0 0 0.5rem 0;font-size:0.9rem">Bill to (Company)</h3>
      <p style="margin:0.25rem 0"><strong>Company name:</strong> ${company?.name ?? "—"}</p>
      <p style="margin:0.25rem 0"><strong>Address:</strong> ${company?.address ?? "—"}</p>
      <p style="margin:0.25rem 0"><strong>Email:</strong> ${company?.email ?? "—"}</p>
      <p style="margin:0.25rem 0"><strong>ABN:</strong> ${company?.abn ?? "—"}</p>
    </div>
  </div>
  <p style="margin-bottom:0.5rem"><strong>Date range:</strong> ${start} to ${end}</p>
  <table style="width:100%;border-collapse:collapse;margin-top:1rem">
    <thead>
      <tr style="border-bottom:1px solid #ccc">
        <th style="text-align:start;padding:0.5rem">Project</th>
        <th style="text-align:start;padding:0.5rem">Rate</th>
        <th style="text-align:start;padding:0.5rem">Hours</th>
        <th style="text-align:end;padding:0.5rem">Amount</th>
      </tr>
    </thead>
    <tbody>
      ${summary.lines
        .map(
          (l) =>
            `<tr style="border-bottom:1px solid #eee">
        <td style="padding:0.5rem">${l.projectName}</td>
        <td style="padding:0.5rem">${formatCurrency(l.hourlyRate)}/hr</td>
        <td style="padding:0.5rem">${formatHours(l.hours)}</td>
        <td style="padding:0.5rem;text-align:end">${formatCurrency(l.amount)}</td>
      </tr>`
        )
        .join("")}
    </tbody>
    <tfoot>
      <tr style="border-top:1px solid #ccc">
        <td colspan="2" style="padding:0.5rem">Subtotal</td>
        <td style="padding:0.5rem">${formatHours(summary.totalHours)}</td>
        <td style="padding:0.5rem;text-align:end">${formatCurrency(subtotal)}</td>
      </tr>
      ${chargeGst ? `
      <tr>
        <td colspan="2" style="padding:0.5rem">GST (${gstAmount}%)</td>
        <td style="padding:0.5rem"></td>
        <td style="padding:0.5rem;text-align:end">${formatCurrency(gst)}</td>
      </tr>
      ` : ""}
      <tr style="border-top:2px solid #000;font-weight:600">
        <td colspan="2" style="padding:0.5rem">Total</td>
        <td style="padding:0.5rem">${formatHours(summary.totalHours)}</td>
        <td style="padding:0.5rem;text-align:end">${formatCurrency(total)}</td>
      </tr>
    </tfoot>
  </table>
</body>
</html>`
}

export function openInvoicePdf(
  html: string,
  options?: { printAndClose?: boolean }
) {
  const w = window.open("", "_blank")
  if (w) {
    w.document.write(html)
    w.document.close()
    w.focus()
    if (options?.printAndClose) {
      w.print()
      w.close()
    }
  }
}
