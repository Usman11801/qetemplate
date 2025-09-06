import Stripe from 'stripe';
import { buffer } from 'micro';
import { db } from '../src/firebase'; // Adjust the path to your firebase.js
import { doc, updateDoc } from 'firebase/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

// This is critical for Vercel serverless functions
export const config = {
  api: {
    bodyParser: false, // Don't parse the body - needed for webhook verification
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const buf = await buffer(req);
  const signature = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(
      buf,
      signature,
      webhookSecret
    );
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('PaymentIntent was successful!', paymentIntent.id);
      break;
    case 'invoice.paid':
      const invoice = event.data.object;
      console.log('Invoice was paid', invoice.id);
      break;
    case 'customer.subscription.created':
      const subscription = event.data.object;
      console.log('Subscription created:', subscription.id);
      try {
        const customerId = subscription.customer;
        // Find the user in Firebase by stripeCustomerId
        const userQuery = await db.collection('users').where('stripeCustomerId', '==', customerId).get();
        if (!userQuery.empty) {
          const userDoc = userQuery.docs[0];
          await updateDoc(doc(db, 'users', userDoc.id), {
            subscriptionId: subscription.id,
            subscriptionStatus: subscription.status, // e.g., "active"
          });
          console.log(`Updated subscription for user: ${userDoc.id}`);
        }
      } catch (err) {
        console.error('Error updating subscription in Firebase:', err);
      }
      break;
    case 'customer.subscription.updated':
      const updatedSubscription = event.data.object;
      console.log('Subscription updated:', updatedSubscription.id);
      try {
        const customerId = updatedSubscription.customer;
        const userQuery = await db.collection('users').where('stripeCustomerId', '==', customerId).get();
        if (!userQuery.empty) {
          const userDoc = userQuery.docs[0];
          await updateDoc(doc(db, 'users', userDoc.id), {
            subscriptionStatus: updatedSubscription.status, // e.g., "past_due"
          });
          console.log(`Updated subscription status for user: ${userDoc.id}`);
        }
      } catch (err) {
        console.error('Error updating subscription status in Firebase:', err);
      }
      break;
    case 'customer.subscription.deleted':
      const cancelledSubscription = event.data.object;
      console.log('Subscription cancelled:', cancelledSubscription.id);
      try {
        const customerId = cancelledSubscription.customer;
        const userQuery = await db.collection('users').where('stripeCustomerId', '==', customerId).get();
        if (!userQuery.empty) {
          const userDoc = userQuery.docs[0];
          await updateDoc(doc(db, 'users', userDoc.id), {
            subscriptionStatus: 'canceled',
          });
          console.log(`Cancelled subscription for user: ${userDoc.id}`);
        }
      } catch (err) {
        console.error('Error cancelling subscription in Firebase:', err);
      }
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.status(200).json({ received: true });
}