const statusFlow = {
  pending: ["paid"],
  paid: ["processed"],
  processed: ["shipped"],
  shipped: ["out-for-delivery"],
  "out-for-delivery": ["delivered"],
  delivered: []
};

exports.isValidStatusUpdate = (current, next) => {
  return statusFlow[current]?.includes(next);
};
