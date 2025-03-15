import { useState } from "react";
import { Link } from "react-router-dom";
import "../../assets/css/dashboard/topbar.css";
import Avatar from "../../assets/img/avatar-test.png";
import { logout } from "../../services/authorize.ts";

import { FaAngleDown, FaPowerOff } from "react-icons/fa6";

export default function Topbar({ title }:{ title:string }) {
    const [toggleDropdown, setToggleDropdown] = useState<boolean>(false);

    return (
        <div className="topbar">
            <div></div>
            {/* <div className="title-dashboard">
                <h1>{title}</h1>
            </div> */}
            {/* Avatar */}
            <div className="avatar-info" onClick={() => setToggleDropdown(!toggleDropdown)}>
                <img src={Avatar} alt="avatar" />
                <div className="avatar-content">
                    <p>Kanasanan Hanthongchai</p>
                    <span>Admin</span>
                </div>
                <i><FaAngleDown /></i>
            </div>
            {/* Dropdown */}
            <div className={"avatar-dropdown " + (toggleDropdown ? "active-dropdown" : "")}>
                <ul>
                    <Link to="#">
                        <li>
                            โปรไฟล์ของฉัน
                        </li>
                    </Link>
                    <Link to="#">
                        <li>
                            ตั้งค่าบัญชี
                        </li>
                    </Link>
                    <Link to="#">
                        <li>
                            สอบถามและรายงานปัญหา
                        </li>
                    </Link>
                    <hr />
                    <Link to="#" onClick={logout}>
                        <li>
                            ออกจากระบบ
                            <i><FaPowerOff /></i>
                        </li>
                    </Link>
                </ul>
            </div>
        </div>
    );
}