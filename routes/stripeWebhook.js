const stripeWebhook = require("./controllers/stripeWebhook");

app.post(
  "/webhook",
  require("body-parser").raw({ type: "application/json" }),
  stripeWebhook.handleWebhook
);
