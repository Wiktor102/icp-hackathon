import React from "react";
import { BrowserRouter, Route, Routes } from "react-router";

// components
import Home from "./Home/Home";
import Header from "./Header/Header";
import Profile from "./pages/Profile/Profile.jsx";
import Favorites from "./pages/Favorites/Favorites.jsx";
import AddListing from "./pages/AddListing/AddListing.jsx";
import ListingDetails from "./pages/ListingDetails/ListingDetails.jsx";
import Chat from "./pages/Chat/Chat.jsx";

// hooks
import useFetchCategories from "./common/hooks/useFetchCategories";
import useFetchListings from "./common/hooks/useFetchListings";
import { useFetchUserListings } from "./common/hooks/useFetchUserListings";

// styles
import "./common/scss/loaders.min.css";

function App() {
	useFetchListings();
	useFetchCategories();
	useFetchUserListings();

	// Authentication is now handled by the useAuth hook in Header component

	return (
		<BrowserRouter>
			<Routes>
				<Route element={<Header />}>
					<Route path="/" element={<Home />} />
					<Route path="/profile" element={<Profile />} />
					<Route path="/favorites" element={<Favorites />} />
					<Route path="/add" element={<AddListing />} />
					<Route path="/product/:productId" element={<ListingDetails />} />
					<Route path="/chat" element={<Chat />} />
					<Route path="/chat/:conversationId" element={<Chat />} />
				</Route>
			</Routes>
		</BrowserRouter>
	);
}

export default App;
