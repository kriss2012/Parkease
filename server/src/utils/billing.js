const GST_RATE = () => Number(process.env.GST_RATE || 18);

// Base charge from the mall's hourly rate x planned duration
const calcBaseAmount = (hourlyRate, durationHours) => {
  return Math.round(hourlyRate * durationHours * 100) / 100;
};

// Extra charge if the vehicle stays past the planned exit time
// Billed in full-hour blocks, using the same hourly rate
const calcLateExitCharges = (hourlyRate, plannedExit, actualExit) => {
  const diffMs = new Date(actualExit) - new Date(plannedExit);
  if (diffMs <= 0) return 0;
  const lateHours = Math.ceil(diffMs / (1000 * 60 * 60));
  return Math.round(hourlyRate * lateHours * 1.5 * 100) / 100; // 1.5x penalty rate
};

// Final invoice for a completed booking
const generateInvoice = ({ hourlyRate, durationHours, plannedExit, actualExit, extraCharges = 0 }) => {
  const baseAmount = calcBaseAmount(hourlyRate, durationHours);
  const lateExitCharges = calcLateExitCharges(hourlyRate, plannedExit, actualExit);
  const subTotal = baseAmount + lateExitCharges + extraCharges;
  const gst = Math.round(subTotal * (GST_RATE() / 100) * 100) / 100;
  const totalAmount = Math.round((subTotal + gst) * 100) / 100;

  return { baseAmount, lateExitCharges, extraCharges, gst, totalAmount };
};

module.exports = { calcBaseAmount, calcLateExitCharges, generateInvoice };
