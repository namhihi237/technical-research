import React from 'react';
import { Elements } from '@stripe/react-stripe-js';
import CheckoutForm from './CheckoutForm';

function AddCard(props) {
  const { stripePromise } = props;
  return (
    <>
      <h1>Add Card</h1>
      {stripePromise && (
        <Elements stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      )}
    </>
  );
}

export default AddCard;
