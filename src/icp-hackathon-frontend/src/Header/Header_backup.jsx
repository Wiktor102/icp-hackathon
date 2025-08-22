import { useEffect, useState, useRef } from "react";
import { Link, Outlet, useNavigate } from "react-router";

// components
import Button from "../common/Button";

// hooks
import useAuth from "../common/hooks/useAuth.js";
import useUser from "../common/hooks/useUser.js";

import "./Header.scss";

function Header() {
	const navigate = useNavigate();

	// Authentication
	const { isAuthenticated, isInitializing, login, logout } = useAuth();
	
	// User management with React Query
	const { 
		user, 
		isLoading: userLoading, 
		isCreatingUser, 
		error: userError 
	} = useUser();

	const handleLogin = async () => {
		try {
			await login();
		} catch (error) {
			console.error("Login failed:", error);
			alert("Login failed. Please try again.");
		}
	};

	const handleLogout = async () => {
		try {
			await logout();
		} catch (error) {
			console.error("Logout failed:", error);
			// Logout will be handled by the useUser hook
		}
	};

	// Show error alerts for user-related errors
	useEffect(() => {
		if (userError && !userError.message?.includes("Invalid signature")) {
			console.error("User error:", userError);
			alert(`Error: ${userError.message || "An unknown error occurred"}`);
		}
	}, [userError]);

	return (
		<>
			<header className="page-header">
				<Link to="/">
					<h1>HurtChain</h1>
				</Link>
				<div>
					{isAuthenticated ? (
						<ProfileDropdown 
							onLogout={handleLogout}
							userLoading={userLoading || isCreatingUser}
						/>
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

function ProfileDropdown({ onLogout, userLoading }) {
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
			<Button onClick={() => setIsOpen(!isOpen)} disabled={userLoading}>
				<i className="fas fa-user"></i>
				{userLoading ? "Loading..." : "Profile"}
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
