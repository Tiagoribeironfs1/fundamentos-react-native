import React, {
  createContext,
  useState,
  useCallback,
  useContext,
  useEffect,
} from 'react';

import AsyncStorage from '@react-native-community/async-storage';
import { Alert } from 'react-native';

interface Product {
  id: string;
  title: string;
  image_url: string;
  price: number;
  quantity: number;
}

interface CartContext {
  products: Product[];
  addToCart(item: Omit<Product, 'quantity'>): void;
  increment(id: string): void;
  decrement(id: string): void;
}

const CartContext = createContext<CartContext | null>(null);

const CartProvider: React.FC = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadProducts(): Promise<void> {
      // TODO LOAD ITEMS FROM ASYNC STORAGE
      const productsStorage = await AsyncStorage.getItem(
        '@GoMarketplace:products',
      );

      if (productsStorage) {
        setProducts([...JSON.parse(productsStorage)]);
      }
    }
    loadProducts();
  }, []);

  const addToCart = useCallback(
    async product => {
      // TODO ADD A NEW ITEM TO THE CART
      const isProducts = products.find(item => item.id === product.id);
      const productTest = [...products, { ...product, quantity: 1 }];
      console.log(productTest);

      const productsMap = isProducts
        ? products.map(item =>
            item.id === product.id
              ? { ...product, quantity: item.quantity + 1 }
              : item,
          )
        : [...products, { ...product, quantity: 1 }];

      setProducts(productsMap);
      console.log(productsMap);

      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(productsMap),
      );
    },
    [products],
  );

  const increment = useCallback(
    async id => {
      // TODO INCREMENTS A PRODUCT QUANTITY IN THE CART
      console.log('Incremento');
      const productsMap = products.map(item =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item,
      );
      setProducts(productsMap);
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(productsMap),
      );
    },
    [products],
  );

  const decrement = useCallback(
    async id => {
      // TODO DECREMENTS A PRODUCT QUANTITY IN THE CART
      console.log('Decremento');
      const productsMap = products.map(item =>
        item.id === id ? { ...item, quantity: item.quantity - 1 } : item,
      );

      const productsM = productsMap.filter(item => item.quantity !== 0);

      setProducts(productsM);
      await AsyncStorage.setItem(
        '@GoMarketplace:products',
        JSON.stringify(productsM),
      );
    },
    [products],
  );

  const value = React.useMemo(
    () => ({ addToCart, increment, decrement, products }),
    [products, addToCart, increment, decrement],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

function useCart(): CartContext {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error(`useCart must be used within a CartProvider`);
  }

  return context;
}

export { CartProvider, useCart };
