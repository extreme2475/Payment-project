import React from "react";
import Card from "./Card.jsx";

// --------- TOP SUMMARY CARDS ---------
export const PaymentMadeCard = ({ count }) => (
  <Card title="Payments Made:-" value={count ?? 0} />
);

export const WalletValueCard = ({ amount }) => (
  <Card title="Wallet Value:-" value={`₹ ${amount ?? 0}`} />
);

export const SuccessRateCard = ({ rate }) => (
  <Card title="Success Rate:-" value={`${rate ?? 0}%`} />
);

export const RecentPaymentCard = ({ payment }) => (
  <Card
    title="Recent Payment:-"
    value={payment ? `₹ ${payment.amount}` : "No recent payment"}
  />
);

// --------- STATIC CARDS ---------
export const SchedulePaymentCard = ({ count }) => (
  <Card title="Scheduled Payments:-" value={`${count ?? 0} Pending`} />
);


export const LoanRequestCard = ({ activeCount }) => (
  <Card title="Loan Requests:-" value={`${activeCount ?? 0} Active`} />
);


export const UpcomingOptionsCard = () => (
  <Card title="Upcoming Features:-" value="Coming Soon 🚀" />
);

// --------- RECENT TRANSACTIONS ---------
export const RecentTransactionCard = ({ transactions }) => (
  <Card title="Recent Transactions">
    {transactions?.length ? (
      <table className="w-full text-sm text-gray-700">
        <thead>
          <tr className="border-b">
            <th className="py-2 text-left">Date</th>
            <th className="py-2 text-left">Details</th>
            <th className="py-2 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((tx) => (
            <tr key={tx._id} className="border-b last:border-none">
              <td className="py-2">
                {new Date(tx.createdAt).toLocaleDateString()}
              </td>
              <td className="py-2">{tx.note}</td>
              <td
                className={`py-2 text-right ${
                  tx.amount < 0 ? "text-red-500" : "text-green-600"
                }`}
              >
                ₹ {Math.abs(tx.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    ) : (
      <p className="text-gray-400 text-sm">No transactions yet</p>
    )}
  </Card>
);
