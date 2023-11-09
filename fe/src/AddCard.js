import React from 'react';
import AddCard from './AddCard'; // Import component AddCard

function AddCardPage(props) {
  const { stripePromise } = props;

  return (
    <div>
      <h1>Add Card</h1>
      <AddCard stripePromise={stripePromise} />
    </div>
  );
}

export default AddCardPage;
