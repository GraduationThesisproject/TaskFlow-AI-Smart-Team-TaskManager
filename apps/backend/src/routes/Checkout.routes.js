const stripe = require("stripe")("sk_test_51S0u5XQnbFIuhN9UKC4JnYCbkNV8z7e98bBeI6GekB7zynMKHCriJDHLO8x3bjpefaIhG2QMV1VpyLwAXu4FhQKu00xqTpMdX4");

const router = express.Router();

router.post("/create-checkout-session", async (req, res) => {
    const { products } = req.body;
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: req.body.products,
      mode: "payment",
      success_url: "http://localhost:5173/success",
      cancel_url: "http://localhost:5173/cancel",
    });
    res.json({ url: session.url });
  } catch (error) {
    console.error("Error creating checkout session:", error);
    res.status(500).json({ error: "Failed to create checkout session" });
  }
}) ;

module.exports = router;

