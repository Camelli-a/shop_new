import { createContext } from 'react';
import cartService from '../services/cartService';
import goodService from '../services/goodService';
import orderService from '../services/orderService';

// Create a new context
const ServiceContext = createContext();

// Create a provider component
const ServiceProvider = ({ children }) => {
  // Define the state and functions here
  const value = {
    cart: cartService,
    good: goodService,
    order: orderService,
  }
  return (
    <ServiceContext.Provider value={value}>
      {children}
    </ServiceContext.Provider>
  );
};

export { ServiceContext, ServiceProvider };
