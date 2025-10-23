import React, { useState } from "react";
import ShowProductModal from "./ShowProductModal";
import { getProductById } from "../services/productService";

/**
 * ProductListItem Component
 * -------------------------
 * Displays a single product row or card.
 * When clicked, it fetches the full product (with populated categories)
 * and opens the ShowProductModal.
 *
 * Props:
 * - productSummary: basic product info (at least _id, name, price, etc.)
 */
export default function ProductListItem({ productSummary }) {
  const [showModal, setShowModal] = useState(false);
  const [fullProduct, setFullProduct] = useState(null);
  const [loading, setLoading] = useState(false);

  // Fetch full product with populated categories, then open modal
  const openShowModal = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      // Fetch full product details
      const prod = await getProductById(productSummary._id, token);

      if (prod) {
        setFullProduct(prod);
      } else {
        // fallback to summary if fetch fails
        setFullProduct(productSummary);
      }

      setShowModal(true);
    } catch (err) {
      console.error("Failed to fetch product for modal:", err);
      setFullProduct(productSummary);
      setShowModal(true);
    } finally {
      setLoading(false);
    }
  };

  // Close modal handler
  const closeModal = () => {
    setShowModal(false);
    setFullProduct(null);
  };

  const imageBase = (p) => `${import.meta.env.VITE_API_URL || ""}${p}`;

  return (
    <>
      {/* Product List Item UI */}
      <div
        className="product-row flex justify-between items-center p-3 border rounded-lg shadow-sm hover:shadow-md cursor-pointer transition-all duration-200"
        onClick={openShowModal}
      >
        <div className="flex items-center gap-3">
          <img
            src={
              productSummary.images && productSummary.images.length
                ? imageBase(productSummary.images[0])
                : "/placeholder.png"
            }
            alt={productSummary.name}
            className="w-12 h-12 object-cover rounded-md"
          />
          <div>
            <h4 className="font-semibold text-gray-800">
              {productSummary.name}
            </h4>
            <p className="text-sm text-gray-500">
              Price: ₹{productSummary.price || "N/A"}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="text-sm text-gray-400">Loading...</div>
        ) : (
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-lg text-sm transition-all"
            onClick={(e) => {
              e.stopPropagation();
              openShowModal();
            }}
          >
            View
          </button>
        )}
      </div>

      {/* Show Modal */}
      {showModal && fullProduct && (
        <ShowProductModal
          product={fullProduct}
          onClose={closeModal}
          imageBase={imageBase}
        />
      )}
    </>
  );
}
