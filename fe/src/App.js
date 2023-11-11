import './App.css';
import Completion from './Completion'
import AddCard from './AddCard'
import Upload from './Upload';

import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import { loadStripe } from '@stripe/stripe-js';

function App() {
  const [stripePromise, setStripePromise] = useState(null);

  useEffect(() => {
    fetch("http://localhost:4242/stripe/config").then(async (r) => {
      const { publishableKey } = await r.json();
      console.log("publishableKey", publishableKey);
      setStripePromise(loadStripe(publishableKey));
    });
  }, []);

  return (
    <main>
      <BrowserRouter>
        <Routes>
          <Route path="/card" element={<AddCard stripePromise={stripePromise} />} />
          <Route path="/completion" element={<Completion stripePromise={stripePromise} />} />
          <Route path="/upload" element={<Upload />} />
        </Routes>
      </BrowserRouter>
    </main>
  );
}

export default App;