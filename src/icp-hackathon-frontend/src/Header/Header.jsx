import { useEffect, useState, useRef } from "react";
import { Link, Outlet, useNavigate } from "react-router";

// components
import Button from "../common/Button";

// hooks
import useStore from "../store/store.js";
import { useAuthenticatedActor } from "../common/hooks/useActor.js";
import useAuth from "../common/hooks/useAuth.js";

import "./Header.scss";

function Header() {
	const navigate = useNavigate();

	// Use the new authentication hook
	const { identity, isAuthenticated, isInitializing, login, logout } = useAuth();

	// User state from store
	const setUser = useStore(state => state.setUser);
	const setUserLoading = useStore(state => state.setUserLoading);
	const setUserCreating = useStore(state => state.setUserCreating);
	const [actorLoading, actor] = useAuthenticatedActor();

	// Check for existing authentication session on page load
	// This is now handled by the useAuth hook automatically

	async function handleLogin() {
		try {
			await login();
		} catch (error) {
			console.error("Login failed:", error);
			alert("Login failed. Please try again.");
		}
	}

	async function handleLogout() {
		try {
			await logout();
			setUser(null);
			setUserCreating(false);
		} catch (error) {
			console.error("Logout failed:", error);
			// Still clear user state even if logout fails
			setUser(null);
			setUserCreating(false);
		}
	}

	function parseBackendUser(user) {
		var user = {
			id: user.id,
			name: user.name,
			email: user.email,
			phone: user.phone_number,
			company: user.company_name,
			favorites: user.favorites_id ?? [],
			initialised: user.initialised
		};

		user.initialised = !(user.name === "" && user.email === "" && user.phone === "" && user.company === "");

		console.log("setting user", user);
		setUser(user);
		return user;
	}

	async function createEmptyUser(actor) {
		setUserCreating(true);
		try {
			const { Ok, Err } = await actor.add_empty_user();
			if (Err) {
				console.warn(Err);
				alert("An error occurred while creating user");
				setUserCreating(false);
				return;
			}

			parseBackendUser(Ok);
			navigate("/profile");
		} catch (err) {
			console.error("(creating user) backend error:" + err);
			alert("An unknown error occurred while creating account. Try again later.");
			setUserCreating(false);
		}
	}

	function fetchUser(actor) {
		setUserLoading(true);
		actor
			.get_active_user()
			.then(response => {
				if (Array.isArray(response) && response.length === 0) {
					createEmptyUser(actor);
					return;
				}

				parseBackendUser(response[0]);
			})
			.catch(error => {
				console.error("Error fetching user:", error);
				setUserLoading(false);
			});
	}

	useEffect(() => {
		// Don't proceed if auth is still initializing
		if (isInitializing) {
			return;
		}

		// Clear user if not authenticated or actor is loading
		if (!isAuthenticated || actorLoading) {
			setUser(null);
			setUserLoading(false);
			return;
		}

		// Fetch user data when authenticated and actor is ready
		if (actor) {
			fetchUser(actor);
		}
	}, [isAuthenticated, isInitializing, actorLoading, actor]);

	return (
		<>
			<header className="page-header">
				<Link to="/">
					<h1>HurtChain</h1>
				</Link>
				<div>
					{isAuthenticated ? (
						<ProfileDropdown onLogout={handleLogout} />
					) : (
						<Button onClick={handleLogin} disabled={isInitializing}>
							{isInitializing ? "Initializing..." : "Log In"}
						</Button>
					)}
				</div>
			</header>
			<Outlet />
		</>
	);
}

function ProfileDropdown({ onLogout }) {
	const [isOpen, setIsOpen] = useState(false);
	const dropdownRef = useRef(null);

	useEffect(() => {
		function handleClickOutside(event) {
			if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
				setIsOpen(false);
			}
		}

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	return (
		<div className="profile-dropdown" ref={dropdownRef}>
			<Button onClick={() => setIsOpen(!isOpen)}>
				<i className="fas fa-user"></i>
				Profile
			</Button>

			{isOpen && (
				<div className="profile-dropdown-menu">
					<Link to="/profile" onClick={() => setIsOpen(false)}>
						<div className="profile-dropdown-item">
							<i className="fas fa-circle-info"></i>
							<div className="profile-dropdown-item__label">Details</div>
						</div>
					</Link>
					<Link to="/favorites" onClick={() => setIsOpen(false)}>
						<div className="profile-dropdown-item">
							<i className="fas fa-star"></i>
							<div className="profile-dropdown-item__label">Favorites</div>
						</div>
					</Link>
					<Link to="/chat" onClick={() => setIsOpen(false)}>
						<div className="profile-dropdown-item">
							<i className="fas fa-comments"></i>
							<div className="profile-dropdown-item__label">Messages</div>
						</div>
					</Link>
					<div
						className="profile-dropdown-item"
						onClick={async () => {
							setIsOpen(false);
							await onLogout();
						}}
					>
						<i className="fas fa-arrow-right-from-bracket"></i>
						<div className="profile-dropdown-item__label">Log Out</div>
					</div>
				</div>
			)}
		</div>
	);
}

export default Header;
