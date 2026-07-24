export const reminderEmailTemplate = ({
  userName,
  subscriptionName,
  renewalDate,
  amount,
  currency,
  daysLeft,
}) => `
<!DOCTYPE html>
<html>
  <body style="font-family: Arial, sans-serif; background-color: #f4f4f7; padding: 24px;">
    <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 8px; padding: 24px;">
      <h2 style="color: #4f46e5;">Hi ${userName},</h2>
      <p style="font-size: 15px; color: #333;">
        This is a friendly reminder that your <strong>${subscriptionName}</strong> subscription
        is renewing <strong>${daysLeft === 0 ? "today" : `in ${daysLeft} day${daysLeft === 1 ? "" : "s"}`}</strong>.
      </p>
      <table style="width: 100%; margin: 16px 0; font-size: 14px; color: #333;">
        <tr>
          <td style="padding: 4px 0;">Renewal Date</td>
          <td style="padding: 4px 0; text-align: right;"><strong>${renewalDate}</strong></td>
        </tr>
        <tr>
          <td style="padding: 4px 0;">Amount</td>
          <td style="padding: 4px 0; text-align: right;"><strong>${amount} ${currency}</strong></td>
        </tr>
      </table>
      <p style="font-size: 14px; color: #666;">
        If you no longer need this subscription, remember to cancel it before the renewal date.
      </p>
      <p style="font-size: 14px; color: #666;">Thanks for using <strong>SubTrackt</strong>!</p>
    </div>
  </body>
</html>
`;
