import { FaChevronRight } from "react-icons/fa6";
import { Link } from "react-router-dom";

import { menus, Menu } from "../../data/sidebar_menu.ts";
import "../../assets/css/dashboard/sidebar.css";
import Logo from "../../assets/img/jubetech_logo.png";

interface SidebarProp {
    order: number,
    toggleSidebar: boolean,
    setToggleSidebar: (value: boolean | ((prev: boolean) => boolean)) => void,
}

export default function Sidebar({ order, toggleSidebar, setToggleSidebar }:SidebarProp) {
    const currentUserRole:string[] = ["Student", "Tutor", "Admin"];
    const filteredMenus = menus.filter((menu) =>
        menu.roles.some(role => currentUserRole.includes(role))
    );
    return (
        <div className="sidebar">
            <div
                className={"toggle-sidebar " + (toggleSidebar ? "active-toggle" : "")}
                onClick={() => setToggleSidebar(!toggleSidebar)}
            >
                <i className={toggleSidebar ? "active-icon" : ""}><FaChevronRight size={14} /></i>
            </div>
            <div className="sidebar-content">
                <div className="logo-section">
                    <img src={Logo} alt="JubeTech Logo" />
                    <span className="logo-title" hidden={!toggleSidebar}>JubeTech</span>
                </div>
                <hr />
                <div className="link-sidebar">
                    <ul className={toggleSidebar ? "active-list" : "normal-list"}>
                        {filteredMenus.map((menu:Menu, index) => (
                            <Link to={menu.href} key={index}>
                                <li 
                                    className={toggleSidebar ? "active-link " + (order === index ? "active-order" : "") : "normal-link " + (order === index ? "active-order" : "")}
                                >
                                    <i><menu.icon size={15} /></i>
                                    <span hidden={!toggleSidebar}>{menu.title}</span>
                                </li>
                            </Link>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}