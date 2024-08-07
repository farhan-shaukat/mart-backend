"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

const CartDetail = ({
  isOpen,
  closeModal,
  carts,
  products,
  setProducts,
  handleDelete,
  setCart,
}) => {
  const router = useRouter();
  const [cartItems, setCartItems] = useState(carts || []);
  const [isModalOpen, setIsModalOpen] = useState(isOpen);

  useEffect(() => {
    setIsModalOpen(isOpen);
  }, [isOpen]);

  useEffect(() => {
    setCartItems(carts);
  }, [carts]);

  useEffect(() => {
    if ( !cartItems || cartItems.length === 0) {
      closeModal();
    }
  }, [cartItems, closeModal]);

  const totalBill = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
  };

  const updateProductQuantity = (id, change) => {
    // Find the product and its current quantity
    const product = products.find((p) => p.id === id);
    if (!product) return; // Exit if product is not found

    // Get the product's available quantity
    const productQuantity = product.quantity;

    // Update the cart items
    const updatedCart = cartItems
      .map((item) => {
        if (item.id === id) {
          const newQuantity = item.quantity + change;
          // Ensure new quantity is within valid range
          if (
            newQuantity >= productQuantity ||
            newQuantity <= productQuantity
          ) {
            return { ...item, quantity: newQuantity };
          } else if (newQuantity <= 0) {
            return null; // Remove item if quantity is zero or negative
          }
        }
        return item;
      })
      .filter((item) => item.quantity > 0);

    // Update the product quantities
    const updatedProducts = products.map((p) => {
      if (p.id === id && p.quantity >= 0) {
        const newProductQuantity = p.quantity - change;
        if (productQuantity <= productQuantity) {
          return { ...p, quantity: newProductQuantity };
        }
      }
      return p;
    });

    // Update localStorage with the updated cart
    window.localStorage.setItem("cart", JSON.stringify(updatedCart));

    // Update the state or context with new cart and products
    setCart(updatedCart);
    setProducts(updatedProducts);
  };

  return isModalOpen ? (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 max-w-4xl mx-auto rounded-lg">
        <h1 className="text-3xl font-bold mb-6 text-center">Cart Items</h1>
        {cartItems.length > 0 ? (
          <ul className="space-y-4">
            {cartItems.map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-center p-4 border border-gray-300 rounded-lg shadow-sm"
              >
                <div>
                  <span className="font-semibold text-lg">{item.name}</span>
                  <div className="text-sm text-gray-600">
                    <span>Quantity: {item.quantity}</span>
                    <button
                      onClick={() => updateProductQuantity(item.id, 1)}
                      className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 ml-2"
                      disabled={
                        products.find((p) => p.id === item.id).quantity === 0
                      }
                    >
                      +
                    </button>
                    <button
                      onClick={() => updateProductQuantity(item.id, -1)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 ml-2"
                      disabled={item.quantity === 0}
                    >
                      -
                    </button>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <span className="text-lg font-semibold">{item.price} Rs</span>
                  <span className="text-lg font-semibold">
                    {item.quantity * item.price} Rs
                  </span>
                  <Button
                    onClick={() => handleDelete(item.quantity, item.id)}
                    variant="outline"
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-center text-gray-600 mt-4">
            No items in the cart.
          </p>
        )}
        <div className="mt-6 font-bold text-xl flex justify-between items-center m-4 space-x-5">
          <Button
            variant="outline"
            onClick={closeModal}
          >
            Add More Items
          </Button>

          <Button
            variant = "outline"
            onClick={()=>{
              router.push("/register")
            }}
          >
            Check Out
          </Button>

          <span>Total Bill: {totalBill()} Rs</span>
        </div>
      </div>
    </div>
  ) : null;
};

export default CartDetail;