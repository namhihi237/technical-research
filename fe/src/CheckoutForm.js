import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);

  const handleSubnmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);

    const { token, error } = await stripe.createToken(cardElement);

    if (error) {
      setError(error.message);
    } else {
      console.log(token);
      handleCardAdded(token);
    }
  };


  const handleCardAdded = (token) => {
    fetch('http://localhost:4242/stripe/add-card', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    })
      .then((response) => response.json())
      .then((data) => {
        console.log('Customer created successfully:', data);
      })
      .catch((error) => {
        console.error('Error creating customer:', error);
      });
  };


  return (
    <form onSubmit={handleSubnmit}>
      <CardElement id="card-element" />
      <button type="submit" disabled={!stripe}>
        Add card
      </button>
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </form>
  );
};

export default CheckoutForm;
