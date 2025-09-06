import Stripe from 'stripe';
import { db } from '../src/firebase';
import { doc, updateDoc } from 'firebase/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  console.log('Request received:', req.method, req.body);

  const { paymentMethodId, email, customerId, userId } = req.body;

  if (!userId) {
    console.log('Error: userId is missing');
    return res.status(400).json({ error: 'userId is required' });
  }

  try {
    console.log('Creating or retrieving customer...');
    let customer;
    if (!customerId) {
      customer = await stripe.customers.create({
        email: email,
      });
      console.log('Customer created:', customer.id);

      console.log('Updating Firebase with customer ID...');
      await updateDoc(doc(db, 'users', userId), {
        stripeCustomerId: customer.id,
      });
      console.log('Firebase updated successfully');
    } else {
      customer = await stripe.customers.retrieve(customerId);
      console.log('Customer retrieved:', customer.id);
    }

    console.log('Creating subscription with price:', process.env.STRIPE_PRICE_ID);
    const subscription = await stripe.subscriptions.create({
      customer: customer.id,
      items: [{ price: process.env.STRIPE_PRICE_ID }],
      payment_behavior: 'default_incomplete',
      expand: ['latest_invoice.payment_intent'],
    });
    console.log('Subscription created:', subscription.id);

    res.status(200).json({
      subscriptionId: subscription.id,
      clientSecret: subscription.latest_invoice.payment_intent.client_secret,
      customerId: customer.id,
    });
  } catch (err) {
    console.error('Error creating subscription:', err.message, err.stack);
    res.status(500).json({ error: err.message });
  }
}
