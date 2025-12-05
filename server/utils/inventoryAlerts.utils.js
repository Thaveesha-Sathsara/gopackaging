const { sendEmailAlerts } = require("../config/email.config");

const checkAndSendLowStockAlert = async (item, type) => {
    // Logic: Only send if stock is NOW below minimum (and wasn't already handled, theoretically)
    // For simplicity, we send whenever an adjustment results in low stock.
    
    // Note: Finished Goods might not have a 'minimumLevel' in your schema yet. 
    // If not, default to 10 or check if field exists.
    const minLevel = item.minimumLevel || 10; 

    if (item.currentStock <= minLevel) {
        const subject = `LOW STOCK ALERT: ${item.name}`;
        
        const html = `
            <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #dc2626;">Low Stock Warning</h2>
                <p>The following item has dropped below the minimum threshold.</p>
                
                <table style="width: 100%; text-align: left; border-collapse: collapse; margin-top: 10px;">
                    <tr style="background-color: #f8fafc;">
                        <th style="padding: 8px; border-bottom: 1px solid #ddd;">Item ID</th>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${item.materialID || item.productID}</td>
                    </tr>
                    <tr>
                        <th style="padding: 8px; border-bottom: 1px solid #ddd;">Name</th>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;"><strong>${item.name}</strong></td>
                    </tr>
                    <tr style="background-color: #fff1f2;">
                        <th style="padding: 8px; border-bottom: 1px solid #ddd; color: #dc2626;">Current Stock</th>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd; color: #dc2626; font-weight: bold;">${item.currentStock} ${item.unit}</td>
                    </tr>
                    <tr>
                        <th style="padding: 8px; border-bottom: 1px solid #ddd;">Minimum Level</th>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${minLevel} ${item.unit}</td>
                    </tr>
                    <tr>
                        <th style="padding: 8px; border-bottom: 1px solid #ddd;">Category</th>
                        <td style="padding: 8px; border-bottom: 1px solid #ddd;">${type === 'RawMaterial' ? 'Raw Material' : 'Finished Good'}</td>
                    </tr>
                </table>

                <p style="margin-top: 20px; font-size: 12px; color: #64748b;">
                    Please arrange for procurement or production immediately.
                </p>
                <p style="margin-top: 10px; font-size: 12px; color: #64748b;">
                    This is an automated message from your LCS Enterprises - G.O Packaging Workforce System.
                </p>
            </div>
        `;

        // Send to the boss/manager
        await sendEmailAlerts(process.env.ADMIN_EMAIL, subject, html);
    }
};

module.exports = checkAndSendLowStockAlert;