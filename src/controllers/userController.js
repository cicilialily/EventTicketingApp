const { getPurchaseHistory } = require('../services/purchaseHistoryService');

async function getUserPurchaseHistory(req, res) {
  if (req.user.id !== req.params.id) {
    return res.status(403).json({ success: false, message: 'You can only view your own purchase history.' });
  }

  const data = await getPurchaseHistory(req.params.id, req.query);
  return res.status(200).json({ success: true, data: { userId: req.params.id, ...data } });
}

module.exports = { getUserPurchaseHistory };
