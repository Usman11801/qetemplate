import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { ChevronLeft, Check, Shield, Star, Clock, Bot } from "lucide-react";
import { auth } from "../firebase"; // Adjust the path to your firebase.js

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const CheckoutForm = ({ onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  // Get the current user's ID
  const user = auth.currentUser;

  useEffect(() => {
    const fetchClientSecret = async () => {
      if (!user) {
        setError("You must be logged in to make a payment.");
        return;
      }

      try {
        const response = await fetch("/api/create-subscription", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentMethodId: null,
            email,
            customerId: null,
            userId: user.uid,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || `HTTP error! Status: ${response.status}`
          );
        }

        const data = await response.json();
        if (data.clientSecret) {
          setClientSecret(data.clientSecret);
        } else {
          throw new Error(
            "Failed to get client secret: No clientSecret in response"
          );
        }
      } catch (err) {
        setError(`Error initializing payment: ${err.message}`);
        console.error(err);
      }
    };

    const debounceFetch = setTimeout(() => {
      if (email) fetchClientSecret();
    }, 500);

    return () => clearTimeout(debounceFetch);
  }, [email, user]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { error: stripeError, paymentIntent } =
        await stripe.confirmCardPayment(clientSecret, {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: { name, email },
          },
        });

      if (stripeError) {
        setError(stripeError.message);
      } else if (paymentIntent.status === "succeeded") {
        onSuccess();
        // Optionally store subscriptionId or customerId in your database (handled by webhook)
      }
    } catch (err) {
      setError("An unexpected error occurred.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      <div className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Name
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="John Doe"
            required
          />
        </div>
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="john@example.com"
            required
          />
        </div>
        <div>
          <label
            htmlFor="card"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Card Details
          </label>
          <div className="p-4 border border-gray-300 rounded-lg focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: "16px",
                    color: "#424770",
                    "::placeholder": {
                      color: "#aab7c4",
                    },
                  },
                  invalid: {
                    color: "#9e2146",
                  },
                },
              }}
            />
          </div>
          <div className="mt-1 flex items-center">
            <Shield className="h-4 w-4 text-gray-500 mr-1" />
            <span className="text-xs text-gray-500">
              Your payment information is secure and encrypted
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          {error}
        </div>
      )}

      <div className="pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={!stripe || loading || !clientSecret}
          className={`w-full px-6 py-3 rounded-lg font-medium text-white flex items-center justify-center gap-2 transition-all
            ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:shadow-lg transform hover:-translate-y-1"
            }`}
        >
          {loading ? (
            <>
              <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
              <span>Processing...</span>
            </>
          ) : (
            <>
              <span>Subscribe Now</span>
              <span className="ml-1">•</span>
              <span>$9.99/month</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
};

const PaymentPage = () => {
  const [paymentComplete, setPaymentComplete] = useState(false);
  const navigate = useNavigate();

  const handlePaymentSuccess = () => {
    setPaymentComplete(true);
    navigate("/payment-success");
  };

  const handleBackClick = () => {
    navigate(-1);
  };

  if (paymentComplete) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <Check className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          <p className="text-gray-600 mb-6">
            You are now a premium member. Enjoy unlimited features!
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-4xl mx-auto px-4 py-12">
        <button
          onClick={handleBackClick}
          className="mb-6 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
        >
          <ChevronLeft size={20} />
          <span>Back</span>
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column - Payment Details */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Upgrade to Premium
              </h1>
              <p className="text-gray-600 mb-6">
                Unlock unlimited counting and premium features.
              </p>

              <Elements stripe={stripePromise}>
                <CheckoutForm onSuccess={handlePaymentSuccess} />
              </Elements>
            </div>
          </div>

          {/* Right Column - Features & 3D Elements */}
          <div>
            {/* 3D-like Premium Card */}
            <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-xl mb-6 transform hover:rotate-1 transition-transform duration-300">
              <div className="absolute inset-1 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg shadow-inner"></div>
              <div className="relative p-6 text-white">
                <div className="flex items-center justify-between mb-8">
                  <Star className="h-10 w-10 text-yellow-300 filter drop-shadow-md" />
                  <div className="text-right">
                    <div className="text-sm opacity-80">Premium Plan</div>
                    <div className="text-xl font-bold">$9.99/month</div>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="text-xl font-bold mb-4">Unlimited Access</div>
                  <div className="space-y-3">
                    {[
                      "Unlimited Counter Usage",
                      "Priority Support",
                      "Advanced Analytics",
                    ].map((feature, i) => (
                      <div key={i} className="flex items-center">
                        <div className="flex-shrink-0 h-5 w-5 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                          <Check className="h-3 w-3 text-white" />
                        </div>
                        <span className="text-white text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="mt-6 relative">
                  <div className="absolute inset-0 bg-black bg-opacity-20 rounded-lg transform translate-y-1"></div>
                  <div className="relative bg-white bg-opacity-10 text-white text-center py-2 rounded-lg backdrop-filter backdrop-blur-sm border border-white border-opacity-20">
                    Premium Member
                  </div>
                </div>
              </div>
            </div>

            {/* Features List */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                What You Get
              </h2>
              <div className="space-y-4">
                <div className="flex">
                  <div className="flex-shrink-0 mr-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-indigo-100 text-indigo-600">
                      <Bot size={20} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-md font-medium text-gray-900">
                      AI-Powered Insights
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Get intelligent analysis and suggestions based on your
                      counting patterns.
                    </p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0 mr-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-green-100 text-green-600">
                      <Check size={20} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-md font-medium text-gray-900">
                      Unlimited Counting
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Remove all limits and count as high as you want, with no
                      restrictions.
                    </p>
                  </div>
                </div>
                <div className="flex">
                  <div className="flex-shrink-0 mr-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100 text-yellow-600">
                      <Clock size={20} />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-md font-medium text-gray-900">
                      Priority Support
                    </h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Get faster responses and dedicated assistance whenever you
                      need help.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-start">
                  <Shield className="h-5 w-5 text-blue-500 mt-0.5 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      100% Secure Checkout
                    </h3>
                    <p className="text-xs text-gray-600 mt-1">
                      Your payment information is fully encrypted and never
                      stored on our servers.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
