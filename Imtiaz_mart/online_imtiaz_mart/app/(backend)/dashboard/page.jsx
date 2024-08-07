"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";
import Product from "@/app/(product_detail)/product/page";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Sidebar from "@/app/Components/Slidebar";
import { Button } from "@/components/ui/button";
import { any, z } from "zod";
import NavBar from "@/app/Components/Navbar";
const Page = () => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [showProducts, setShowProducts] = useState(false);
  const [showCategory, setShowCategory] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [showOrders, setShowOrders] = useState(false);
  const [category, setCategory] = useState([]);
  const [userProfile, setUserProfile] = useState([]);
  const [userOrder, setUserOrder] = useState([]);
  const [formVisible, setFormVisible] = useState(false);
  const [catName, setCatName] = useState("");
  const [img, setImg] = useState(null);
  const [updateCategory, setUpdateCategory] = useState(null);
  const [token, setToken] = useState(null);
  const [id, setId] = useState(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPassword, setUserPassword] = useState("");
  const [userPhoneNumber, setUserPhoneNumber] = useState("");
  const [userAddress, setUserAddress] = useState("");
  const [userGender, setUserGender] = useState("");
  const [userImg, setUserImg] = useState(null);
  const [updateUser, setUpdateUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const id = localStorage.getItem("id");
    setToken(token);
    setId(id);
  }, []);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/products/");
      if (response.status === 200) {
        setProducts(response.data);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error in Fetching Products");
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8000/get_category");
      if (response.status === 200) {
        setCategory(response.data);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error in Fetching Categories");
    }
  };

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8002/get_user/");
      if (response.status === 200) {
        setUserProfile(response.data);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error in Fetching User Profile");
    }
  };

  const fetchUserOrder = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8003/get_order");
      if (response.status === 200) {
        setUserOrder(response.data.orders);
      }
    } catch (error) {
      console.log(error);
      toast.error("Error in Fetching User Order");
    }
  };

  const handleShowProducts = () => {
    setShowCategory(false);
    setShowUser(false);
    setShowOrders(false);
    setShowProducts(true);
    fetchProducts();
  };

  const handleShowCategories = () => {
    setShowProducts(false);
    setShowUser(false);
    setShowOrders(false);
    setShowCategory(true);
    fetchCategories();
  };

  const handleShowUser = () => {
    setShowProducts(false);
    setShowCategory(false);
    setShowOrders(false);
    setShowUser(true);
    fetchUserProfile();
  };

  const handleShowOrder = () => {
    setShowProducts(false);
    setShowCategory(false);
    setShowUser(false);
    setShowOrders(true);
    fetchUserOrder();
  };

  const groupOrdersByUserId = (orders) => {
    return orders.reduce((groups, order) => {
      const { userId } = order;
      if (!groups[userId]) {
        groups[userId] = [];
      }
      groups[userId].push(order);
      return groups;
    }, {});
  };

  const groupedOrders = groupOrdersByUserId(userOrder);

  const formShow = () => {
    setFormVisible(true);
  };

  const UserUpdate = async (e) => {
    e.preventDefault();

    const formSchema = z.object({
      name: z.string().min(1, { message: "Name is required." }),
      email: z.string().email({ message: "Invalid email address." }),
      password: z
        .string()
        .min(8, { message: "Password must be at least 8 characters." }),
      phoneNumber: z
        .string()
        .min(10, { message: "Phone number must be at least 10 digits." }),
      address: z.string().min(1, { message: "Address is required." }),
      gender: z.enum(["Male", "Female", "Other"], {
        message: "Select a valid gender.",
      }),
      img: z
        .instanceof(FileList)
        .refine((files) => files.length === 0 || files.length === 1, {
          message: "Please upload an image or leave it unchanged.",
        }),
    });

    try {
      // Validate the form data
      formSchema.parse({
        name: userName,
        email: userEmail,
        password: userPassword,
        phoneNumber: userPhoneNumber,
        address: userAddress,
        gender: userGender,
        img: userImg ? new FileList([userImg]) : new FileList([]),
      });

      // Prepare form data
      const formData = new FormData();
      formData.append("name", userName);
      formData.append("email", userEmail);
      formData.append("password", userPassword);
      formData.append("phoneNumber", userPhoneNumber);
      formData.append("address", userAddress);
      formData.append("gender", userGender);
      if (userImg) {
        formData.append("file", userImg);
      }

      // Make the API request
      const response = await axios.post(
        `http://127.0.0.1:8002/user_update/${id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      // Handle the response
      if (response.status === 200) {
        toast.success("User updated successfully!");
        router.push("/");
      } else if (response.status === 400) {
        toast.error("Invalid data. Please check your input.");
      } else if (response.status === 401) {
        toast.error("Unauthorized access. Please check your credentials.");
      } else {
        toast.error("Unexpected error occurred.");
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        // Handle validation errors
        toast.error("Validation failed. Please check the form fields.");
        console.log(error.errors);
      } else if (error.response) {
        // Handle API errors
        if (error.response.status === 422) {
          toast.error("Validation failed. Please check the form fields.");
        } else {
          toast.error("Error occurred during update.");
        }
      } else {
        // Handle other errors
        toast.error("Update failed. Please try again.");
      }
      console.log(error);
    }
  };
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    const CategorySchema = z.object({
      name: z.string().min(1, "Name is required"),
      img: z.instanceof(File, "Image is required"),
    });

    try {
      if (!(img instanceof File)) {
        throw new Error("Invalid image file");
      }

      const formData = new FormData();
      formData.append("name", catName);
      formData.append("file", img); // Updated field name to match server expectation

      const data = {
        name: catName,
        img: img,
      };

      CategorySchema.parse(data);

      const token = localStorage.getItem("token");

      const response = await axios.post(
        "http://127.0.0.1:8000/category",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("Category added successfully");
        setFormVisible(false);
        fetchCategories();
      }
    } catch (error) {
      console.error(error);
      if (error instanceof z.ZodError) {
        toast.error("Validation error");
      } else if (error.response) {
        if (error.response.status === 422) {
          toast.error("Failed to add category. Unprocessable Entity");
          console.error("Response data:", error.response.data);
        }
      } else {
        toast.error("Network error.");
      }
    }
  };

  const handleUpdateClick = (category) => {
    setUpdateCategory(category);
    setCatName(category.name);
    setImg(null);
  };

  const handleUpdateUserClick = (user) => {
    setUpdateUser(user);
    setUserName(user.name);
    setUserEmail(user.email);
    setUserPassword("");
    setUserPhoneNumber(user.phoneNumber);
    setUserAddress(user.address);
    setUserGender(user.gender);
    setUserImg(null);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const categorySchema = z.object({
      name: z.string().min(1, "Name is Required"),
      img: z.instanceof(File, "Image is Required"),
    });
    try {
      if (img && !(img instanceof File)) {
        throw new Error("Invalid Image");
      }
      const formData = new FormData();
      formData.append("name", catName);
      if (img) formData.append("file", img);
      const data = {
        name: catName,
        img: img,
      };

      categorySchema.parse(data);

      const token = localStorage.getItem("token");

      const response = await axios.put(
        `http://127.0.0.1:8000/category_update/${updateCategory.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.status === 200) {
        toast.success("Category Update SuccessFully");
        setUpdateCategory(null);
        fetchCategories();
      }
    } catch (error) {
      console.error(error);
      if (error instanceof z.ZodError) {
        toast.error("Validation Error");
      } else if (error.response) {
        if (error.response.status === 422) {
          toast.error("Failed to Update Category Unprocessable Entity");
        }
      } else {
        toast.error("Network Error");
      }
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure to delete this Category")) return;
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(
        `http://127.0.0.1:8000/delete_category/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setCategory(
        category.filter((cat) => {
          cat.id !== id;
        })
      );

      if (response.status === 200) {
        toast.success("Category Delete SuccessFuly");
        showCategory();
      } else {
        toast.error(
          "Unauthorized: You do not have permission to delete this product."
        );
      }
    } catch (error) {
      toast.error("Error in Deleting Categories");
      console.log(error);
    }
  };

  return (
    <>
      <NavBar />
      <div className="flex">
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setSidebarOpen(false)}
          onShowProducts={handleShowProducts}
          showCategories={handleShowCategories}
          showUsers={handleShowUser}
          showOrders={handleShowOrder}
        />
        <div
          className={`flex-1 flex flex-col min-h-screen ${
            isSidebarOpen ? "ml-64" : "ml-0"
          } transition-margin duration-300`}
        >
          <h2
            onClick={toggleSidebar}
            className="text-2xl font-bold cursor-pointer p-4 bg-gray-200"
          >
            Dashboard
          </h2>
          <main className="flex-1 p-6 bg-gray-100 overflow-auto">
            {showProducts && (
              <div className="p-4">
                {products.length > 0 ? (
                  <Product products={products} />
                ) : (
                  <p>No products available</p>
                )}
              </div>
            )}

            {showCategory && (
              <div className="flex justify-center items-center min-h-screen">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                  {category.length > 0 ? (
                    category.map((cat) => (
                      <div
                        key={cat.id}
                        className="border border-gray-300 rounded-lg shadow-lg p-4"
                      >
                        {updateCategory && updateCategory.id === cat.id ? (
                          <form
                            onSubmit={handleUpdateSubmit}
                            className="border p-4 rounded"
                          >
                            <div className="mb-4">
                              <label className="block text-gray-700">
                                Name
                              </label>
                              <input
                                type="text"
                                name="name"
                                value={catName}
                                onChange={(e) => setCatName(e.target.value)}
                                className="w-full p-2 border rounded"
                              />
                            </div>
                            <div className="mb-4">
                              <label className="block text-gray-700">
                                Image
                              </label>
                              <input
                                type="file"
                                name="img"
                                onChange={(e) => {
                                  setImg(e.target.files[0]);
                                }}
                                className="w-full p-2 border rounded"
                              />
                            </div>
                            <Button
                              type="submit"
                              variant="outline"
                              className="w-full"
                            >
                              Update Category
                            </Button>

                            <Button
                              type="submit"
                              variant="outline"
                              className="w-full mt-5"
                              onClick={() => {
                                setUpdateCategory(null);
                              }}
                            >
                              Close
                            </Button>
                          </form>
                        ) : (
                          <div className="border border-gray-300 rounded-lg shadow-lg p-4">
                            <img
                              className="mx-auto rounded-full h-24 w-24 mb-4"
                              src={cat.imgUrl}
                              alt={cat.name}
                            />
                            <p className="text-center">{cat.name}</p>
                            <div className="text-center">
                              <Button
                                variant="outline"
                                className="m-4"
                                onClick={() => handleUpdateClick(cat)}
                              >
                                Update Category
                              </Button>

                              <Button
                                variant="outline"
                                className="m-4"
                                onClick={() => handleDelete(cat.id)}
                              >
                                Delete Category
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="text-center col-span-full">
                      No categories found.
                    </p>
                  )}
                  <div className="text-center col-span-full">
                    {formVisible ? (
                      <form
                        onSubmit={handleFormSubmit}
                        className="border p-4 rounded mx-auto w-full max-w-md"
                      >
                        <div className="mb-4">
                          <label className="block text-gray-700">Name</label>
                          <input
                            type="text"
                            name="name"
                            value={catName}
                            onChange={(e) => setCatName(e.target.value)}
                            className="w-full p-2 border rounded"
                          />
                        </div>
                        <div className="mb-4">
                          <label className="block text-gray-700">Image</label>
                          <input
                            type="file"
                            name="img"
                            onChange={(e) => setImg(e.target.files[0])}
                            className="w-full p-2 border rounded"
                          />
                        </div>
                        <Button
                          type="submit"
                          variant="outline"
                          className="w-full"
                        >
                          Add Category
                        </Button>

                        <Button
                          type="submit"
                          variant="outline"
                          className="w-full mt-5"
                          onClick={() => {
                            setFormVisible(false);
                            setCatName("");
                            setImg(null);
                          }}
                        >
                          Close
                        </Button>
                      </form>
                    ) : (
                      <Button variant="outline" onClick={formShow}>
                        Add Category
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}

            {showOrders && (
              <div className="grid grid-cols-1 gap-4 p-4">
                {(() => {
                  const filteredOrders = id
                    ? { [id]: groupedOrders[id] }
                    : groupedOrders;

                  return Object.keys(filteredOrders).length > 0 ? (
                    Object.keys(filteredOrders).map((userId) => {
                      const orders = filteredOrders[userId] || [];
                      const totalBill = orders.reduce(
                        (total, order) =>
                          total + order.productPrice * order.productQuantity,
                        0
                      );
                      return (
                        <div
                          key={userId}
                          className="bg-white shadow-md rounded-lg p-4"
                        >
                          <h2 className="text-xl font-bold mb-4">
                            User ID: {userId}
                          </h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {orders.map((order, id) => (
                              <div
                                className="border border-gray-300 rounded-lg shadow-lg p-4"
                                key={id}
                              >
                                <div className="text-center">
                                  <h2 className="text-lg mb-2">
                                    Product Name: {order.productName}
                                  </h2>
                                  <h2 className="text-lg mb-2">
                                    Product Price: Rs {order.productPrice}
                                  </h2>
                                  <h2 className="text-lg mb-2">
                                    Product Quantity: {order.productQuantity}
                                  </h2>
                                </div>
                              </div>
                            ))}
                          </div>
                          <div className="mt-4">
                            <h2 className="text-lg font-semibold">
                              Total Bill: Rs {totalBill}
                            </h2>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <p>No orders found.</p>
                  );
                })()}
              </div>
            )}

            {showUser && (
              <div>
                {id ? (
                  <div className="flex">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                      {showUser && userProfile.length > 0 ? (
                        userProfile
                          .filter((user) => user.id == id) // Correctly filter users based on ID
                          .map((user) => (
                            <div
                              key={user.id}
                              className="border border-gray-300 rounded-lg shadow-lg p-4"
                            >
                              {UserUpdate && UserUpdate.id === user.id ? (
                                <form
                                  onSubmit={UserUpdate}
                                  className="border p-4 rounded"
                                >
                                  <div className="mb-4">
                                    <label className="block text-gray-700">
                                      Name
                                    </label>
                                    <input
                                      type="text"
                                      name="name"
                                      value={userName}
                                      onChange={(e) =>
                                        setUserName(e.target.value)
                                      }
                                      className="w-full p-2 border rounded"
                                    />
                                  </div>
                                  <div className="mb-4">
                                    <label className="block text-gray-700">
                                      Email
                                    </label>
                                    <input
                                      type="email"
                                      name="email"
                                      value={userEmail}
                                      onChange={(e) =>
                                        setUserEmail(e.target.value)
                                      }
                                      className="w-full p-2 border rounded"
                                    />
                                  </div>
                                  <div className="mb-4">
                                    <label className="block text-gray-700">
                                      Password
                                    </label>
                                    <input
                                      type="password"
                                      name="password"
                                      value={userPassword}
                                      onChange={(e) =>
                                        setUserPassword(e.target.value)
                                      }
                                      className="w-full p-2 border rounded"
                                    />
                                  </div>
                                  <div className="mb-4">
                                    <label className="block text-gray-700">
                                      Phone Number
                                    </label>
                                    <input
                                      type="text"
                                      name="phoneNumber"
                                      value={userPhoneNumber}
                                      onChange={(e) =>
                                        setUserPhoneNumber(e.target.value)
                                      }
                                      className="w-full p-2 border rounded"
                                    />
                                  </div>
                                  <div className="mb-4">
                                    <label className="block text-gray-700">
                                      Address
                                    </label>
                                    <input
                                      type="text"
                                      name="address"
                                      value={userAddress}
                                      onChange={(e) =>
                                        setUserAddress(e.target.value)
                                      }
                                      className="w-full p-2 border rounded"
                                    />
                                  </div>
                                  <div className="mb-4">
                                    <label className="block text-gray-700">
                                      Gender
                                    </label>
                                    <select
                                      name="gender"
                                      value={userGender}
                                      onChange={(e) =>
                                        setUserGender(e.target.value)
                                      }
                                      className="w-full p-2 border rounded"
                                    >
                                      <option value="">Select Gender</option>
                                      <option value="Male">Male</option>
                                      <option value="Female">Female</option>
                                      <option value="Other">Other</option>
                                    </select>
                                  </div>
                                  <div className="mb-4">
                                    <label className="block text-gray-700">
                                      Profile Image
                                    </label>
                                    <input
                                      type="file"
                                      name="img"
                                      onChange={(e) =>
                                        setUserImg(e.target.files[0])
                                      }
                                      className="w-full p-2 border rounded"
                                    />
                                  </div>
                                  <Button
                                    type="submit"
                                    variant="outline"
                                    className="w-full"
                                  >
                                    Update User
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    className="w-full mt-5"
                                    onClick={() => setUpdateUser(null)}
                                  >
                                    Close
                                  </Button>
                                </form>
                              ) : (
                                <div className="border border-gray-300 rounded-lg shadow-lg p-4">
                                  <img
                                    className="mx-auto rounded-full h-24 w-24 mb-4"
                                    src={user.imgUrl}
                                    alt={user.name}
                                  />
                                  <p className="text-center font-black">
                                    {user.name}
                                  </p>
                                  <p className="text-center font-black">
                                    {user.email}
                                  </p>
                                  <p className="text-center text-black">
                                    {user.PhoneNumber}
                                  </p>
                                  <p className="text-center text-black">
                                    {user.Gender}
                                  </p>
                                  <p className="text-center text-black">
                                    {user.Address}
                                  </p>
                                  <div className="text-center">
                                    <Button
                                      variant="outline"
                                      className="m-4"
                                      onClick={() =>
                                        handleUpdateUserClick(user)
                                      }
                                    >
                                      Update User
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ))
                      ) : (
                        <p className="text-center col-span-full">
                          No users found.
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-center items-center min-h-screen">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                      {showUser && userProfile.length > 0 ? (
                        userProfile.map((user) => (
                          <div
                            key={user.id}
                            className="border border-gray-300 rounded-lg shadow-lg p-4"
                          >
                            <img
                              src={user.imgUrl}
                              alt={user.name}
                              className="mx-auto rounded-full h-24 w-24 mb-4"
                            />
                            <div className="text-center">
                              <p className="text-xl font-bold mb-2">
                                {user.name}
                              </p>
                              <p className="text-gray-600">{user.email}</p>
                              <p className="text-gray-600">
                                {user.PhoneNumber}
                              </p>
                              <p className="text-gray-600">{user.Gender}</p>
                              <p className="text-gray-600">{user.Address}</p>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-center col-span-full">
                          No users found.
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </main>
        </div>

        <ToastContainer />
      </div>
    </>
  );
};

export default Page;