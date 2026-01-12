import Loan from "../models/loan.js";
import EMI from "../models/emi.js";

export const unifiedLoanDashboard = async (req, res) => {
  const userId = req.user.id;
  try {
    const borrowedLoans = await Loan.find({ borrower: userId })
      .populate("lender", "username")
      .populate("offers.lender", "username phone")
      .lean();

    const borrowedEmis = await EMI.find({ borrower: userId }).lean();

    const lentLoans = await Loan.find({ lender: userId })
      .populate("borrower", "username phone")
      .lean();

    const lentEmis = await EMI.find({ lender: userId }).lean();

    const borrowerDashboard = borrowedLoans.map(loan => {
      const relatedEmi = borrowedEmis.find(e => e.loan?.toString() === loan._id.toString());
      let currentStatus = loan.status;
      if (relatedEmi && relatedEmi.paidEMIs < relatedEmi.totalEMIs && currentStatus === "Completed") {
        currentStatus = "Active";
      }
      return { ...loan, status: currentStatus, emi: relatedEmi || null };
    });

    const lenderDashboard = lentLoans.map(loan => {
      const relatedEmi = lentEmis.find(e => e.loan?.toString() === loan._id.toString());
      let currentStatus = loan.status;
      if (relatedEmi && relatedEmi.paidEMIs < relatedEmi.totalEMIs && currentStatus === "Completed") {
        currentStatus = "Active";
      }
      return { ...loan, status: currentStatus, emi: relatedEmi || null };
    });

    res.json({
      borrower: { loans: borrowerDashboard },
      lender: {
        loans: lenderDashboard,
        interestEarned: lentEmis.reduce((sum, e) => {
          const principalPerEmi = e.principalAmount ? e.principalAmount / e.totalEMIs : 0;
          const interestPerEmi = e.emiAmount - principalPerEmi;
          return sum + (interestPerEmi * e.paidEMIs);
        }, 0),
      }
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
